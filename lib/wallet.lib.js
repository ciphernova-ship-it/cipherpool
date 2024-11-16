const ethers = require("ethers");
const _ = require("lodash");

function getWallet(privateKey, rpc) {
    try {
        if (_.isEmpty(privateKey) || _.isEmpty(rpc)) {
            throw new Error(`Missing args! privateKey: ${privateKey}`);
        }

        return new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(rpc));
    } catch (error) {
        throw error;
    }
}

function getProvider(rpc) {
    try {
        if (_.isEmpty(rpc)) {
            throw new Error(`Missing args! rpc: ${rpc}`);
        }

        return new ethers.providers.JsonRpcProvider(rpc);
    } catch (error) {
        return error;
    }
}

module.exports = {
    getWallet: getWallet,
    getProvider: getProvider
}


