const fs = require('fs')
const { parse, format } = require('path')

const steno = require('steno')

// TODO ensure this is the right thing to do
function getPossibleBackupPath(path) {
    const pathObject = parse(path)
    pathObject.base = '.~' + pathObject.base
    return format(pathObject)
}

function readFile(filename) {
    return new Promise((resolve, reject) =>
        fs.readFile(getPossibleBackupPath(filename), (err, data) => err
            ? fs.readFile(filename, (err, data) => err ? reject(err) : resolve(data))
            : resolve(data))
    )
}

function readFileSync(filename) {
    try {
        return fs.readFileSync(getPossibleBackupPath(filename))
    } catch (e) {
        return fs.readFileSync(filename)
    }
}

function writeFile(filename, string) {
    return new Promise((resolve, reject) => steno.writeFile(filename, string, err => err ? reject(err) : resolve(true)))
}

function writeFileSync(filename, string) {
    return steno.writeFileSync(filename, string)
}

module.exports = {
    readFile,
    readFileSync,
    writeFile,
    writeFileSync,
}
