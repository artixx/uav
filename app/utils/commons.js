function tryParseJson(jsonString, onError = () => {}) {
    try {
        return JSON.parse(jsonString)
    } catch (e) {
        if (typeof onError === 'function') {
            return onError()
        }
        return onError
    }
}

module.exports = {
    tryParseJson,
}
