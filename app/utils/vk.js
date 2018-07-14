const axios = require('axios')

function getApiUrl(string, token) {
    return `https://api.vk.com/method/${string}&access_token=${token}&v=5.73`
}

async function callUntilGood(url) {
    try {
        await axios.get(url)
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            setTimeout(() => callUntilGood(url), 1000)
        } else {
            throw e
        }
    }
}

async function callApi(url) {
    let response
    try {
        response = await axios.get(url)
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            response = callUntilGood(url)
        }
        throw e
    }

    if (response.data.error) {
        throw new Error(JSON.stringify(response.data.error))
    }

    return response.data.response
}

async function filterMembers(groupId = 1, userIds = [1], token) {
    const url = getApiUrl(`groups.isMember?group_id=${groupId}&user_ids=${userIds.join(',')}`, token)
    const result = []
    const response = await callApi(url)

    response.forEach(one => {
        if (one.member) {
            result.push(one.user_id)
        }
    })

    return result
}

async function getLastGroupId(token) {
    const radius = 20

    /* eslint-disable camelcase */
    function checkGroupExist(group) {
        const notExistPair = {
            id: group.id,
            name: 'DELETED',
            screen_name: `club${group.id}`,
            is_closed: 0,
            type: 'group',
            deactivated: 'deleted',
        }

        return Object.keys(notExistPair).some(key => group[key] !== notExistPair[key])
    }

    // Зарезервированные группы вк неотлечимы от несозданных
    async function checkBunchExistence(id, radius = 5) {
        const ids = []
        for (let i = id - radius; i < id + radius; i++) {
            ids.push(i)
        }

        const url = getApiUrl(`groups.getById?group_ids=${ids.join()}`, token)
        const groups = await callApi(url)

        return groups.some(group => checkGroupExist(group))
    }

    async function getLastestIdInRadius(id, radius = 5) {
        /* eslint-disable no-await-in-loop */
        for (let i = id + radius - 1; i >= id - radius; i--) {
            const url = getApiUrl(`groups.getById?group_id=${i}`, token)
            const response = await callApi(url)
            const group = response[0]

            if (checkGroupExist(group)) {
                return i
            }
        }
    }

    async function findRecursive(id, c, maxExistId) {
        const isExist = await checkBunchExistence(id, radius)

        return (c < 1)
            ? isExist
                ? id
                : maxExistId
            : findRecursive(
                isExist ? id + c : id - c,
                c / 2,
                isExist && (id > maxExistId) ? id : maxExistId
            )
    }

    return findRecursive(Math.pow(2, 30), Math.pow(2, 29), 0)
        .then(id => getLastestIdInRadius(id, radius))
}

async function getValidGroups(startId, endId, token) {
    function checkValid(group) {
        return !(group.deactivated === 'deleted' || group.deactivated === 'banned' || group.is_closed === 2)
    }

    const ids = []
    for (let i = startId; i <= endId; i++) {
        ids.push(i)
    }

    const url = getApiUrl(`groups.getById?group_ids=${ids.join(',')}`, token)
    const groups = await callApi(url)

    return groups.filter(group => checkValid(group)).map(group => group.id)
}

// For front-end only
// TODO Get group infos by their ids
async function getGroups() {

}

// TODO Get all user's friends info
async function getFriends() {

}

module.exports = {
    filterMembers,
    getLastGroupId,
    getValidGroups,
    getGroups,
    getFriends,
}
