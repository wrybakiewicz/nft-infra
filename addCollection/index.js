require("dotenv").config()
const {Pool} = require('pg')
const ethereum_address = require('ethereum-address');
const aws = require('aws-sdk');
const lambda = new aws.Lambda({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'eu-central-1'});

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
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
        },
        "body": JSON.stringify(bodyJson),
    }
}

const isRequestValid = (event) => {
    return event && event.body && JSON.parse(event.body) && JSON.parse(event.body).address
        && JSON.parse(event.body).address !== "" && ethereum_address.isAddress(JSON.parse(event.body).address)
}

exports.handler = async (event, context) => {
    try {
        console.log(event)

        if (!isRequestValid(event)) {
            return buildResponse(400, {error: "Address is required"})
        }

        const address = JSON.parse(event.body).address.toLowerCase()

        console.log(`Adding collection ` + address)

        const indexedCollections = await query("SELECT contract_address as address FROM collections", []).then(result => result.rows)

        const existingCollections = indexedCollections.filter(collection => collection.address === address)

        if (existingCollections.length !== 0) {
            return buildResponse(400, {error: "Collection is indexed"})
        }

        await query("INSERT INTO collections(contract_address) VALUES ($1)", [address])

        console.log(`Added collection ` + address)

        await lambda.invoke({FunctionName: 'updateCollectionsData', Payload: JSON.stringify({ address : address })}).promise();

        return buildResponse(200, {})
    } catch (err) {
        console.log(err);
        throw err;
    }
};
