require("dotenv").config({path: "../.env"});
const _ = require("lodash");

const mongoLib = require("../lib/mongo.lib");
const helperLib = require("../lib/helper.lib");
const loggerLib = require("../lib/logger.lib");

const orderModel = require("../model/order.model");

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);

        let orders = [], pairOrders = [];
        while (true) {
            orders = await mongoLib.find(orderModel, {});

            if (_.isEmpty(orders)) {
                loggerLib.logInfo("No orders found!");
                continue;
            }

            pairOrders = [];
            orders.forEach((order) => {
                orders.forEach((innerOrder) => {
                    if (order.sourceToken === innerOrder.destToken && order.destToken === innerOrder.sourceToken) {
                        pairOrders.push({
                            fromOrder: order,
                            toOrder: innerOrder
                        });
                    }
                });
            });

            if (_.isEmpty(pairOrders)) {
                loggerLib.logInfo("No pair orders found!");
                continue;
            }

            //TODO: Implement matching logic here using lit protocol
        }
    } catch (error) {
        loggerLib.logError(error);
        process.exit(1);
    }
})();