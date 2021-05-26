//alert("Hello, France!")

/* ---------------------------- */
/* VARIABLES                    */
/* ---------------------------- */

const w = 550; // Width of canvas 
const h = 550; // Height of canvas

// Set dimensions with respect to margins
let margins = {top: 10, right: 40, left: 20, bottom: 15}
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
                .attr("width", dimensions.width + margins.left)
                .attr("height", dimensions.height + margins.top)
                .call(zoom);

// Creates div element for tooltip (https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html#mostbasic)
let div = d3.select("body")
    .append("div")
        .attr("class", "tooltip")
        .style("top", "350px")
        .style("left", "550px");

// Div element for zooming
let div_zoom = d3.select("body")
    .append("div")
        .attr("id", "dataviz_basicZoom");

// Input element for checkbox
let checkbox = d3.select("body")
    .append("label")
        .attr("for", "myCheckbox")
        .text("Only cities >= 20k inhabitants")
        .style("position", "absolute")
        .style("top", "55px")
        .style("left", "550px")
    .append("input")
        .attr("type", "checkbox")
        .attr("id", "myCheckbox")
        .attr("class", "checkbox")
        .attr("value", 10000);

// Buttons
let button1 = d3.select("body")
    .append("button") 
        .attr("class", "button1")
        .attr("type", "button")
        .text("Color by department")
        .style("position", "absolute")
        .style("top", "85")
        .style("left", "550px")    
        .on("click", callbackButton1);

let button2 = d3.select("body")
    .append("button") 
        .attr("class", "button2")
        .attr("type", "button")
        .text("Color by density")
        .style("position", "absolute")
        .style("top", "85")
        .style("left", "710px")    
        .on("click", callbackButton2);

/* ---------------------------- */
/* LOAD DATA                    */
/* ---------------------------- */

// Load data from .tsv file with d3 + preprocess them
d3.tsv("data/france.tsv")
    // Preprocessing of columns (d refers to column and i to row index)
    .row( (d, i) => {
        if ((d.x != "NaN") && (d.y != "NaN") && (d["Postal Code"] != "NaN")){
            return {
                codePostal: +d["Postal Code"],
                inseeCode: +d.inseecode,
                place: d.place,
                longitude: +d.x,
                latitude: +d.y,
                population: +d.population,
                density: +d.density,
                region: +(d["Postal Code"].substring(0, 2))
            };
        }
    })
    // Creates get Data and calls Draw function
    .get( (error, rows) => {
        console.log("Loaded " + rows.length + " rows");
        if (rows.length > 0) {
            //console.log("First row: ", rows[0]) // Print results in console for debugging
            //console.log("Last  row: ", rows[rows.length-1])
            dataset = rows; // Fill global var dataset with rows
            draw(dataset); // Call drawing function
        }
    });

/* ---------------------------- */
/* FUNCTIONS                    */
/* ---------------------------- */

// Drawing circles function
function draw(data_param) {

    // Scalers for latitude and longitude
    x = d3.scaleLinear()
        .domain(d3.extent(dataset, (d) => d.longitude)) // Scaler input
        .range([margins.left + 10, dimensions.width]); // Scaler output
    y = d3.scaleLinear()
        .domain(d3.extent(dataset, (d) => d.latitude)) 
        .range([dimensions.height, margins.bottom + 10]); // Reversed scale for latitude
    // Sets radius of circle proportional to population
    radius = d3.scaleLinear()
        .domain(d3.extent(dataset, (d) => d.population)) 
        .range([1, 40]);
    // Sets color of circle proportional to sqrt(density)
    density_color = d3.scaleLinear()
        .domain(d3.extent(dataset, (d) => Math.sqrt(d.density))) 
        .range(["rgb(20, 160, 215)", "rgb(10, 60, 80)"]);
    // Sets color of circle proportional to region number
    region_color = d3.scaleSequential()
        .domain(d3.extent(dataset, (d) => d.region))
        //.interpolator(d3.interpolateSpectral);
        .interpolator(d3.interpolateRainbow);
        //.range(["rgb(150, 245, 155)", "rgb(60, 95, 60)"]);

    // Bind data to circles
    svg.selectAll("circle")
        .data(data_param)
        .enter()
        .append("circle")
            .attr("cx", (d) => x(-0.13462876)) // sets x of new circle as scaled longitude of data point
            .attr("cy", (d) => y(0.795521)) // sets y of new circle as scaled latitude of data point
            .attr("r", (d) => radius(d.population)) // sets radius proportional to population
            .attr("fill", (d) => density_color(d.density)) // sets color of circle proportional to sqrt(density)
            .classed("small", (d) => {return d.population <= 20000})
        // Hovering calls
        .on("mouseover", onMouseEnter)
        .on("mouseout", onMouseLeave) 
    ;
    
    svg.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", (d) => x(d.longitude)) // sets x of new circle as scaled longitude of data point
        .attr("cy", (d) => y(d.latitude))
        .delay(function(d,i){ return 0.8*i; }) ;
    
    
    // Add axes with info
    svg.append("g")
        .attr("transform", "translate(" + margins.left-10 + ", " + margins.top  + ")")
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
        .attr("transform", "translate(" + margins.left + ", " + margins.bottom-10 + ")")
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
        .text("Population and density in France");
}

// Calls update whenever checkbox changes
d3.selectAll(".checkbox")
    .on("change", update);

// Update function : Change colors of circles based on checkbox choices
function update(){
    let choice = 0;

    // Retrieve choices from checkboxes
    d3.selectAll(".checkbox").each(function (d){
        cb = d3.select(this);
        if (cb.property("checked")){
            choice = cb.property("value");
        }
    });
    // Perform actions related to checkboxe's choice
    if (choice > 0){
        //newData = dataset.filter(function(d){return d.population > choice});
        // Colors in white circles with population less than condition                
        console.log("Checkbox checked");
        svg.selectAll("circle.small")
            .attr("fill", "rgb(255,255,255)");

    } else {
        console.log("Checkbox unchecked");
        // Recolor Data with respect to each circle's parameters
        svg.selectAll("circle.small")
            .attr("cx", (d) => x(d.longitude)) // sets x of circle as scaled longitude of data point
            .attr("cy", (d) => y(d.latitude)) // sets y of circle as scaled latitude of data point
            .attr("r", (d) => radius(d.population)) // sets radius proportional to population
            .attr("fill", (d) => density_color(d.density)) // sets color of circle proportional to sqrt(density)
            ;
    }
}

// Inspired from https://wattenberger.com/blog/d3-interactive-charts
function onMouseEnter(d){
    d3.select(this)
        .transition()
            .duration("100")
            .attr("r", (d) => Math.sqrt(d.population/1000) + 12); // Augment size when hovering
    
    // Displays textual info on data when hovering
    div.transition()
        .duration("100")
        .style("visibility", "visible")
        .style("font-size","20px");
    div.html(d.place + " (" + d.codePostal + ") | Density : " + d.density + " (h/km<sup>2</sup>)");    
}

function onMouseLeave(d){
    d3.select(this).transition()
        .duration("100")
        .attr("r", (d) => Math.sqrt(d.population/1000)); // Downsize when hovering is finished
    
    div.transition()
        .style("visibility", "hidden") // Hides information when hovering is finished
}

// Buttons callback functions
function callbackButton1(d){
    d3.selectAll("circle")
        .attr("fill", (d) => region_color(d.region));
}
function callbackButton2(d){
    d3.selectAll("circle")
        .attr("fill", (d) => density_color(d.density));
}


