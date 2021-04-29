# js-library-zhouze2

Link to landing page: https://hidden-hollows-16001.herokuapp.com  
Link to documentation: https://hidden-hollows-16001.herokuapp.com/doc.html

## Getting Started

The scripts that need to be included are the library code for this library, which is animal_sim.js. No other external libraries or CSS files are needed. Below is basic functionality to create an info display, resource chart builder, and simulation builder. These are main objects used in the library.  

const infoDisplay = new infoDisplayBuilder("displayInfoContainer")  
const resChartBuilder = new resourceChartBuilder("resourceChartContainer", "berries", 300, 200, 10)  
const simBuilder = new simulationBuilder("mapContainer", resChartBuilder, infoDisplay, "images/great-lakes.jpg", false, 800, 480, 20, 100, 50, 40, 100)
