const _ = require("lodash");

const globalKeyEnum = require("../enum/global.key.enum");

function setGlobalKey(key, value) {
    if (!Object.keys(globalKeyEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeyEnum`)
    }
    global[key] = value
}

function getGlobalKey(key) {
    if (!Object.keys(globalKeyEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeyEnum`)
    }

    return global[key]
}

function deleteGlobalKey(key) {
    if (_.isEmpty(key)) {
        throw new Error(`Key ${key} is empty`)
    }

    delete global[key]
}

module.exports = {
    setGlobalKey: setGlobalKey, getGlobalKey: getGlobalKey, deleteGlobalKey: deleteGlobalKey,
}