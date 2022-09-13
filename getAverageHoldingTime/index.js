require("dotenv").config()
const {Pool} = require('pg')
const axios = require("axios");
const {getAverageHoldingTime} = require("./service");

const ALCHEMY_BASE_URL = `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}/`

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

const getToBlock = async (block) => {
    if (block) {
        return block
    } else {
        const config = {
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_blockNumber'
        }
        return await axios.post(ALCHEMY_BASE_URL, config).then(result => parseInt(result.data.result, 16))
    }
}

const getAverageNftHoldingTime = async (address, block) => {
    let blockQuery = ""
    if (block) {
        blockQuery = ` AND BLOCK <= ${block}`
    }
    const orderBy = " ORDER BY id"
    const queryString = "SELECT from_address as from, to_address as to, token_id as token, block FROM transfers WHERE contract_address=$1" + blockQuery + orderBy
    const transfers = await query(queryString, [address]).then(result => result.rows)
    return getAverageHoldingTime(transfers, await getToBlock(block))
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
        if (!isRequestValid(event)) {
            return buildResponse(400, {error: "Pass block and collection as params"})
        }
        const queryParams = event.queryStringParameters
        const block = queryParams.block
        const collection = queryParams.collection.toLowerCase()

        console.log(`Getting average holding time for: ${collection} at block: ${block}`)

        const isIndexed = await isCollectionIndexed(collection)

        console.log(isIndexed)
        if (!isIndexed) {
            return buildResponse(404, {error: "Collection is not indexed"})
        }

        const averageHoldingTime = await getAverageNftHoldingTime(collection, block)

        console.log(`Got average holding time for: ${collection} at block: ${block}`)

        return buildResponse(200, {averageHoldingTime: averageHoldingTime})
    } catch (err) {
        console.log(err);
        throw err;
    }
};
