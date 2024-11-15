const logger = require('numan-logger');

function logInfo(message) {
    try {
        logger.logInfo(message);
    } catch (error) {
        throw error;
    }
}

function logWarning(message) {
    try {
        logger.logWarning(message);
    } catch (error) {
        throw error;
    }
}

function logError(message) {
    try {
        logger.logError(message);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    logInfo: logInfo,
    logError: logError,
    logWarning: logWarning,
}