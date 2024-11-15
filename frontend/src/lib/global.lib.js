import _ from "lodash";

import globalKeysEnum from "../enum/global.key.enum.js"

function setGlobalKey(key, value) {
    if (!Object.keys(globalKeysEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeysEnum`)
    }
    global[key] = value
}

function getGlobalKey(key) {
    if (!Object.keys(globalKeysEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeysEnum`)
    }

    return global[key]
}

function deleteGlobalKey(key) {
    if (_.isEmpty(key)) {
        throw new Error(`Key ${key} is empty`)
    }

    delete global[key]
}

export default {
    setGlobalKey: setGlobalKey, getGlobalKey: getGlobalKey, deleteGlobalKey: deleteGlobalKey,
}