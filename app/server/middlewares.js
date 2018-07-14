const { fromJS } = require('immutable')
const { log } = require('../utils/logger')

async function errorHandler(ctx, next) {
    try {
        await next()
    } catch (e) {
        log.error(e)
    }
}

// TODO auth
function createAuthMiddleware() {
    return async function (ctx, next) {
        next()
    }
}

// TODO login
function createLoginMiddleware() {
    return async function (ctx, next) {
        next()
    }
}

// TODO logout
function createLogoutMiddleware() {
    return async function (ctx, next) {
        next()
    }
}

function createGetStateMiddleware(getState) {
    return async function (ctx) {
        ctx.set('Content-Type', 'application/json')
        ctx.body = JSON.stringify(getState().get('state'))
    }
}

function createPutStateMiddleware(updateState) {
    return async function (ctx) {
        const body = ctx.request.body
        ctx.set('Content-Type', 'application/json')
        ctx.body = JSON.stringify(updateState(state => state.set('state', fromJS(body))).get('state'))
    }
}

function createPatchStateMiddleware(updateState) {
    return async function (ctx) {
        const body = ctx.request.body
        ctx.set('Content-Type', 'application/json')
        ctx.body = JSON.stringify(updateState(state => state.mergeIn(['state'], fromJS(body))).get('state'))
    }
}

function createGetIntelMiddleware(getState) {
    return async function (ctx) {
        ctx.set('Content-Type', 'application/json')
        ctx.body = JSON.stringify(getState().get('intel'))
    }
}

function createPutIntelMiddleware(updateState) {
    return async function (ctx) {
        const body = ctx.request.body
        ctx.set('Content-Type', 'application/json')
        ctx.body = JSON.stringify(updateState(state => state.set('intel', fromJS(body))).get('intel'))
    }
}

function createPatchIntelMiddleware(updateState) {
    return async function (ctx) {
        const body = ctx.request.body
        ctx.set('Content-Type', 'application/json')
        ctx.body = JSON.stringify(updateState(state => state.mergeIn(['intel'], fromJS(body))).get('intel'))
    }
}

function createStopMiddleware(updateState) {
    return async function (ctx) {
        ctx.set('Content-Type', 'application/json')
        updateState(state => state.setIn(['state', 'isActive'], false))
        ctx.body = JSON.stringify({ detail: 'Stopped' })
    }
}

function createStartMiddleware(updateState) {
    return async function (ctx) {
        ctx.set('Content-Type', 'application/json')
        updateState(state => state.setIn(['state', 'isActive'], true))
        ctx.body = JSON.stringify({ detail: 'Started' })
    }
}

module.exports = {
    errorHandler,
    createAuthMiddleware,
    createLoginMiddleware,
    createLogoutMiddleware,
    createGetStateMiddleware,
    createPutStateMiddleware,
    createPatchStateMiddleware,
    createGetIntelMiddleware,
    createPutIntelMiddleware,
    createPatchIntelMiddleware,
    createStopMiddleware,
    createStartMiddleware,
}
