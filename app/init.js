const { Map } = require('immutable')
const death = require('death')

const { State } = require('./utils/State')
const {
    loadIntel,
    loadState,
    initIntel,
    initState,
    saveIntel,
    saveIntelSync,
    saveState,
    saveStateSync,
} = require('./core/stateIO')
const { loadConfig, initConfig } = require('./core/configIO')
const { startLoop } = require('./core/loop')
const { startServer } = require('./server/index')

function getConfig() {
    try {
        return loadConfig()
    } catch (e) {
        return initConfig()
    }
}

function getIntel() {
    try {
        return loadIntel()
    } catch (e) {
        return initIntel()
    }
}

function getState() {
    try {
        return loadState()
    } catch (e) {
        return initState()
    }
}

function initFiles() {
    getIntel()
    getState()
    getConfig()
}

function init() {
    const config = getConfig()
    const state = new State(new Map({
        intel: getIntel(),
        state: getState(),
    }))

    setInterval(() => {
        saveState(state.getState().get('state'))
        saveIntel(state.getState().get('intel'))
    }, config.get('autoSaveTime'))
    startLoop(state.getState, state.updateState, state.subscribe)

    const connection = config.get('server')
        ? startServer(config.get('port'), state.getState, state.updateState)
        : { close: () => {} }

    death(() => {
        connection.close()
        saveStateSync(state.getState().get('state'))
        saveIntelSync(state.getState().get('intel'))
        process.exit()
    })
}

module.exports = { init, initFiles }
