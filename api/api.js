require("dotenv").config({path: "../.env"});
const path = require("path");
const express = require("express");
const app = express();
const cors = require('cors');

const mongoLib = require("../lib/mongo.lib");
const loggerLib = require('../lib/logger.lib');

const apiConfig = require("../config/api.config.json");
const userRoutes = require("./route/user.route");
const orderRoutes = require("./route/order.route");

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);

        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));

        app.get("/", (req, res) => {
            return res.sendFile(path.resolve(__dirname, "./view/index.html"));
        });
        app.use("/user", userRoutes);
        app.use("/order", orderRoutes);

        app.listen(apiConfig.port, () => {
            loggerLib.logInfo(`API started on port: ${apiConfig.port}`);
        });
    } catch (error) {
        loggerLib.logError(error);
        process.exit(1);
    }
})();