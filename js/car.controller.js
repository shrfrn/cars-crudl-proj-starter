'use strict'

var gCurrCarId

function onInit() {
    renderFilterByQueryParams()
    renderCars()
}

function renderCars() {
    var cars = getCars()
    var strHtmls = cars.map(car => `
        <article class="car-preview">
            <button title="Delete car" class="btn-remove" onclick="onRemoveCar('${car.id}')">X</button>
            
            <h2>${car.vendor}</h2>
            <p>Up to <span>${car.maxSpeed}</span> KMH</p>
            
            <button onclick="onReadCar('${car.id}')">Details</button>
            <button onclick="onEditCar('${car.id}')">Update</button>

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
    const elCarEditModal = document.querySelector('.car-edit-modal')
    elCarEditModal.showModal()
}

function onEditCar(carId) {
    const car = getCarById(carId)
    gCurrCarId = carId

    const elCarEditModal = document.querySelector('.car-edit-modal')
    const elVendor = elCarEditModal.querySelector('select')
    const elMaxSpeed = elCarEditModal.querySelector('input')

    elVendor.value = car.vendor
    elMaxSpeed.value = car.maxSpeed

    elCarEditModal.showModal()
}

function onSaveCar() {
    const elVendor = document.querySelector('.car-edit-modal select')
    const elMaxSpeed = document.querySelector('.car-edit-modal input')
    
    const vendor = elVendor.value
    const maxSpeed = elMaxSpeed.value
    
    const car = saveCar({ id: gCurrCarId, vendor, maxSpeed })
    gCurrCarId = ''

    renderCars()
    flashMsg(`Car Saved (id: ${car.id})`)
}

function onCloseCarEdit() {
    document.querySelector('.car-edit-modal').close()
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
    filterBy = setCarFilter(filterBy)
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
    const filterBy = {
        vendor: queryParams.get('vendor') || '',
        minSpeed: +queryParams.get('minSpeed') || 0
    }

    if (!filterBy.vendor && !filterBy.minSpeed) return

    document.querySelector('.filter-by select').value = filterBy.vendor
    document.querySelector('.filter-by input').value = filterBy.minSpeed
    
    setCarFilter(filterBy)
}

function onSetSortBy() {
    const prop = document.querySelector('.sort-by select').value
    const isDesc = document.querySelector('.sort-by .sort-desc').checked

    if (!prop) return

    const sortBy = {}
    sortBy[prop] = (isDesc) ? -1 : 1

    // Shorter Syntax:
    // const sortBy = {
    //     [prop] : (isDesc)? -1 : 1
    // }

    setCarSort(sortBy)
    renderCars()
}