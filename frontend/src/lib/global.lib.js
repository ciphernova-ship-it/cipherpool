import _ from "lodash";

import globalKeysEnum from "../enum/global.key.enum.js"

function setGlobalKey(key, value) {
    if (!Object.keys(globalKeysEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeysEnum`)
    }
    window[key] = value
}

function getGlobalKey(key) {
    if (!Object.keys(globalKeysEnum).includes(key)) {
        throw new Error(`Key ${key} not found in globalKeysEnum`)
    }

    return window[key]
}

function deleteGlobalKey(key) {
    if (_.isEmpty(key)) {
        throw new Error(`Key ${key} is empty`)
    }

    delete window[key]
}

export default {
    setGlobalKey: setGlobalKey, getGlobalKey: getGlobalKey, deleteGlobalKey: deleteGlobalKey,
}