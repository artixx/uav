const { join } = require('path')
const { fromJS } = require('immutable')

const { readFileSync, writeFileSync } = require('../utils/io')

function loadDefaultConfigSync() {
    return fromJS(JSON.parse(readFileSync(join(__dirname, '..', 'config-default', 'config.json'))))
}

function loadConfigSync() {
    return fromJS(JSON.parse(readFileSync(join(__dirname, '..', 'config', 'config.json'))))
}

function saveConfigSync(config) {
    return writeFileSync(join(__dirname, '..', 'config', 'config.json'), JSON.stringify(config, null, 2))
}

function loadConfig() {
    return fromJS(loadDefaultConfigSync()).merge(loadConfigSync())
}

function initConfig() {
    const config = fromJS(loadDefaultConfigSync())
    saveConfigSync(config)
    return config
}

module.exports = {
    loadConfig,
    initConfig,
}
