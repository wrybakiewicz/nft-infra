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

const queryWithCommit = async function (query, value) {
    if (client === undefined) {
        await initializeDbClient()
    }
    try {
        const insertResult =  await client.query(query, value)
        await client.query('COMMIT')
        return insertResult
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

const insertTransfers = async (address, transfers) => {
    if(transfers.length === 0) {
        return
    }
    const mappedTransfers = transfers.map(transfer => {
        return {
            from: transfer.from,
            to: transfer.to,
            tokenId: parseInt(transfer.tokenId, 16),
            block: parseInt(transfer.blockNum, 16)
        }
    })
    console.log(mappedTransfers.length)
    await insertNewValues(address, mappedTransfers)
}

const updateTransfers = async (address, latestSavedBlock, firstRequest, pageKey) => {
    if (firstRequest || pageKey) {
        const result = await getTransfersExec(address, pageKey, latestSavedBlock, 10)
        await insertTransfers(address, result.transfers)
        return updateTransfers(address, latestSavedBlock, false, result.pageKey)
    }
}

const getTransfersExec = async (address, pageKey, latestSavedBlock, retry) => {
    try {
        return await getTransfersExecRetry(address, pageKey, latestSavedBlock)
    } catch (e) {
        console.error("Error during getTransfersExec");
        console.error(e.response.status)
        if (retry > 0) {
            return getTransfersExec(address, pageKey, latestSavedBlock, retry - 1)
        } else {
            throw e
        }
    }
}

const getTransfersExecRetry = async (contractAddress, pageKey, latestSavedBlock) => {
    console.log(`Getting transfer exec: ${contractAddress} pageKey: ${pageKey}`)
    let fromBlock;
    if (latestSavedBlock) {
        fromBlock = '0x' + (latestSavedBlock + 1).toString(16)
    } else {
        fromBlock = `0x0`
    }
    const config = {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
            {
                fromBlock: fromBlock,
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
    const result = await axios.post(ALCHEMY_BASE_URL, config).then(result => result.data.result)
    if (result === undefined) {
        return {transfers: []}
    } else {
        return result
    }
}

const getLatestSavedBlock = (address) => {
    return query("SELECT MAX(block) FROM transfers WHERE contract_address=$1", [address]).then(_ => _.rows[0].max)
}

const updateCollection = async (address) => {
    console.log("Updating collection: " + address)
    const latestSavedBlock = await getLatestSavedBlock(address)
    await updateTransfers(address, latestSavedBlock, true, undefined)
    console.log("Updated collection: " + address)
}

const updateCollectionSafe = async (address) => {
    try {
        await updateCollection(address)
    } catch (e) {
        console.log("Fail during updating collection " + address)
    }
}

const insertNewValues = async (address, transfers) => {
    console.log("Inserting chunk for " + address)
    const insertValues = transfers
        .map(transfer => `('${address}', '${transfer.from}', '${transfer.to}', ${transfer.tokenId}, ${transfer.block})`)
        .join(", ")

    await queryWithCommit(`INSERT INTO transfers(contract_address, from_address, to_address, token_id, block)
                 VALUES ${insertValues}`)
    console.log("Inserted chunk for " + address)
}

const getCollectionAddresses = () => {
    return query("SELECT contract_address FROM collections").then(_ => _.rows.map(row => row.contract_address))
}

exports.handler = async (event, context) => {
    try {
        console.log("Updating collections data")

        let collectionAddresses
        if(event && event.address) {
            collectionAddresses = [event.address.toLowerCase()]
        } else {
            collectionAddresses = await getCollectionAddresses()
        }

        console.log(collectionAddresses)

        for (let i = 0; i < collectionAddresses.length; i++) {
            await updateCollectionSafe(collectionAddresses[i])
        }

        console.log("Updated collections data")
    } catch (err) {
        console.log(err);
        throw err;
    }
};
