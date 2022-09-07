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

const getTransfers = (contractAddress) => {
    return getTransfersSum([], contractAddress, true, undefined)
}

const getTransfersSum = async (transfers, contractAddress, firstRequest, pageKey) => {
    if (firstRequest || pageKey) {
        const result = await getTransfersExec(contractAddress, pageKey)
        const newTransfers = transfers.concat(result.transfers)
        return getTransfersSum(newTransfers, contractAddress, false, result.pageKey)
    } else {
        return transfers
    }
}

const getTransfersExec = (contractAddress, pageKey) => {
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

exports.handler = async (event, context) => {
    try {
        console.log("Updating collections data")

        const nftContractAddress = "0x5c9D55b78FEBCC2061715BA4f57EcF8EA2711F2c"

        const transfers = await getTransfers(nftContractAddress)
        const mappedTransfers = transfers.map(transfer => {
            return {
                from: transfer.from,
                to: transfer.to,
                tokenId: transfer.tokenId,
                block: transfer.blockNum
            }
        })

        console.log(mappedTransfers)
        console.log(mappedTransfers.length)

        await query("INSERT INTO transfers(contract_address, transfers_json) VALUES($1, $2)", [nftContractAddress, JSON.stringify(mappedTransfers)])

        console.log("Updated collections data")
    } catch (err) {
        console.log(err);
        throw err;
    }
};
