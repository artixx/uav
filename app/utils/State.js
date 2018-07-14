const { Map, List } = require('immutable')

class State {
    constructor(state = new Map()) {
        this._state = state
        this._listeners = new List()

        this.getState = this.getState.bind(this)
        this.updateState = this.updateState.bind(this)
        this.subscribe = this.subscribe.bind(this)
        this._unsubscribe = this._unsubscribe.bind(this)
        this._callAllListeners = this._callAllListeners.bind(this)
    }

    getState() {
        return this._state
    }

    updateState(func) {
        this._state = func(this._state)
        this._callAllListeners()
        return this._state
    }

    subscribe(func) {
        this._listeners = this._listeners.push(func)
        return () => this._unsubscribe(func)
    }

    _callAllListeners() {
        this._listeners.forEach(one => one(this))
    }

    _unsubscribe(func) {
        this._listeners = this._listeners.delete(this._listeners.findIndex(one => one === func))
    }
}

module.exports = { State }
