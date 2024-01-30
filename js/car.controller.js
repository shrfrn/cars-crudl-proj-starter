'use strict'

const options = {
    filterBy: { txt: '', minSpeed: 0 },
    sortBy: {},
    page: { idx: 0, size: 5 },
}

function onInit() {
    renderFilterByQueryParams()
    renderCars()
}

function renderCars() {
    var cars = getCars(options)
    if(!cars) {
        options.page.idx = 0
        cars = getCars(options)
    }
    var strHtmls = cars.map(car => `
        <article class="car-preview">
            <button title="Delete car" class="btn-remove" onclick="onRemoveCar('${car.id}')">X</button>
            
            <h2>${car.vendor}</h2>
            <p>Up to <span>${car.maxSpeed}</span> KMH</p>
            
            <button onclick="onReadCar('${car.id}')">Details</button>
            <button onclick="onUpdateCar('${car.id}')">Update</button>

            <img title="Photo of ${car.vendor}" 
                src="img/${car.vendor}.png" 
                alt="Car by ${car.vendor}"
                onerror="this.src='img/default.png'">
        </article> 
    `)
    document.querySelector('.cars-container').innerHTML = strHtmls.join('')
}

function onRemoveCar(carId) {
    removeCar(carId)
    renderCars()
    flashMsg(`Car Deleted`)
}

function onAddCar() {
    var vendor = prompt('vendor?')
    if (!vendor) return

    const car = addCar(vendor)
    renderCars()
    flashMsg(`Car Added (id: ${car.id})`)
}

function onUpdateCar(carId) {
    const car = getCarById(carId)

    var newSpeed = +prompt('Speed?', car.maxSpeed)
    if (!newSpeed || car.maxSpeed === newSpeed) return 

    const updatedCar = updateCar(carId, newSpeed)
    renderCars()
    flashMsg(`Speed updated to: ${updatedCar.maxSpeed}`)
}

function onReadCar(carId) {
    const car = getCarById(carId)
    const elModal = document.querySelector('.modal')

    elModal.querySelector('h3').innerText = car.vendor
    elModal.querySelector('h4 span').innerText = car.maxSpeed
    elModal.querySelector('p').innerText = car.desc

    elModal.classList.add('open')
}

function onSetFilterBy(filterBy) {
    const elVendor = document.querySelector('.filter-by select')
    const elMinSpeed = document.querySelector('.filter-by input')

    options.filterBy = { txt: elVendor.value, minSpeed: +elMinSpeed.value }
    renderCars()

    const queryParams = `?vendor=${filterBy.vendor}&minSpeed=${filterBy.minSpeed}`
    const newUrl = 
        window.location.protocol + "//" + 
        window.location.host + 
        window.location.pathname + queryParams

    window.history.pushState({ path: newUrl }, '', newUrl)
}

function onCloseModal() {
    document.querySelector('.modal').classList.remove('open')
}

function flashMsg(msg) {
    const el = document.querySelector('.user-msg')

    el.innerText = msg
    el.classList.add('open')
    setTimeout(() => el.classList.remove('open'), 3000)
}

function renderFilterByQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)
    options.filterBy = {
        txt: queryParams.get('vendor') || '',
        minSpeed: +queryParams.get('minSpeed') || 0
    }

    if (!options.filterBy.vendor && !options.filterBy.minSpeed) return

    document.querySelector('.filter-by select').value = options.filterBy.txt
    document.querySelector('.filter-by input').value = options.filterBy.minSpeed
}

function onSetSortBy() {
    const prop = document.querySelector('.sort-by select').value
    const isDesc = document.querySelector('.sort-by .sort-desc').checked

    options.sortBy = {}
    if (!prop) return

    options.sortBy[prop] = (isDesc) ? -1 : 1
    renderCars()
}

function onNextPage() {
    options.page.idx++
    renderCars()
}