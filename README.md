<h1>Interactive map using D3.js</h1></

<p align="center">
  <img src='img/technos.png' height=70 width=250 />
</p>

As stated in the [official documentation](https://github.com/d3/d3/wiki), D3 is "JavaScript library for visualizing data  using web standards".

In this project, we use this library to visualize a map of France, and give the user a few information about **population** and **density** of cities, while providing him with a few **interactions** to get a better understanding of data.

<p align="center">
    <img src='img/map.gif'>
</p>

### 1. Data

The original dataset contains information about every city in France. It is available in `data/france.tsv` and has shape (35250, 7).
The 7 dimensions are :
* `Postal Code` of cities  
* `x` and `y` refering to latitude and longitude of cities  
* `inseecode`  
* `place` : names of cities  
* `population`  
* `density`  

### 2. Architecture  

#### 2.1 `index.html`  

HTML link where interactive map is available.

#### 2.2 `js/hello-france.js`  

Javascript file containing :  
* Canvas defintion to represent map of france  
* Load and preprocessing of data  
* Callback functions for user's interactions with the map  

#### 2.3 `css/france.css`  

CSS file containg different styles to be applied on each D3 feature.

### 3. Interactions

The possible interactions availables are : 
* When opening the web-page, every department is loacted on the map based on its number ascending order
* **Zooming**  
* **Filtering data** : 
    - a checkbox allows user to filter the map and sees cities with more than 20K inhabitants only  
    - buttons allow user to filter the map according to departments in France  
* **Hovering** : information about hovered places is displayed on the right of the screen

