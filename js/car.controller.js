'use strict'

var gCarToEdit = null

const gQueryOptions = {
    filterBy: { txt: '', minSpeed: 0 },
    sortBy: {},
}

function onInit() {
    renderVendors()
    renderCars()
}

function renderVendors() {
    const elVendorLists = document.querySelectorAll('.vendor-list')
    const vendors = getVendors()

    const strHtmls = vendors.map(vendor => `<option>${vendor}</option>`)
    elVendorLists.forEach(elList => elList.innerHTML += strHtmls.join(''))
}

function renderCars() {
    var cars = getCars(gQueryOptions)
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

// CRUD

function onRemoveCar(carId) {
    removeCar(carId)
    renderCars()
    flashMsg(`Car Deleted`)
}

function onAddCar() {
    const elModal = document.querySelector('.car-edit-modal')
    elModal.showModal()
}

function onUpdateCar(carId) {
    const elModal = document.querySelector('.car-edit-modal')
    
    const elVendor = elModal.querySelector('select')
    const elMaxSpeed = elModal.querySelector('input')
    const elCarImg = elModal.querySelector('img')
    
    gCarToEdit = getCarById(carId)
    
    elVendor.value = gCarToEdit.vendor
    elMaxSpeed.value = gCarToEdit .maxSpeed
    elCarImg.src = `img/${gCarToEdit.vendor}.png`

    elModal.showModal()
}

function onSaveCar() {
    const elForm = document.querySelector('.car-edit-modal form')
    
    const elVendor = elForm.querySelector('select')
    const elMaxSpeed = elForm.querySelector('input')
    
    const vendor = elVendor.value
    const maxSpeed = +elMaxSpeed.value

    if(gCarToEdit) {
        var car = updateCar(gCarToEdit.id, vendor, maxSpeed)
        gCarToEdit = null
    } else {
        var car = addCar(vendor, maxSpeed)
    }
    elForm.reset()

    renderCars()
    flashMsg(`Car Saved (id: ${car.id})`)
}

// Car Edit Dialog

function onSelectVendor(elVendor) {
    const elCarImg = document.querySelector('.car-edit-modal img')
    elCarImg.src = `img/${elVendor.value}.png`
}

function onCloseCarEdit() {
    document.querySelector('.car-edit-modal').close()
}

// Details modal

function onReadCar(carId) {
    const car = getCarById(carId)
    const elModal = document.querySelector('.modal')

    elModal.querySelector('h3').innerText = car.vendor
    elModal.querySelector('h4 span').innerText = car.maxSpeed
    elModal.querySelector('p').innerText = car.desc
    elModal.querySelector('img').src = `img/${car.vendor}.png`

    elModal.showModal()
}

function onCloseModal() {
    document.querySelector('.modal').close()
}

// Filter, Sort & Pagination

function onSetFilterBy() {
    const elVendor = document.querySelector('.filter-by .vendor-list')
    const elMinSpeed = document.querySelector('.filter-by input')

    gQueryOptions.filterBy.txt = elVendor.value
    gQueryOptions.filterBy.minSpeed = elMinSpeed.value

    renderCars()
}

function onSetSortBy() {
    console.log('Sort set.')
}

function onNextPage() {
    console.log('Getting next page...')
}

// Query Params

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
    renderQueryParams()
}

function renderQueryParams() {
    
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

// UI

function flashMsg(msg) {
    const el = document.querySelector('.user-msg')

    el.innerText = msg
    el.classList.add('open')
    setTimeout(() => el.classList.remove('open'), 3000)
}