const { List, Map, fromJS } = require('immutable')

const { getLastGroupId: getLastGroupIdApi, filterMembers } = require('../utils/vk')
const { TokenMachine } = require('../utils/TokenMachine')
const { tryParseJson } = require('../utils/commons')
const { log } = require('../utils/logger')

function complement(a, b) {
    return a.filter(aMember => !b.some(bMember => bMember === aMember))
}

/* eslint-disable max-params */
/* eslint-disable no-await-in-loop */
function updateIntel(state = new Map(), uid, gid, isMember, timestamp) {
    uid = String(uid)
    gid = String(gid)

    if (isMember) {
        if (state.has(uid)) {
            if (!state.hasIn([uid, gid]) || timestamp > state.getIn([uid, gid])) {
                return state.setIn([uid, gid], timestamp)
            }
        } else {
            return state.set(uid, new Map({ [gid]: timestamp }))
        }
    } else if (state.has(uid)) {
        if (state.hasIn([uid, gid]) && timestamp > state.getIn([uid, gid])) {
            return state.deleteIn([uid, gid])
        }
    } else {
        return state.set(uid, new Map())
    }
    return state
}

function updateBunch(oldUids, newUids, gid, updateIntel) {
    newUids
        .forEach(uid => updateIntel(uid, gid, true))

    complement(oldUids, newUids)
        .forEach(uid => updateIntel(uid, gid, false))
}

async function scanGroup(gid, uids, updateIntel, token) {
    let filteredUids
    try {
        filteredUids = fromJS(await filterMembers(gid, uids, token))
    } catch (e) {
        // Ignoring Access Denied
        if (tryParseJson(e.message, {}).error_code === 15) {
            return gid
        }
        log.error('Error while scanning group', e.message)
        return gid
    }

    if (filteredUids && List.isList(filteredUids)) {
        updateBunch(uids, filteredUids, gid, updateIntel)
    }

    return gid
}

async function flight(getState, updateState) {
    return new Promise(resolve => {
        log.info('Flight is started from', getState().getIn(['state', 'lastGid']))
        const startGid = getState().getIn(['state', 'lastGid'])
        const endGid = getState().getIn(['state', 'endGid'])
        let currentGid = startGid
        let pendingGroups = new List()

        function updateIntelWith(uid, gid, isMember) {
            updateState(state =>
                state.update('intel', intel =>
                    updateIntel(intel, uid, gid, isMember, Date.now())))
        }

        let needMore = true

        const tokenMachine = new TokenMachine(175)
        const getRequestPermission = () => {
            return tokenMachine.takeToken()
        }

        const requestDone = gid => {
            log.debug('done', gid)
            pendingGroups = pendingGroups.delete(pendingGroups.findIndex(one => one === gid))
            tokenMachine.returnToken()

            if (pendingGroups.size) {
                updateState(state => state.setIn(['state', 'lastGid'], pendingGroups.first()))
            }

            if (!needMore && !pendingGroups.size) {
                log.info('Flight is over on', getState().getIn(['state', 'lastGid']))
                resolve()
            }
        }

        const makeRequest = () => {
            log.debug('start', currentGid)
            pendingGroups = pendingGroups.push(currentGid)
            const promise = scanGroup(currentGid, getState().getIn(['state', 'targets']), updateIntelWith, getState().getIn(['state', 'token']))
            if (currentGid >= endGid) {
                needMore = false
            } else {
                currentGid++
            }
            return promise
        }

        const checkActive = () => {
            if (!getState().getIn(['state', 'isActive'])) {
                needMore = false
            }
        }

        (async function iterator() {
            checkActive()
            if (needMore) {
                await getRequestPermission()
                makeRequest().then(requestDone)
                setImmediate(iterator)
            }
        })()
    })
}

async function getFlightPermission(getState, onStateNextUpdate) {
    for (;;) {
        if (getState().getIn(['state', 'isActive'])) {
            return
        }
        await onStateNextUpdate()
    }
}

async function getLastGroupId(getState, onStateNextUpdate) {
    for (;;) {
        try {
            return await getLastGroupIdApi(getState().getIn(['state', 'token']))
        } catch (e) {
            log.error('Error on getting last gid', e)
        }
        await onStateNextUpdate()
    }
}

async function setLastGroupId(getState, updateState, onStateNextUpdate) {
    log.info('Finding latest created vk group')
    await getLastGroupId(getState, onStateNextUpdate)
        .then(lastGid => updateState(state => state.setIn(['state', 'endGid'], lastGid)))
    log.info('Latest group id is', getState().getIn(['state', 'endGid']))
    if (getState().getIn(['state', 'lastGid']) >= getState().getIn(['state', 'endGid'])) {
        updateState(state => state.setIn(['state', 'lastGid'], 1))
        log.info('Latest group already scanned, starting again from', 1)
    }
}

async function startLoop(getState, updateState, subscribeToState) {
    function onStateNextUpdate() {
        return new Promise(resolve => {
            const unsubscribe = subscribeToState(() => {
                unsubscribe()
                resolve()
            })
        })
    }

    for (;;) {
        await getFlightPermission(getState, onStateNextUpdate)
        await setLastGroupId(getState, updateState, onStateNextUpdate)
        await flight(getState, updateState)
    }
}

module.exports = {
    startLoop,
}
