const util = require('util');
const _ = require('lodash');

const mongoLib = require('../../lib/mongo.lib.js');
const loggerLib = require('../../lib/logger.lib.js');

const orderModel = require('../../model/order.model.js');

async function getOrders(req, res) {
    try {
        const {userAddress} = req.params;
        if (_.isEmpty(userAddress)) {
            return res.status(400).json({message: 'userAddress is required!'});
        }

        //TODO: add pagination in future
        const orders = await mongoLib.findWithSelect(orderModel, {maker: userAddress},{_id: 0, __v: 0});
        return res.status(200).json({orders: orders});
    } catch (error) {
        loggerLib.logError(error);
        return res.status(500).json({
            message: "Some error occurred!",
            error: util.inspect(error)
        })
    }
}

module.exports = {
    getOrders: getOrders
}