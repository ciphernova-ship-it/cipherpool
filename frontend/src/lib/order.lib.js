import _ from "lodash";

import litLib from './lit.lib';
import litConfig from "../../../config/lit.config.json";

function getOrderEncryptionAcc(maker) {
    try {
        if(_.isEmpty(maker)) {
            throw new Error(`Missing args! maker: ${maker}`);
        }

        return  [
            {
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
                },
            },
            {operator: "or"},
            {
                contractAddress: '',
                standardContractType: '',
                chain: 'ethereum',
                method: '',
                parameters: [':currentActionIpfsId'],
                returnValueTest: {
                    comparator: '=',
                    value: litConfig.orderMatchingLitActionCid,
                },
            }
        ]
    } catch (error) {
        throw error;
    }
}

async function encryptOrder(sourceTokenAmount, destTokenAmount, maker) {
    try {
        if (_.isNil(sourceTokenAmount) || _.isNil(destTokenAmount) || _.isEmpty(maker)) {
            throw new Error(`Missing args! sourceTokenAmount: ${sourceTokenAmount} destTokenAmount: ${destTokenAmount} maker: ${maker}`);
        }

        const {
            ciphertext,
            dataToEncryptHash
        } = await litLib.encrypt(JSON.stringify({
            sourceTokenAmount: sourceTokenAmount,
            destTokenAmount: destTokenAmount
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