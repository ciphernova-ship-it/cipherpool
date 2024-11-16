const fs = require("fs");
const ethers = require("ethers");
const _ = require("lodash");
const {LIT_RPC} = require("@lit-protocol/constants");

const loggerLib = require("../lib/logger.lib.js");
const globalLib = require("../lib/global.lib.js");

const globalKeyEnum = require("../enum/global.key.enum.js");

function initialiseWallet(privateKey) {
    try {
        if (_.isEmpty(privateKey)) {
            throw new Error(`Missing args! privateKey: ${privateKey}`);
        }

        const wallet = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE));
        globalLib.setGlobalKey(globalKeyEnum.WALLET, wallet);
        loggerLib.logInfo(`Wallet initialised successfully! address: ${wallet.address}`);
    } catch (error) {
        throw error;
    }
}

function isWalletInitialised() {
    try {
        return globalLib.getGlobalKey(globalKeyEnum.WALLET) !== undefined;
    } catch (error) {
        throw error;
    }
}

function getAndMaybeInitialiseWallet() {
    try {
        if (!isWalletInitialised()) {
            initialiseWallet();
        }

        return globalLib.getGlobalKey(globalKeyEnum.WALLET);
    } catch (error) {
        throw error;
    }
}

function getWallet() {
    try {
        if (!isWalletInitialised()) {
            throw new Error("Wallet not initialised!");
        }

        return globalLib.getGlobalKey(globalKeyEnum.WALLET);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getWallet: getWallet,
    initialiseWallet: initialiseWallet,
    isWalletInitialised: isWalletInitialised,
    getAndMaybeInitialiseWallet: getAndMaybeInitialiseWallet,
}


