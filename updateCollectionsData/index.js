require("dotenv").config()
const {Pool} = require('pg')
const axios = require("axios");

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

const getTransfers = (address) => {
    return getTransfersSum([], address, true, undefined)
}

const getTransfersSum = async (transfers, address, firstRequest, pageKey) => {
    if (firstRequest || pageKey) {
        const result = await getTransfersExec(address, pageKey, 3)
        const newTransfers = transfers.concat(result.transfers)
        return getTransfersSum(newTransfers, address, false, result.pageKey)
    } else {
        return transfers
    }
}

const getTransfersExec = async (address, pageKey, retry) => {
    try {
        return await getTransfersExecRetry(address, pageKey)
    } catch (e) {
        console.error("Error during getTransfersExec");
        console.error(e)
        if (retry > 0) {
            return getTransfersExec(address, pageKey, retry - 1)
        } else {
            throw e
        }
    }
}

const getTransfersExecRetry = (contractAddress, pageKey) => {
    console.log(`Getting transfer exec: ${contractAddress} pageKey: ${pageKey}`)
    const config = {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
            {
                fromBlock: `0x0`,
                toBlock: `latest`,
                withMetadata: false,
                excludeZeroValue: false,
                maxCount: '0x3e8',
                category: ['erc721'],
                contractAddresses: [`${contractAddress}`],
                pageKey: pageKey
            }
        ]
    }
    return axios.post(ALCHEMY_BASE_URL, config).then(result => result.data.result)
}

const splitIntoChunks = (array) => {
    const chunks = []
    const chunkSize = 1000;
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
}

const updateCollection = async (address) => {
    console.log("Updating collection: " + address)
    const transfers = await getTransfers(address)
    const mappedTransfers = transfers.map(transfer => {
        return {
            from: transfer.from,
            to: transfer.to,
            tokenId: parseInt(transfer.tokenId, 16),
            block: parseInt(transfer.blockNum, 16)
        }
    })
    console.log(mappedTransfers.length)

    const chunks = splitIntoChunks(mappedTransfers)
    console.log(chunks.length)

    await Promise.all(chunks.map(chunk => insertNewValues(address, chunk)))

    console.log("Updated collection: " + address)
}

const insertNewValues = async (address, transfers) => {
    console.log("Inserting chunk for " + address)
    const insertValues = transfers
        .map(transfer => `('${address}', '${transfer.from}', '${transfer.to}', ${transfer.tokenId}, ${transfer.block})`)
        .join(", ")

    await query(`INSERT INTO transfers(contract_address, from_address, to_address, token_id, block)
                 VALUES ${insertValues}`)
    console.log("Inserted chunk for " + address)
}

//TODO: update only the latest (by last block)
//TODO: thorughput retry better ?

exports.handler = async (event, context) => {
    try {
        console.log("Updating collections data")

        const collectionAddresses = (await query("SELECT contract_address FROM collections")).rows

        console.log(collectionAddresses)

        await Promise.all(collectionAddresses.map(address => updateCollection(address.contract_address)))

        console.log("Updated collections data")
    } catch (err) {
        console.log(err);
        throw err;
    }
};
