const { join } = require('path')
const { fromJS } = require('immutable')

const { readFileSync, writeFile, writeFileSync } = require('../utils/io')

function loadDefaultStateSync() {
    return fromJS(JSON.parse(readFileSync(join(__dirname, '..', 'config-default', 'state.json'))))
}

function loadDefaultIntelSync() {
    return fromJS(JSON.parse(readFileSync(join(__dirname, '..', 'config-default', 'intelligence.json'))))
}

function loadStateSync() {
    return fromJS(JSON.parse(readFileSync(join(__dirname, '..', 'config', 'state.json'))))
}

function loadIntelSync() {
    return fromJS(JSON.parse(readFileSync(join(__dirname, '..', 'config', 'intelligence.json'))))
}

function saveState(state) {
    return writeFile(join(__dirname, '..', 'config', 'state.json'), JSON.stringify(state, null, 2))
}

function saveStateSync(state) {
    return writeFileSync(join(__dirname, '..', 'config', 'state.json'), JSON.stringify(state, null, 2))
}

function saveIntel(state) {
    return writeFile(join(__dirname, '..', 'config', 'intelligence.json'), JSON.stringify(state, null, 2))
}

function saveIntelSync(state) {
    return writeFileSync(join(__dirname, '..', 'config', 'intelligence.json'), JSON.stringify(state, null, 2))
}

function loadState() {
    return fromJS(loadDefaultStateSync()).merge(loadStateSync())
}

function initState() {
    const state = fromJS(loadDefaultStateSync())
    saveStateSync(state)
    return state
}

function loadIntel() {
    return fromJS(loadDefaultIntelSync()).merge(loadIntelSync())
}

function initIntel() {
    const intel = fromJS(loadDefaultIntelSync())
    saveIntelSync(intel)
    return intel
}

module.exports = {
    loadState,
    initState,
    saveState,
    saveStateSync,
    loadIntel,
    initIntel,
    saveIntel,
    saveIntelSync,
}
