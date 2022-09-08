require("dotenv").config()
const {Pool} = require('pg')
const {getCollectionHolderHoldings} = require("common");

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
    const transfers = await query("SELECT from_address as from, to_address as to, token_id as token, block FROM transfers WHERE contract_address=$1 AND block <= $2", [address, block]).then(result => result.rows)
    return getCollectionHolderHoldings(transfers)
}

const isCollectionIndexed = (collection) => {
    return query("SELECT COUNT(*) FROM collections WHERE contract_address=$1", [collection]).then(_ => _.rows[0].count !== "0")
}

exports.handler = async (event, context) => {
    try {
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
