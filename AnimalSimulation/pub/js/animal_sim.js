"use strict";

(function(global, document) {

    function infoDisplayBuilder(infoContainerId) {
        this.infoDisplay = document.getElementById(infoContainerId)
        this.animalTypes = []
    }


    infoDisplayBuilder.prototype = {

        // Add a new animal type listing to the info display bar
        addAnimalType: function(name, imageSrc, imageAlt, description, maxCount, speed,
                positionType, preyList, resourcesNeeded, reproductionChance, intelligence) {
            // Ensure this animal type has not been added before
            if (this.getEntryIndex(name) !== -1) {
                console.log("Animal type to be added already exists")
                return;
            }

            const newAnimalSection = document.createElement("section")
            newAnimalSection.style = "border:3px solid black;margin:10px;padding:10px;width:300px"
            newAnimalSection.setAttribute("id", `${name}Section`)

            const titleContainer = document.createElement("h2")
            titleContainer.style = "margin:0px"
            const title = document.createTextNode(name)
            titleContainer.appendChild(title)

            const descContainer = document.createElement("div")
            descContainer.style = "width:300px"
            const descText = document.createTextNode(description)
            descContainer.appendChild(descText)

            const img = document.createElement("img")
            img.setAttribute("src", imageSrc)
            img.setAttribute("alt", imageAlt)
            img.style = "max-width:200px;max-height:80px;margin-top:10px"

            newAnimalSection.appendChild(titleContainer)
            newAnimalSection.appendChild(descContainer)
            newAnimalSection.appendChild(img)

            this.infoDisplay.appendChild(newAnimalSection)

            // Keep track of the new animal type added
            const newAnimalInfo = {
                "name": name,
                "imageSrc": imageSrc,
                "description": description,
                "speed": speed,
                "positionType": positionType,
                "preyList": preyList,
                "resourcesNeeded": resourcesNeeded,
                "reproductionChance": reproductionChance,
                "maxCount": maxCount,
                "intelligence": intelligence
            }

            this.animalTypes.push(newAnimalInfo)
        },

        removeAnimalType: function(name) {
            const sectionToRemove = this.infoDisplay.getElementById(`${name}Section`)
            this.infoDisplay.removeChild(sectionToRemove)

            const index = this.getEntryIndex(name)
            if (index === -1) {
                console.log("Animal type to be removed does not exist")
            } else {
                _animalTypes.splice(index, 1)
            }
        },

        getEntryIndex: function(type) {
            return this.animalTypes.findIndex(animalType => animalType["name"] === type)
        },

    }

    function simulationBuilder(mapContainerId, resChartBuilder, infoDisplay,
            mapImgSrc, allowUserEditing, mapWidth, mapHeight, mapInterval, resInterval,
            preyCatchDistance, reproductionDistance, pursueRadius) {
        this.simContainer = document.getElementById("simContainer")
        this.mapContainer = document.getElementById(mapContainerId)
        this.mapContainerData = null
        this.controlsContainer = null
        this.infoDisplay = infoDisplay
        this.mapImgSrc = mapImgSrc
        this.allowUserEditing = allowUserEditing
        this.resChartBuilder = resChartBuilder
        this.mapWidth = mapWidth
        this.mapHeight = mapHeight
        this.initialAnimals = []
        this.animals = []
        this.maxId = 0
        this.animalIds = []
        this.simStart = false
        this.isSpedUp = false
        this.mapInterval = mapInterval
        this.resInterval = resInterval
        this.startRetMap = 0
        this.startRetRes = 0
        this.firstWaterSelection = true
        this.waterRegions = []
        this.inWaterSelection = false
        this.currWaterSelections = []
        this.hourCounter = 1
        this.preyCatchDistance = preyCatchDistance
        this.resources = []
        this.initialResources = []
        this.reproductionDistance = reproductionDistance
        this.animalCounts = {}
        this.pursueRadius = pursueRadius
    }

    simulationBuilder.prototype = {

        // The positioning of the new animal is x pixels from the left of the
        // map and y pixels from the top of the map
        addAnimalOnMap: function(animalType, x, y, isInitial) {
            if (x < 0 || x > this.mapWidth || y < 0 || y > this.mapHeight) {
                console.log("Animal was not added: coordinates outside map boundaries")
                return
            }

            const animalTypeInfo = this.getAnimalTypeInfo(animalType)
            const type = animalTypeInfo["name"]
            const imageSrc = animalTypeInfo["imageSrc"]

            const animalInfo = {
                "id": this.maxId,
                "type": type,
                "x": x,
                "y": y,
                "xPursueInc": null,
                "yPursueInc": null
            }

            if (!this._isValidWaterPosition(animalInfo, x, y)) {
                console.log("Animal does not have a valid water position")
                return -1
            }

            const token = document.createElement("img")
            token.setAttribute("src", imageSrc)
            token.style = `max-width:30px;max-height:30px;position:absolute;left:${x}px;top:${y}px`

            token.setAttribute("id", `animal${this.maxId}`)

            this.mapContainer.appendChild(token)

            this.animalIds.push(animalInfo["id"])
            this.animals.push(animalInfo)
            if (isInitial) {
                const animalInfoCopy = {
                    "id": this.maxId,
                    "type": type,
                    "x": x,
                    "y": y,
                }
                this.initialAnimals.push(animalInfoCopy)
            }

            if (!Object.keys(this.animalCounts).includes(animalType)) {
                this.animalCounts[animalType] = 1
            } else {
                this.animalCounts[animalType]++
            }

            this.maxId++
            return 0
        },

        removeAnimalFromMap: function(id) {
            const i = this.animals.findIndex(animal => animal["id"] === id)

            if (i === -1) {
                console.log("Animal id not found")
                return
            } else {
                const animal = this.animals[i]
                this.animals.splice(i, 1)

                const tokenToRemove = document.getElementById(`animal${id}`)
                this.mapContainer.removeChild(tokenToRemove)

                const animalType = animal["type"]
                this.animalCounts[animalType]--
            }
        },

        moveAnimals: function() {
            const day = Math.floor(this.hourCounter/24)
            const hour = this.hourCounter % 24

            const hourCounter = document.getElementById("hourCounter")
            hourCounter.innerHTML = `Day ${day} Hour ${hour}`

            for (let i = 0; i < this.animals.length; i++) {
                const animal = this.animals[i]

                let [newX, newY] = [animal["x"], animal["y"]]

                const animalTypeInfo = this.getAnimalTypeInfo(animal["type"])
                const step = animalTypeInfo["speed"]

                // Choose a random point in the circle with radius step centered
                // at the animal's current position that has integer points and
                // is as close to the boundary as possible
                let xInc, yInc
                let count = 0

                do {
                    xInc = Math.floor(Math.random() * (step + 1))
                    yInc = Math.floor(Math.sqrt(Math.pow(step, 2) - Math.pow(xInc, 2)))

                    xInc = Math.random() > 0.5 ? xInc : -xInc
                    yInc = Math.random() > 0.5 ? yInc : -yInc
                    count++
                } while (!this._isValidWaterPosition(animal, newX + xInc, newY + yInc) && count < 10);

                if (count >= 10) {
                    this.removeAnimalFromMap(animal["id"])
                }

                let xIncIntelligence = xInc
                let yIncIntelligence = yInc

                if (Math.random() < animalTypeInfo["intelligence"]/100 && animal["xPursueInc"] !== null && animal["yPursueInc"] !== null) {
                    console.log(animal["xPursueInc"], animal["yPursueInc"])
                    xIncIntelligence = animal["xPursueInc"]
                    xIncIntelligence = animal["yPursueInc"]
                    if (!this._isValidWaterPosition(animal, newX + xIncIntelligence, newY + yIncIntelligence)) {
                        xIncIntelligence = xInc
                        yIncIntelligence = yInc
                    }
                    animal["xPursueInc"] = null
                    animal["yPursueInc"] = null
                }

                newX += xIncIntelligence
                newY += yIncIntelligence

                let token = document.getElementById(`animal${animal["id"]}`)
                // Check if new coordinates can be viewed in the map
                if (newX >= 0 && newX <= this.mapWidth && newY >= 0 && newY <= this.mapHeight) {
                    token.style.visibility = "visible"
                    token.style.left = `${newX}px`
                    token.style.top = `${newY}px`
                } // Make the token invisible in the map
                else {
                    token.style.visibility = "hidden"
                }

                // Track the token regardless of whether it is visible in the map
                animal["x"] = newX
                animal["y"] = newY

                // Change resource counters
                const resourcesNeeded = animalTypeInfo["resourcesNeeded"]
                for (let j = 0; j < resourcesNeeded.length; j++) {
                    const resourceInfo = this._getResourceInfo(resourcesNeeded[j][0])
                    if (resourceInfo["remaining"] < resourcesNeeded[j][1]) {
                        if (Math.random() < resourcesNeeded[j][2]/100) {
                            this.removeAnimalFromMap(animal["id"])
                        }
                    }
                    resourceInfo["remaining"] = Math.max(0, resourceInfo["remaining"] - resourcesNeeded[j][1])
                }
            }

            for (let k = 0; k < this.resources.length; k++) {
                const addedRemainder = this.resources[k]["remaining"] + this.resources[k]["replenishingRate"]
                this.resources[k]["remaining"] = Math.min(addedRemainder, this.resources[k]["maxRemaining"])
            }

            this._checkPreyCatch(this.animals)
            this._checkReproduction(this.animals)
            this.hourCounter++
        },

        _getResourceInfo: function(name) {
            const i = this.resources.findIndex(resource => resource["name"] === name)

            if (i === -1) {
                console.log("Resource cannot be found")
            } else {
                return this.resources[i]
            }
        },

        _checkPreyCatch: function(animals) {
            for (let i = 0; i < animals.length; i++) {
                const animalInfo1 = this.getAnimalTypeInfo(animals[i]["type"])
                for (let j = 0; j < animals.length; j++) {
                    const isPrey = animalInfo1["preyList"].includes(animals[j]["type"])

                    const xDiff = animals[i]["x"] - animals[j]["x"]
                    const yDiff = animals[i]["y"] - animals[j]["y"]
                    const dist = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))

                    const isInRange = dist <= this.preyCatchDistance
                    const canBePursued = dist <= this.pursueRadius


                    if (isPrey && isInRange) {
                        this.removeAnimalFromMap(animals[j]["id"])
                    } else if (isPrey && canBePursued) {
                        let step = animalInfo1["speed"]
                        animals[i]["xPursueInc"] = Math.floor((xDiff/dist) * animalInfo1["speed"])
                        animals[i]["yPursueInc"] = Math.floor(Math.sqrt(Math.pow(step, 2) - Math.pow(animals[i]["xPursueInc"], 2)))
                        if (yDiff < 0) {
                            animals[i]["yPursueInc"] *= -1
                        }
                    }


                }
            }
        },

        _checkReproduction: function(animals) {
            for (let i = 0; i < animals.length; i++) {
                const animalInfo1 = this.getAnimalTypeInfo(animals[i]["type"])
                for (let j = 0; j < animals.length; j++) {
                    // Use reproduction chance if animal types are the same
                    if (animals[i]["type"] === animals[j]["type"]) {
                        const xDiff = animals[i]["x"] - animals[j]["x"]
                        const yDiff = animals[i]["y"] - animals[j]["y"]
                        const dist = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))
                        if (this.animalCounts[animals[i]["type"]] < animalInfo1["maxCount"] &&
                                dist < this.reproductionDistance &&
                                Math.random() < animalInfo1["reproductionChance"]/1000) {
                            console.log("reproduced")
                            const xPos = Math.floor((animals[i]["x"] + animals[j]["x"])/2)
                            const yPos = Math.floor((animals[i]["y"] + animals[j]["y"])/2)
                            this.addAnimalOnMap(animals[i]["type"], xPos, yPos, false)
                        }
                    }
                }
            }
        },

        getAnimalTypeInfo: function(animalType) {
            const idx = this.infoDisplay.getEntryIndex(animalType)

            if (idx === -1) {
                console.log("Animal type cannot be found")
            } else {
                return this.infoDisplay.animalTypes[idx]
            }
        },

        // The replenishing rate is the percentage that is replenished each hour
        // from the previous hour
        addResourceType: function(name, initialValue, maxRemaining, replenishingRate) {
            const resourceInfo = {
                "name": name,
                "remaining": initialValue,
                "maxRemaining": maxRemaining,
                "replenishingRate": replenishingRate
            }

            const resourceInfoCopy = {
                "name": name,
                "remaining": initialValue,
                "maxRemaining": maxRemaining,
                "replenishingRate": replenishingRate
            }

            this.resources.push(resourceInfo)
            this.initialResources.push(resourceInfoCopy)
        },

        // The normal control panel contains the stop, start, speed up, slow down,
        // and rewind buttons. In editing mode, only the edit button is visible.
        addControlPanel: function(mode) {
            this.controlsContainer = document.createElement("section")

            if (mode === "user") {
                this.allowUserEditing = true

                let hourCounter = document.createElement("span")
                hourCounter.id = "hourCounter"
                hourCounter.innerHTML = "Day 0 Hour 1"
                hourCounter.style = "margin-right:10px"

                let startButton = document.createElement("button")
                startButton.innerHTML = "Start simulation"
                startButton.addEventListener("click", () => this._startSim())

                let stopButton = document.createElement("button")
                stopButton.innerHTML = "Stop simulation"
                stopButton.addEventListener("click", () => this._stopSim())

                let speedUpButton = document.createElement("button")
                speedUpButton.innerHTML = "Speed up"
                speedUpButton.addEventListener("click", () => this._speedUpSim())

                let slowDownButton = document.createElement("button")
                slowDownButton.innerHTML = "Slow down"
                slowDownButton.addEventListener("click", () => this._slowDownSim())

                let resetButton = document.createElement("button")
                resetButton.innerHTML = "Reset"
                resetButton.addEventListener("click", () => this._resetSim())


                this.controlsContainer.appendChild(startButton)
                this.controlsContainer.appendChild(stopButton)
                this.controlsContainer.appendChild(speedUpButton)
                this.controlsContainer.appendChild(slowDownButton)
                this.controlsContainer.appendChild(resetButton)

                if (this.allowUserEditing) {
                    let addWaterButton = document.createElement("button")
                    addWaterButton.innerHTML = "Add Water Region"
                    addWaterButton.id = "addWaterButton"
                    addWaterButton.addEventListener("click", () => this._addWaterRegion())
                    this.controlsContainer.appendChild(addWaterButton)
                }

                this.controlsContainer.appendChild(hourCounter)


            } else if (mode === "developer") {
                this.allowUserEditing = false

                let addWaterButton = document.createElement("button")
                addWaterButton.innerHTML = "Add Water Region"
                addWaterButton.addEventListener("click", () => this._addWaterRegion())

                this.controlsContainer.appendChild(addWaterButton)

                let resourceChartContainer = document.getElementById("resourceChartContainer")
                // Add area to display the commands to be added
                let commandsArea = document.createElement("div")
                commandsArea.id = "commandsArea"
                this.simContainer.insertBefore(commandsArea, resourceChartContainer)
            }

            this.simContainer.insertBefore(this.controlsContainer, this.simContainer.childNodes[0])
        },

        _startSim: function(mapInterval, resInterval) {
            if (!this.simStart) {
                this.startRetMap = setInterval(() => this.moveAnimals(), this.mapInterval)
                this.startRetRes = setInterval(() => this.resChartBuilder.addNewPoint(
                    this.resources[0]["remaining"], this.resources[0]["maxRemaining"]), this.resInterval)
                this.simStart = true
            }
        },

        _stopSim: function() {
            if (this.simStart) {
                clearInterval(this.startRetMap)
                clearInterval(this.startRetRes)
                this.simStart = false
            }
        },

        _speedUpSim: function() {
            if (this.simStart && !this.isSpedUp) {
                this.mapInterval /= 2
                this.resInterval /= 2
                this._stopSim()
                this._startSim()
                this.isSpedUp = true
            }
        },

        _slowDownSim: function() {
            if (this.simStart && this.isSpedUp) {
                this.mapInterval *= 2
                this.resInterval *= 2
                this._stopSim()
                this._startSim()
                this.isSpedUp = false
            }
        },

        _resetSim: function() {

            this._stopSim()

            for (let i = 0; i < this.animalIds.length; i++) {
                this.removeAnimalFromMap(this.animalIds[i])
            }

            this.hourCounter = 1
            const hourCounter = document.getElementById("hourCounter")
            hourCounter.innerHTML = "Day 0 Hour 1"

            this.animalIds = []
            this.animalCounts = {}

            for (let j = 0; j < this.initialAnimals.length; j++) {
                const animal = this.initialAnimals[j]
                this.addAnimalOnMap(animal["type"], animal["x"], animal["y"], false)
            }

            this.resources = []
            for (let k = 0; k < this.initialResources.length; k++) {
                const resourceCopy = {
                    "name": this.initialResources[k]["name"],
                    "remaining": this.initialResources[k]["remaining"],
                    "maxRemaining": this.initialResources[k]["maxRemaining"],
                    "replenishingRate": this.initialResources[k]["replenishingRate"]
                }
                this.resources.push(resourceCopy)
            }

            this.resChartBuilder.points = []
            this.resChartBuilder.chartContainer.innerHTML = ""
            this.resChartBuilder.buildChart(this.resources[0]["maxRemaining"])
        },

        _addWaterRegion: function() {
            if (!this.inWaterSelection) {
                this.resChartBuilder.points = []
                this.resChartBuilder.chartContainer.innerHTML = ""
                this.resChartBuilder.buildChart(this.resources[0]["maxRemaining"])
                if (this.firstWaterSelection) {
                    if (this.allowUserEditing) {
                        this._stopSim()
                        this.mapContainerData = this.mapContainer.innerHTML

                        const hourCounter = document.getElementById("hourCounter")
                        this.controlsContainer.removeChild(hourCounter)

                        for (let i = 0; i < 5; i++) {
                            this.controlsContainer.removeChild(this.controlsContainer.childNodes[0])
                        }

                        const backButton = document.createElement("button")
                        backButton.innerHTML = "Finished Adding"
                        backButton.addEventListener("click", () => this._handleBackButton())

                        const addWaterButton = document.getElementById("addWaterButton")
                        this.controlsContainer.insertBefore(backButton, addWaterButton)
                    }
                    this.mapContainer.innerHTML = ""
                } else {
                    const mapImg = document.getElementById("mapImg")
                    if (mapImg) {
                        this.mapContainer.removeChild(this.mapContainer.childNodes[0])
                    }
                }
                this.firstWaterSelection = false

                const mapButton = document.createElement("input")
                mapButton.type = "image"
                mapButton.src = this.mapImgSrc
                mapButton.width = this.mapWidth
                mapButton.height = this.mapHeight
                mapButton.id = "mapButton"
                mapButton.addEventListener("click", () => this._handleMapClick(event))

                this.mapContainer.insertBefore(mapButton,this.mapContainer.childNodes[0])
                this.inWaterSelection = true
            }
        },

        _handleBackButton: function() {
            this.controlsContainer.innerHTML = ""
            this.addControlPanel("user")

            this.mapContainer.innerHTML = this.mapContainerData
            this.firstWaterSelection = true
            this.inWaterSelection = false
            this.hourCounter = 0
        },

        _handleMapClick: function(e) {
            let rect = e.target.getBoundingClientRect()
            const markerLeft = e.clientX - rect.left
            const markerTop = e.clientY - rect.top

            if (this.currWaterSelections.length <= 2) {
                this.currWaterSelections.push({
                    "x": markerLeft,
                    "y":markerTop
                })

                const marker = document.createElement("div")
                marker.style = `height:5px;width:5px;border-radius:50%;background-color:red;left:${markerLeft}px;top:${markerTop}px;position:absolute`
                marker.id = `marker${this.currWaterSelections.length}`
                this.mapContainer.appendChild(marker)
            }

            if (this.currWaterSelections.length == 1) {
                let deleteSelectionButton = document.createElement("button")
                deleteSelectionButton.innerHTML = "Delete selection"
                deleteSelectionButton.addEventListener("click", () => this._handleDeleteSelection())
                deleteSelectionButton.id = "deleteSelectionButton"
                this.controlsContainer.appendChild(deleteSelectionButton)
            }

            if (this.currWaterSelections.length == 2) {
                let confirmSelectionButton = document.createElement("button")
                confirmSelectionButton.innerHTML = "Confirm selection"
                confirmSelectionButton.id = "confirmSelectionButton"
                confirmSelectionButton.addEventListener("click", () => this._handleConfirmSelection())
                this.controlsContainer.appendChild(confirmSelectionButton)
            }
        },

        _handleDeleteSelection: function() {
            this.currWaterSelections = []
            this._removeSelectionButtons()
            this._removeMapButton()
            this._removeMarkers()
            this.inWaterSelection = false
        },

        _handleConfirmSelection: function() {
            this._drawWaterSelection(this.currWaterSelections)
            if (!this.allowUserEditing) {
                this._displaySelectionCode(this.currWaterSelections)
            }
            if (this.allowUserEditing) {
                const selection = this.currWaterSelections

                const leftX = Math.min(selection[0]["x"], selection[1]["x"])
                const rightX = Math.max(selection[0]["x"], selection[1]["x"])
                const topY = Math.min(selection[0]["y"], selection[1]["y"])
                const bottomY = Math.max(selection[0]["y"], selection[1]["y"])

                this.defineWaterRegion(leftX, rightX, topY, bottomY)
            }
            this.currWaterSelections = []
            this._removeSelectionButtons()
            this._removeMapButton()
            this._removeMarkers()
            this.inWaterSelection = false
        },

        _drawWaterSelection: function(selection) {
            console.log(selection)
            const rectLeftX = Math.min(selection[0]["x"], selection[1]["x"])
            const rectTopY = Math.min(selection[0]["y"], selection[1]["y"])
            const rectRightX = Math.max(selection[0]["x"], selection[1]["x"])
            const rectBottomY = Math.max(selection[0]["y"], selection[1]["y"])

            let selectionRect = document.createElement("img")
            selectionRect.src = "images/black-rect.jpg"
            selectionRect.width = rectRightX - rectLeftX
            selectionRect.height = rectBottomY - rectTopY
            selectionRect.style = `position:absolute;left:${rectLeftX}px;top:${rectTopY}px`

            this.mapContainer.appendChild(selectionRect)
        },

        _removeSelectionButtons: function() {
            const deleteSelectionButton = document.getElementById("deleteSelectionButton")

            if (deleteSelectionButton) {
                this.controlsContainer.removeChild(deleteSelectionButton)
            }

            const confirmSelectionButton = document.getElementById("confirmSelectionButton")

            if (confirmSelectionButton) {
                this.controlsContainer.removeChild(confirmSelectionButton)
            }
        },

        _removeMapButton: function() {
            const mapButton = document.getElementById("mapButton")
            this.mapContainer.removeChild(mapButton)

            const mapImg = document.createElement("img")
            mapImg.src = this.mapImgSrc
            mapImg.width = this.mapWidth
            mapImg.height = this.mapHeight
            mapImg.id = "mapImg"

            this.mapContainer.insertBefore(mapImg, this.mapContainer.childNodes[0])
        },

        _removeMarkers: function() {
            const marker1 = document.getElementById("marker1")
            const marker2 = document.getElementById("marker2")

            if (marker1) {
                this.mapContainer.removeChild(marker1)
            }

            if (marker2) {
                this.mapContainer.removeChild(marker2)
            }
        },

        _displaySelectionCode: function(selection) {
            let commandsArea = document.getElementById("commandsArea")
            let newCodeLine = document.createElement("div")

            const leftX = Math.min(selection[0]["x"], selection[1]["x"])
            const rightX = Math.max(selection[0]["x"], selection[1]["x"])
            const topY = Math.min(selection[0]["y"], selection[1]["y"])
            const bottomY = Math.max(selection[0]["y"], selection[1]["y"])

            newCodeLine.innerHTML = `simBuilder.defineWaterRegion(${leftX}, ${rightX}, ${topY}, ${bottomY})`

            commandsArea.appendChild(newCodeLine)
        },

        defineWaterRegion: function(leftX, rightX, topY, bottomY) {
            this.waterRegions.push({
                "x": {
                    "left": leftX,
                    "right": rightX
                },
                "y": {
                    "top": topY,
                    "bottom": bottomY
                }
            })
        },

        _isValidWaterPosition: function(animal, x, y) {
            if (animal["positionType"] === "air") {
                return true
            }

            const animalTypeInfo = this.getAnimalTypeInfo(animal["type"])
            const positionType = animalTypeInfo["positionType"]


            for (let i = 0; i < this.waterRegions.length; i++) {
                const waterRegion = this.waterRegions[i]
                const inWater = (x >= waterRegion["x"]["left"] && x <= waterRegion["x"]["right"]) && (y >= waterRegion["y"]["top"] && y <= waterRegion["y"]["bottom"])
                if (positionType === "land" && inWater) {
                    return false
                } else if (positionType === "water" && inWater) {
                    return true
                }
            }

            if (positionType === "land") {
                return true
            } else {
                return false
            }
        }
    }

    function resourceChartBuilder(chartContainer, resourceName, chartWidth, chartHeight, maxPoints) {
        this.chartContainer = document.getElementById(chartContainer)
        this.resourceName = resourceName
        this.chartWidth = chartWidth
        this.chartHeight = chartHeight
        this.maxPoints = maxPoints
        this.points = []
    }

    resourceChartBuilder.prototype = {

        buildChart: function(maxResources) {
            let titleContainer = document.createElement("h3")
            let titleText = document.createTextNode(`${this.resourceName} remaining`)
            titleContainer.appendChild(titleText)
            titleContainer.style = "text-align:center;margin-top:5px"
            this.chartContainer.appendChild(titleContainer)

            const interval = Math.floor(this.chartWidth/this.maxPoints)
            let currX = 0

            for (let i = 0; i < this.maxPoints; i++) {
                let bar = document.createElement("span")
                bar.style = `border:1px solid black;position:absolute;bottom:0px;background-color:blue;opacity:${this.points[i]/(2 * maxResources) + 0.5};
                    height:${Math.floor(this.points[i] * 150/maxResources)}px;width:${interval}px;left:${currX}px;display:inline-block`
                this.chartContainer.appendChild(bar)
                currX += interval
            }
        },

        addNewPoint: function(newY, maxResources) {
            if (this.points.length >= this.maxPoints) {
                this.points.splice(0, 1)
            }

            this.points.push(newY)

            this.chartContainer.innerHTML = ""

            this.buildChart(maxResources)
        }
    }

    global.infoDisplayBuilder = global.infoDisplayBuilder || infoDisplayBuilder
    global.simulationBuilder = global.simulationBuilder || simulationBuilder
    global.resourceChartBuilder = global.resourceChartBuilder || resourceChartBuilder

})(window, window.document);
