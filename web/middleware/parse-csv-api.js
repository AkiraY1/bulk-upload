import express from "express";
import shopify from "../shopify.js";
import {
    getCsvJson
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
}