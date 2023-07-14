import shopify from "../shopify.js";
import Papa from "papaparse";

//Returns all data for table: productTitle, productId, metafieldNamespace, metafieldKey, metafieldCurrentValue, metafieldNewValue
//CSF file must have: productId, metafieldNamespace, metafieldKey, metafieldNewValue
export async function getCsvJson(req, res) {
    const rawCsvData = await new Promise((resolve) => {
        const data = [];
        Papa.parse(req, {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader: h => h.trim(), //Gets rid of double quotes around all headers
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

    const formattedData = await _formatData(rawCsvData, res); 
    console.log(formattedData);
    return formattedData;
}

async function _formatData(rawCsvData, res) {
    const formattedCsvData = [];
    const errors = [];
    for (let i = 0; i < rawCsvData.length; i++) {
        let newRow = rawCsvData[i];

        //Get product title
        try {
            newRow["productTitle"] = await _getProductTitle(
                rawCsvData[i].productId,
                res
            );
        } catch(error) {
            newRow["productTitle"] = "NOT_FOUND";
            errors.push({
                index: i+1, 
                message: 'Product not found. "Product ID" is probably written incorrectly. No changes will be made to this product.'
            }); //Type 2 is product not found
        }

        //Get current metafield value
        try {
            newRow["metafieldCurrentValue"] =  await _getMetafieldValue( //dont forget to put await to get VALUE of promise, not just promise object
                rawCsvData[i].productId, 
                rawCsvData[i].metafieldNamespace, 
                rawCsvData[i].metafieldKey,
                res
            );
        } catch(error) {
            newRow["metafieldCurrentValue"] = "NOT_FOUND";
            errors.push({
                index: i+1, 
                message: 'Metafield not found. "Metafield Namespace", "Metafield Key" and/or "Product ID" are probably written incorrectly. No changes will be made to this product.'
            }); //Type 1 is metafield not found
        }
        formattedCsvData.push(newRow);
    };
    const finalFormattedData = [errors, ...formattedCsvData];
    return finalFormattedData;
}

async function _getMetafieldValue(productId, metafieldNamespace, metafieldKey, res) {
    const client = new shopify.api.clients.Graphql({session: res.locals.shopify.session, });
    const metafieldData = await client.query({
        data: {
            query: `query ProductMetafield($namespace: String!, $key: String!, $ownerId: ID!) {
                product(id: $ownerId) {
                    metafieldName: metafield(namespace: $namespace, key: $key) {
                        value
                    }
                }
            }`,
            variables: {
                "namespace": metafieldNamespace,
                "key": metafieldKey,
                "ownerId": `gid://shopify/Product/${productId}`
            },
        },
    });
    console.log(metafieldData.body.data.product.metafieldName.value);
    return metafieldData.body.data.product.metafieldName.value;
}

async function _getProductTitle(productId, res) {
    const client = new shopify.api.clients.Graphql({session: res.locals.shopify.session, });
    const productData = await client.query({
        data: {
            query: `query Product($ownerId: ID!) {
                product(id: $ownerId) {
                    title
                }
            }`,
            variables: {
                "ownerId": `gid://shopify/Product/${productId}`
            }
        }
    });
    return productData.body.data.product.title;
}