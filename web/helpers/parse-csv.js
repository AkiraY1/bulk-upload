import shopify from "../shopify.js";
import Papa from "papaparse";

export async function getCsvJson(req, res) {
    const csvData = await new Promise((resolve) => {
        const data = [];
        Papa.parse(req, {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader: h => h.trim(), //Gets rid of double quotes around key row
            chunk: function(result) {
                console.log("Pushed Data")
                data.push(...result.data);
            },
            complete: function (results) {
                console.log(data.length);
                resolve(data);
            }
        });
    });
    return csvData;
}