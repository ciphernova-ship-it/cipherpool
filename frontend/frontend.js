import path from "path";
import express from "express";
const app = express();
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import frontendConfig from "../config/frontend.config.json" assert { type: 'json' };

(async () => {
    try {
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(express.static(path.join(__dirname, "./dist")));

        app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "./dist/index.html"));
        });

        app.listen(frontendConfig.port, () => {
            console.log("Frontend is running on port: ", frontendConfig.port);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
})();