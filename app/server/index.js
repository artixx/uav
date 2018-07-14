const Koa = require('koa')
const Router = require('koa-router')
const compress = require('koa-compress')
const favicon = require('koa-favicon')
const path = require('path')
const koaBody = require('koa-body')

const {
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
} = require('./middlewares')

const { log } = require('../utils/logger')

function startServer(port, getState, updateState) {
    const app = new Koa()
    const protectedRoutes = new Router()
    const publicRoutes = new Router()

    publicRoutes
        .post('/login', createLoginMiddleware())

    protectedRoutes
        .post('/logout', createLogoutMiddleware())
        .get('/state', createGetStateMiddleware(getState))
        .put('/state', createPutStateMiddleware(updateState))
        .patch('/state', createPatchStateMiddleware(updateState))
        .get('/intel', createGetIntelMiddleware(getState))
        .put('/intel', createPutIntelMiddleware(updateState))
        .patch('/intel', createPatchIntelMiddleware(updateState))
        .post('/stop', createStopMiddleware(updateState))
        .post('/start', createStartMiddleware(updateState))

    const connection = app
        .use(koaBody())
        .use(compress())
        .use(errorHandler)
        .use(favicon(path.join(__dirname, 'favicon.ico')))
        .use(publicRoutes.routes())
        .use(createAuthMiddleware())
        .use(protectedRoutes.routes())
        .listen(port)

    log.info(`Server activated at port ${port}`)

    return connection
}

module.exports = {
    startServer,
}
