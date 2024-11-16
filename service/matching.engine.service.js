require("dotenv").config({path: "../.env"});
const _ = require("lodash");

const litLib = require("../lib/lit.lib");
const mongoLib = require("../lib/mongo.lib");
const walletLib = require("../lib/wallet.lib");
const helperLib = require("../lib/helper.lib");
const loggerLib = require("../lib/logger.lib");

const litConfig = require("../config/lit.config.json");
const orderModel = require("../model/order.model");

(async () => {
    try {
        await walletLib.initialiseWallet(process.env.MATCHING_ENGINE_PRIVATE_KEY);
        await litLib.connect();
        await litLib.generateSessionSigs();
        const sessionSigs = await litLib.getSessionSigs();
        await mongoLib.connect(process.env.MONGO_URL);

        let orders = [], pairOrders = [], matchingCalls = [], matchingChecks = [];
        while (true) {
            orders = await mongoLib.findWithSelect(orderModel, {}, {_id: 0, __v: 0});

            if (_.isEmpty(orders)) {
                loggerLib.logInfo("No orders found!");
                await helperLib.sleep(1000);
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
                await helperLib.sleep(1000);
                continue;
            }

            // console.log(pairOrders);

            matchingCalls = pairOrders.map((pairOrder) => litLib.executeLitAction(litConfig.orderMatchingLitActionCid, sessionSigs, {
                order1AccessControlConditions: litLib.getOrderEncryptionAcc(pairOrder.fromOrder.maker),
                order1Ciphertext: pairOrder.fromOrder.ciphertext,
                order1DataToEncryptHash: pairOrder.fromOrder.dataToEncryptHash,
                order2AccessControlConditions: litLib.getOrderEncryptionAcc(pairOrder.toOrder.maker),
                order2Ciphertext: pairOrder.toOrder.ciphertext,
                order2DataToEncryptHash: pairOrder.toOrder.dataToEncryptHash,
            }));
            matchingChecks = await Promise.all(matchingCalls);
            console.log(matchingChecks);
            process.exit(1);

            pairOrders.forEach((pairOrder, index) => {
                const matchingCheck = matchingChecks[index];
                if (matchingCheck.response === "MATCHED") {
                    loggerLib.logInfo("Match found!");
                    loggerLib.logInfo(`From order: ${JSON.stringify(pairOrder.fromOrder)}`);
                    loggerLib.logInfo(`To order: ${JSON.stringify(pairOrder.toOrder)}`);
                }
            });

            await helperLib.sleep(1000);
        }
    } catch (error) {
        loggerLib.logError(error);
        process.exit(1);
    }
})();