//alert("Hello, France!")

/* ---------------------------- */
/* VARIABLES                    */
/* ---------------------------- */

const w = 550; // Width of canvas 
const h = 550; // Height of canvas

// Set dimensions with respect to margins
let margins = {top: 10, right: 20, left: 20, bottom: 15}
let dimensions = {width: w + margins.left + margins.right, height: h + margins.top + margins.bottom}

// Global variable to store data
let dataset = []; 

// Zooming variable
let zoom = d3.zoom()
    .scaleExtent([.5, 20]) // controls unzoom
    .extent([[0, 0], [w, h]])
    .on("zoom", function() {svg.attr("transform", d3.event.transform)});

/* ---------------------------- */
/* CANVAS                       */
/* ---------------------------- */

// Create SVG element
let svg = d3.select("body")
            .append("svg")
                .attr("width", dimensions.width)
                .attr("height", dimensions.height)
                .call(zoom);

// Creates div element for tooltip (https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html#mostbasic)
let div = d3.select("body")
    .append("div")
        .attr("class", "tooltip");

// Div element for zooming
let div_zoom = d3.select("body")
    .append("div")
        .attr("id", "dataviz_basicZoom");

// Div element for checkbox
let checkbox = d3.select("body")
    .append("input")
        .attr("type", "checkbox")
        .attr("class", "checkbox")
        .style("position", "absolute")
        .style("top", "50px")
        .style("left", "500px")
        .attr("value", 10000)
        .attr("label", "unlabelTest")
    .append("label", "Only cities with < 20k inhabitants");
    

/* ---------------------------- */
/* LOAD DATA                    */
/* ---------------------------- */

// Load data from .tsv file with d3 + preprocess them
d3.tsv("data/france.tsv")
    // Preprocessing of columns (d refers to column and i to row index)
    .row( (d, i) => {
        if (d.x != "NaN" && (d.y != "Nan")){
            return {
                codePostal: +d["Postal Code"],
                inseeCode: +d.inseecode,
                place: d.place,
                longitude: +d.x,
                latitude: +d.y,
                population: +d.population,
                density: +d.density
            };
        }
    })
    // Print results in console for debugging
    .get( (error, rows) => {
        console.log("Loaded " + rows.length + " rows");
        if (rows.length > 0) {
            console.log("First row: ", rows[0])
            console.log("Last  row: ", rows[rows.length-1])
        
            // Scalers for latitude and longitude
            x = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.longitude)) // Scaler input
                .range([margins.left, margins.left + dimensions.width]); // Scaler output
            y = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.latitude))
                .range([margins.bottom + dimensions.height, margins.bottom]); // Reversed scale for latitude

            // Sets radius of circle proportional to population
            radius = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.population))
                .range([1, 40]);

            // Sets color of circle proportional to sqrt(density)
            color = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => Math.sqrt(row.density)))
                .range(["rgb(20, 160, 2015)", "rgb(10, 60, 80)"]);

            dataset = rows; // Fill global var dataset with rows
            draw(dataset); // Call drawing function
        }
    });

/* ---------------------------- */
/* FUNCTIONS                    */
/* ---------------------------- */

// Drawing circles function
function draw(data_param) {
    svg.selectAll("circle")
        .data(data_param)
        .enter()
        .append("circle")
        //.append("circle")
            //.attr("width", 1) // sets width of new rect
            //.attr("height", 1) // sets height of new rect
            .attr("cx", (d) => x(d.longitude)) // sets x of new circle as scaled longitude of data point
            .attr("cy", (d) => y(d.latitude)) // sets y of new circle as scaled latitude of data point
            .attr("r", (d) => radius(d.population)) // sets radius proportional to population
            .attr("fill", (d) => color(d.density)) // sets color of circle proportional to sqrt(density)
        // Hovering methods
        .on("mouseover", onMouseEnter)
        .on("mouseout", onMouseLeave) 
    ;
    // Add axes with info
    svg.append("g")
        .attr("transform", "translate(0, " + dimensions.height - margins.bottom - margins.top  + ")")
        .call(d3.axisBottom(x))
        .append('text')
            .attr('text-anchor', 'end')
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('x', w - 50)
            .attr('y', margins.bottom + 13)
            .text('Longitude');
    svg.append("g")
        .attr("transform", "translate(0, " + dimensions.width - margins.left - margins.right + ") rotate(-90)")
        .call(d3.axisRight(y))
        .append('text')
            .attr("transform", "translate(" + 50 + ", " + 500 + ") rotate(-90)")
            .attr('text-anchor', 'end')
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text('Latitude');
    
    // Add title
    svg.append("text")
        .attr('x', w - 220)
        .attr('y', 550)
        .attr("text-anchor", "middle")
        .style('font-size', '16px')
        .style("font-weight", "bold")
        .text("Population and densisty in France");
}

// Call update whenever checkbox changes
d3.selectAll(".checkbox")
    .on("change", update);
update(); // Call update function

// Update function
function update(){
    let choice = 0;
    d3.selectAll(".checkbox").each(function (d){
        cb = d3.select(this);
        console.log("value cb " + cb.property("value"));
        if (cb.property("checked")){
            choice = cb.property("value");
            console.log("CB is checked " + choice);
        }
    });
    if (choice > 0){
        newData = dataset.filter(function(d){return d.population <= choice});
        console.log("Length new Data " + newData.length);
        svg.selectAll("circle")
            .data(dataset.population <= choice)
            .enter()
            .append("circle")
            .attr("fill", "rgb(255,255,255)");
        //svg.selectAll("circle")
        //    .remove();
        //draw(newData);
    } else {
        newData = dataset;
        console.log("Length new Data " + newData.length);
        //draw(newData);
    }
}

// Inspired from https://wattenberger.com/blog/d3-interactive-charts
function onMouseEnter(d){
    d3.select(this)
        .transition()
            .duration("100")
            .attr("r", (d) => Math.sqrt(d.population/1000) + 12); // Augment size when hovering
    
    div.transition()
        .duration("100")
        .style("visibility", "visible")
        .style("font-size","20px")
        .text(d.place + " (" + d.codePostal + ") | Density : " + d.density);    
}

function onMouseLeave(d){
    d3.select(this).transition()
        .duration("100")
        .attr("r", (d) => Math.sqrt(d.population/1000)); // Downsize when hovering is finished
    div.transition()
        .style("visibility", "hidden")
}


