'use strict'

var gCurrCarId

const options = {
    filterBy: { txt: '', minSpeed: 0 },
    sortBy: {},
    page: { idx: 0, size: 4 },
}

function onInit() {
    readQueryParams()
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

function onSelectVendor(elVendor) {
    const elCarImg = document.querySelector('.car-edit-modal img')
    elCarImg.src = `img/${elVendor.value}.png`
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

function onSetFilterBy() {
    const elVendor = document.querySelector('.filter-by select')
    const elMinSpeed = document.querySelector('.filter-by input')

    options.filterBy = { txt: elVendor.value, minSpeed: +elMinSpeed.value }
    options.page.idx = 0

    renderCars()
    setQueryParams()
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

function readQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)
    options.filterBy = {
        txt: queryParams.get('vendor') || '',
        minSpeed: +queryParams.get('minSpeed') || 0
    }

    if(queryParams.get('sortBy')) {
        const prop = queryParams.get('sortBy')
        const dir = queryParams.get('sortDir')
        options.sortBy[prop] = dir
    }

    if(queryParams.get('pageIdx')) {
        options.page.idx = +queryParams.get('pageIdx')
        options.page.size = +queryParams.get('pageSize')
    }
    reflectQueryParams()
}

function reflectQueryParams() {
    
    document.querySelector('.filter-by select').value = options.filterBy.txt
    document.querySelector('.filter-by input').value = options.filterBy.minSpeed
    
    const sortKeys = Object.keys(options.sortBy)
    const sortBy = sortKeys[0]
    const dir = options.sortBy[sortKeys[0]]

    document.querySelector('.sort-by select').value = sortBy || ''
    document.querySelector('.sort-by input').checked = (dir === -1) ? true : false
}

function setQueryParams() {
    const queryParams = new URLSearchParams()

    queryParams.set('vendor', options.filterBy.txt)
    queryParams.set('minSpeed', options.filterBy.minSpeed)

    const sortKeys = Object.keys(options.sortBy)
    if(sortKeys.length) {
        queryParams.set('sortBy', sortKeys[0])
        queryParams.set('sortDir', options.sortBy[sortKeys[0]])
    }

    if(options.page) {
        queryParams.set('pageIdx', options.page.idx)
        queryParams.set('pageSize', options.page.size)
    }

    const newUrl = 
        window.location.protocol + "//" + 
        window.location.host + 
        window.location.pathname + '?' + queryParams.toString()

    window.history.pushState({ path: newUrl }, '', newUrl)
}

function onSetSortBy() {
    const prop = document.querySelector('.sort-by select').value
    const isDesc = document.querySelector('.sort-by .sort-desc').checked

    options.sortBy = {}
    if (!prop) return

    options.sortBy[prop] = (isDesc) ? -1 : 1
    options.page.idx = 0

    renderCars()
    setQueryParams()
}

function onNextPage() {
    options.page.idx++

    renderCars()
    setQueryParams()
}