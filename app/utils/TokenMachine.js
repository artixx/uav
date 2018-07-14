const { List } = require('immutable')

class TokenMachine {
    constructor(max) {
        this._freeTokens = max
        this._queue = new List()
        this.takeToken = this.takeToken.bind(this)
        this.returnToken = this.returnToken.bind(this)
    }

    _take() {
        this._freeTokens = this._freeTokens - 1
    }

    _return() {
        this._freeTokens = this._freeTokens + 1
    }

    _resolveQueue() {
        while (this._queue.size && this._freeTokens > 0) {
            this._take()
            this._queue.get(0)()
            this._queue = this._queue.delete(0)
        }
    }

    takeToken() {
        return new Promise(resolve => {
            if (this._freeTokens > 0) {
                this._take()
                resolve()
            } else {
                this._queue = this._queue.push(resolve)
            }
        })
    }

    returnToken() {
        this._return()
        this._resolveQueue()
    }
}

module.exports = { TokenMachine }
