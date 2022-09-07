require("dotenv").config()
const {Pool} = require('pg')
const axios = require("axios");

const ALCHEMY_BASE_URL = `https://opt-mainnet.g.alchemy.com/nft/v2/${process.env.ALCHEMY_KEY}/`
const GET_OWNERS_FOR_CONTRACT = ALCHEMY_BASE_URL + "getOwnersForCollection"

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

const getTopHoldings = (owners, ownersNumber, totalSupply, percent) => {
    const topOwnersNumber = (ownersNumber * percent) / 100
    const top01OwnersBalances = owners.slice(0, topOwnersNumber).map(_ => _.balance)
    const top01Holdings = top01OwnersBalances.reduce((sum, element) => sum + element, 0)
    return 100 * (top01Holdings) / totalSupply
}

exports.handler = async (event, context) => {
    try {
        console.log("Updating collections data")

        const nftContractAddress = "0x5c9D55b78FEBCC2061715BA4f57EcF8EA2711F2c"

        const response = await axios.get(GET_OWNERS_FOR_CONTRACT, {
            params: {
                contractAddress: nftContractAddress,
                withTokenBalances: true
            }
        })
        const owners = response.data.ownerAddresses.map(owner => {
            return {owner: owner.ownerAddress, balance: owner.tokenBalances.length}
        }).sort((e1, e2) => e2.balance - e1.balance)

        const totalSupply = owners.map(owner => owner.balance).reduce((sum, element) => sum + element, 0)

        console.log(owners)
        console.log(totalSupply)
        console.log(owners.length)


        const top01HoldingsPercent = getTopHoldings(owners, owners.length, totalSupply, 0.1)
        const top05HoldingsPercent = getTopHoldings(owners, owners.length, totalSupply, 0.5)
        const top1HoldingsPercent = getTopHoldings(owners, owners.length, totalSupply, 1)
        const top2HoldingsPercent = getTopHoldings(owners, owners.length, totalSupply, 2)
        const top5HoldingsPercent = getTopHoldings(owners, owners.length, totalSupply, 5)
        const top10HoldingsPercent = getTopHoldings(owners, owners.length, totalSupply, 10)

        const averageHoldings = totalSupply / owners.length

        console.log(top01HoldingsPercent)
        console.log(top05HoldingsPercent)
        console.log(top1HoldingsPercent)
        console.log(top2HoldingsPercent)
        console.log(top5HoldingsPercent)
        console.log(top10HoldingsPercent)

        console.log(averageHoldings)

        console.log("Updated holder concentration")
    } catch (err) {
        console.log(err);
        throw err;
    }
};
