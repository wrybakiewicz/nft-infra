require("dotenv").config()
const {Pool} = require('pg')
const {getCollectionHolderHoldings} = require("./service");

const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME
};

const pool = new Pool(dbConfig)

let client;

async function query(query, value) {
    if (client === undefined) {
        await initializeDbClient()
    }
    try {
        return await client.query(query, value)
    } catch (e) {
        console.log("Error querying")
        throw e
    }
}

const initializeDbClient = async () => {
    try {
        client = await pool.connect()
    } catch (e) {
        console.log("Error initializing client")
        throw e
    }
}

const buildResponse = (statusCode, bodyJson) => {
    return {
        "statusCode": statusCode,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET"
        },
        "body": JSON.stringify(bodyJson),
    }
}

const getCollectionHoldersHoldings = async (address, block) => {
    let blockQuery = ""
    if(block) {
        blockQuery = ` AND BLOCK <= ${block}`
    }
    const transfers = await query("SELECT from_address as from, to_address as to, token_id as token, block FROM transfers WHERE contract_address=$1" + blockQuery, [address]).then(result => result.rows)
    return getCollectionHolderHoldings(transfers)
}

const isCollectionIndexed = (collection) => {
    return query("SELECT COUNT(*) FROM collections WHERE contract_address=$1", [collection]).then(_ => _.rows[0].count !== "0")
}

const isRequestValid = (event) => {
    const queryParams = event.queryStringParameters
    return queryParams && queryParams.collection
}

exports.handler = async (event, context) => {
    try {
        if(!isRequestValid(event)) {
            return buildResponse(400, {error: "Pass block and collection as params"})
        }
        const queryParams = event.queryStringParameters
        const block = queryParams.block
        const collection = queryParams.collection.toLowerCase()

        console.log(`Getting collection: ${collection} holders holdings at block: ${block}`)

        const isIndexed = await isCollectionIndexed(collection)

        console.log(isIndexed)
        if (!isIndexed) {
            return buildResponse(404, {error: "Collection is not indexed"})
        }

        const holdersHoldings = await getCollectionHoldersHoldings(collection, block)

        console.log(`Got collection: ${collection} holders holdings at block: ${block}`)

        return buildResponse(200, {holdersHoldings: holdersHoldings})
    } catch (err) {
        console.log(err);
        throw err;
    }
};
