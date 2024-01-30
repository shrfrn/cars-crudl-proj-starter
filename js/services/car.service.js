'use strict'

const STORAGE_KEY = 'carDB'

var gCars
var gFilterBy = { vendor: '', minSpeed: 0 }

_createCars()

function getCars() {
    var cars = gCars.filter(car =>
        car.vendor.includes(gFilterBy.vendor) &&
        car.maxSpeed >= gFilterBy.minSpeed)

    return cars
}

function removeCar(carId) {
    const carIdx = gCars.findIndex(car => carId === car.id)
    gCars.splice(carIdx, 1)
    
    _saveCarsToStorage()
}

function saveCar(carToAdd) {
    if(carToAdd.id) {
        var car = updateCar(carToAdd)
    } else {
        var car = addCar(carToAdd)
    }

    _saveCarsToStorage()
    return car
}

function updateCar(carToUpdate) {
    const idx = gCars.findIndex(car => car.id === carToUpdate.id)
    gCars[idx] = carToUpdate

    return carToUpdate
}

function addCar(carToAdd) {
    var car = _createCar(carToAdd)
    gCars.unshift(car)

    return car
}

function getCarById(carId) {
    return gCars.find(car => carId === car.id)
}

function setCarFilter(filterBy = {}) {
    if (filterBy.vendor !== undefined) gFilterBy.vendor = filterBy.vendor
    if (filterBy.minSpeed !== undefined) gFilterBy.minSpeed = filterBy.minSpeed
    
    return gFilterBy
}

function setCarSort(sortBy = {}) {
    if (sortBy.maxSpeed !== undefined) {
        gCars.sort((c1, c2) => (c1.maxSpeed - c2.maxSpeed) * sortBy.maxSpeed)
    } else if (sortBy.vendor !== undefined) {
        gCars.sort((c1, c2) => c1.vendor.localeCompare(c2.vendor) * sortBy.vendor)
    }
}

function _createCar({ vendor, maxSpeed }) {
    console.log('vendor: ', vendor)
    console.log('maxSpeed: ', maxSpeed)
    return {
        id: makeId(),
        vendor,
        maxSpeed: maxSpeed || getRandomIntInclusive(50, 250),
        desc: makeLorem()
    }
}

function _createCars() {
    gCars = loadFromStorage(STORAGE_KEY)
    if (gCars && gCars.length) return
    
    // If no cars in storage - generate demo data

    gCars = []
    const vendors = ['audu', 'fiak', 'subali', 'mitsu']
    
    for (let i = 0; i < 12; i++) {
        var vendor = vendors[getRandomInt(0, vendors.length)]
        gCars.push(_createCar({ vendor }))
    }
    _saveCarsToStorage()
}

function _saveCarsToStorage() {
    saveToStorage(STORAGE_KEY, gCars)
}
