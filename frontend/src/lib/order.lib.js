import _ from "lodash";

import litLib from './lit.lib';

function getOrderEncryptionAcc(maker) {
    try {
        return [{
            contractAddress: '',
            standardContractType: '',
            chain: "ethereum",
            method: '',
            parameters: [
                ':userAddress',
            ],
            returnValueTest: {
                comparator: '=',
                value: maker
            }
        }]
    } catch (error) {
        throw error;
    }
}

async function encryptOrder(sourceToken, destToken, sourceTokenAmount, destTokenAmount, maker) {
    try {
        if (_.isEmpty(sourceToken) || _.isEmpty(destToken) || _.isNil(sourceTokenAmount) || _.isNil(destTokenAmount) || _.isEmpty(maker)) {
            throw new Error(`Missing args! sourceToken: ${sourceToken} destToken: ${destToken} sourceTokenAmount: ${sourceTokenAmount} destTokenAmount: ${destTokenAmount} maker: ${maker}`);
        }

        const {
            ciphertext,
            dataToEncryptHash
        } = await litLib.encrypt(JSON.stringify({
            sourceToken: sourceToken,
            destToken: destToken,
            sourceTokenAmount: sourceTokenAmount,
            destTokenAmount: destTokenAmount,
            maker: maker
        }), getOrderEncryptionAcc(maker));

        return {
            ciphertext: ciphertext,
            dataToEncryptHash: dataToEncryptHash
        };
    } catch (error) {
        throw error;
    }
}

export default {
    encryptOrder: encryptOrder,
    getOrderEncryptionAcc: getOrderEncryptionAcc,
}