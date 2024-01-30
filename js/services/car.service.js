'use strict'

const STORAGE_KEY = 'carDB'

var gCars

_createCars()

function getCars(options = {}) {
    var cars = gCars.filter(car =>
        car.vendor.includes(options.filterBy.txt) &&
        car.maxSpeed >= options.filterBy.minSpeed)

    if (options.sortBy.maxSpeed) {
        cars.sort((c1, c2) => (c1.maxSpeed - c2.maxSpeed) * options.sortBy.maxSpeed)
    } else if (options.sortBy.vendor) {
        cars.sort((c1, c2) => c1.vendor.localeCompare(c2.vendor) * options.sortBy.vendor)
    }

    if(options.page) {
        const fromIdx = options.page.idx * options.page.size
        cars = cars.slice(fromIdx, fromIdx + options.page.size)

        if(cars.length === 0) return null
    }
    return cars
}

function removeCar(carId) {
    const carIdx = gCars.findIndex(car => carId === car.id)
    gCars.splice(carIdx, 1)
    
    _saveCarsToStorage()
}

function addCar(vendor) {
    const car = _createCar(vendor)
    gCars.unshift(car)

    _saveCarsToStorage()
    return car
}

function getCarById(carId) {
    return gCars.find(car => carId === car.id)
}

function updateCar(carId, newSpeed) {
    const car = gCars.find(car => car.id === carId)
    car.maxSpeed = newSpeed

    _saveCarsToStorage()
    return car
}

function _createCar(vendor) {
    return {
        id: makeId(),
        vendor,
        maxSpeed: getRandomIntInclusive(50, 250),
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
        gCars.push(_createCar(vendor))
    }
    _saveCarsToStorage()
}

function _saveCarsToStorage() {
    saveToStorage(STORAGE_KEY, gCars)
}
