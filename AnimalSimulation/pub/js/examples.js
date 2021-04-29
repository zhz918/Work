"use strict";


// Info display code for sim1
const infoDisplay = new infoDisplayBuilder("displayInfoContainer")

const bearAlt = "Brown bear facing front"
const bearDesc = "Generally living in more remote areas, bears have no predators in most regions."
infoDisplay.addAnimalType("bear", "images/bear.png", bearAlt, bearDesc, 5, 8, "land", ["squirrel", "anteater"], [["berries", 10, 15]], 10, 50)

const crocodileAlt = "Crocodile facing right with mouth open"
const crocodileDesc = "A major marine predator in the southern lakes and have been known to move far away from water to catch prey."
infoDisplay.addAnimalType("crocodile", "images/crocodile.png", crocodileAlt, crocodileDesc, 6, 10, "water", ["squirrel"], [], 15, 30)

const squirrelAlt = "Squirrel with white, gray, and brown fur lying still"
const squirrelDesc = "Very quick and small animals that nonetheless end up often as roadkill."
infoDisplay.addAnimalType("squirrel", "images/squirrel.png", squirrelAlt, squirrelDesc, 10, 15, "land", [], [], 40, 10)

const anteaterAlt = "Squirrel with white, gray, and brown fur lying still"
const anteaterDesc = "Although humid regions are not normally their habitat, these areas sometimes have many ants and few predators for them."
infoDisplay.addAnimalType("anteater", "images/anteater.png", anteaterAlt, anteaterDesc, 8, 5, "land", [], [], 25, 20)

const resChartBuilder = new resourceChartBuilder("resourceChartContainer", "berries", 300, 200, 10)

resChartBuilder.buildChart()

// Simulation code
const simBuilder = new simulationBuilder("mapContainer", resChartBuilder, infoDisplay, "images/great-lakes.jpg", false, 800, 480, 100, 100, 50, 40, 100)


simBuilder.defineWaterRegion(30, 315, 106, 203)
simBuilder.defineWaterRegion(370, 455, 227, 353)
simBuilder.defineWaterRegion(220, 269, 254, 443)
simBuilder.defineWaterRegion(559, 678, 291, 320)
simBuilder.defineWaterRegion(404, 578, 366, 448)
simBuilder.defineWaterRegion(453, 518, 214, 279)
simBuilder.defineWaterRegion(536, 625, 320, 343)

simBuilder.addAnimalOnMap("bear", 600, 150, true)
simBuilder.addAnimalOnMap("bear", 170, 360, true)
simBuilder.addAnimalOnMap("bear", 200, 310, true)
simBuilder.addAnimalOnMap("crocodile", 219, 160, true)
simBuilder.addAnimalOnMap("crocodile", 420, 420, true)
simBuilder.addAnimalOnMap("crocodile", 400, 300, true)
simBuilder.addAnimalOnMap("squirrel", 560, 50, true)
simBuilder.addAnimalOnMap("squirrel", 100, 390, true)
simBuilder.addAnimalOnMap("squirrel", 750, 400, true)
simBuilder.addAnimalOnMap("anteater", 600, 50, true)
simBuilder.addAnimalOnMap("anteater", 160, 250, true)
simBuilder.addAnimalOnMap("anteater", 630, 330, true)

simBuilder.addResourceType("berries", 1000, 2000, 30)


simBuilder.addControlPanel("user")
