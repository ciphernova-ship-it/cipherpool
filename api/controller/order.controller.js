const util = require('util');
const _ = require('lodash');

const mongoLib = require("../../lib/mongo.lib");
const loggerLib = require('../../lib/logger.lib');

const orderModel = require("../../model/order.model");

async function addOrder(req, res) {
    try {
        const {maker, sourceToken, destToken, ciphertext, dataToEncryptHash} = req.body;
        if (_.isEmpty(maker) || _.isEmpty(sourceToken) || _.isEmpty(destToken) || _.isEmpty(ciphertext) || _.isEmpty(dataToEncryptHash)) {
            return res.status(400).json({
                message: 'Missing required fields!',
                maker: maker,
                sourceToken: sourceToken,
                destToken: destToken,
                ciphertext: ciphertext,
                dataToEncryptHash: dataToEncryptHash
            });
        }

        await mongoLib.insertOne(orderModel, {
            maker: maker,
            sourceToken: sourceToken,
            destToken: destToken,
            ciphertext: ciphertext,
            dataToEncryptHash: dataToEncryptHash
        });

        return res.status(200).json({
            message: 'Order created successfully',
            order: {
                maker: maker,
                sourceToken: sourceToken,
                destToken: destToken,
                ciphertext: ciphertext,
                dataToEncryptHash: dataToEncryptHash
            }
        });
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).json({
            message: "Some error occurred!",
            error: util.inspect(error)
        })
    }
}

module.exports = {
    addOrder: addOrder
}