import express from "express";
import shopify from "../shopify.js";
import {
    getCsvJson,
    applyMetafieldChanges
} from "../helpers/parse-csv.js";

export default function applyApiEndpoints(app) {
    app.use(express.json());

    app.post("/api/csvparse", async (req, res) => {
        try {
            const response = await getCsvJson(req, res);
            res.status(200).send(response);
        } catch(error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    });

    app.post("/api/setMetafield", async (req, newRes) => {
        try {
            const response = await applyMetafieldChanges(req, newRes);
            let sendBody = JSON.stringify({"successNum": response.toString()});
            console.log("sendBody: ", sendBody);
            newRes.send(sendBody);
            //newRes.sendStatus(200);
            //newRes.send({ successCount: response});
        } catch(error) {
            console.error(error);
            newRes.sendStatus(500);
        }
    });
}