# NFT Airdrop API

## Info

This project is submission for <strong>ETH</strong>Online Hackathon.

Examples of API queries are below in `Examples` section.  

Done by: \
<strong>Wojciech Rybakiewicz</strong> \
<strong>Maciej Ruszczyk</strong>

EVM Address: <strong>0xF7A48AA40960fb0aC07FbCc355b0c24b38B47d30</strong>

## Description

<strong>NFT Airdrop API</strong> is REST API that gives multiple metrics regarding NFT collections holders on <strong>
Optimism Network</strong>.

#### Problem:

NFT collections often needs to measure its community engagement e.g. to do an airdrop. Currently, the most popular way
for this is taking a snapshot at NFT holders by some chosen block. But snapshot doesn't measure holders engagement good
enough - people who hold from the beginning and never sells are treated the same as flippers who hold for few hours
around the snapshot.

#### Solution:

<strong>NFT Airdrop API</strong> is API for NFT collections that provides much more deep view on collections holders -
considering holding time, number of trades, number of held tokens - at chosen block.

## Endpoints

[//]: # (TODO: all endpoints)

### GET /getAverageHoldingTimePerToken

Returns data about tokens held (or holding) for each holder of collection until block. Each NFT is used equally - so
holding time for account with 2 NFTs is 2x of account with 1 NFT.

<strong>Input parameters:</strong> \
[Required] `collection` - collection address \
[Optional] `block` - block until which metric should be calculated, if not provided - uses the latest block

<strong>Output parameters for each holder</strong>: \
`holder` - holder address \
`heldTokenCount` - unique number of tokens that ever was on holder address \
`totalTokensHoldingTime` - sum of blocks that address was holding for tokens (holding e.g. 2 NFTs counts 2x more than
holding one)
`averageHoldingTime` - `totalTokensHoldingTime / heldTokenCount` - average number of blocks that NFTs from collection
was held for

### GET /getHoldingTimeForCollection

Returns data about holding any element of collection for each holder of collection until block. Holding 2 NFTs at the
same time is treated equally to holding 1.

<strong>Input parameters:</strong> \
[Required] `collection` - collection address \
[Optional] `block` - block until which metric should be calculated, if not provided - uses the latest block

<strong>Output parameters</strong>: \
`totalCollectionBlocks` - blocks from collection creation to block provided as input (or current block) \
<strong>Output parameters for each holder:</strong> \
`holder` - holder address \
`totalHoldingBlocks` - number of blocks that any NFT from collection was held \
`holdingPercent` - `100 * totalHoldingBlocks / totalCollectionBlocks` - percent of holding any element of collections
out of collection existence


### GET /getHoldingsCount

Return number of tokens held per holder at provided block.

<strong>Input parameters:</strong> \
[Required] `collection` - collection address \
[Optional] `block` - block until which metric should be calculated, if not provided - uses the latest block

<strong>Output parameters for each holder:</strong> \
`holder` - holder address \
`holdings` - number of tokens held

### GET /getTransfersDetails

Return data for each holder about his/her transfers, mints and burns at provided block.

<strong>Input parameters:</strong> \
[Required] `collection` - collection address \
[Optional] `block` - block until which metric should be calculated, if not provided - uses the latest block

<strong>Output parameters for each holder:</strong> \
`holder` - holder address \
`trades.mints` - number of mints of collection elements to holder address \
`trades.transfersIn` - number of collections elements transferred to holder address (excluding mints) \
`trades.transfersOut` - number of collections elements transferred from holder address (excluding burns) \
`trades.burns` - number of burns of collection elements from holder address \

### GET /getIndexedCollections

Returns all indexed collections that may be queried in this API.

<strong>Output parameters for each collection:</strong> \
`address` - collection address

### POST /addCollection

Add new collection to be queried in this API.

<strong>Input body:</strong> \
`address` - collection address

## Examples
Example collection: <strong>motorheadz</strong> \
`0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c`

For links below - use curl or copy into browser (for GET methods).

### GET /getAverageHoldingTimePerToken
`https://r6ocq8rga8.execute-api.eu-central-1.amazonaws.com/api/getAverageHoldingTimePerToken?collection=0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c&block=23005848`

### GET /getHoldingTimeForCollection
`https://r6ocq8rga8.execute-api.eu-central-1.amazonaws.com/api/getHoldingTimeForCollection?collection=0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c&block=23005848`

### GET /getHoldingsCount
`https://r6ocq8rga8.execute-api.eu-central-1.amazonaws.com/api/getHoldingsCount?block=996358448&collection=0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c&block=23005848`

### GET /getTransfersDetails
`https://r6ocq8rga8.execute-api.eu-central-1.amazonaws.com/api/getTransfersDetails?collection=0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c&block=23005848`

### GET /getIndexedCollections
`https://r6ocq8rga8.execute-api.eu-central-1.amazonaws.com/api/getIndexedCollections`

### POST /addCollection
`https://r6ocq8rga8.execute-api.eu-central-1.amazonaws.com/api/addCollection` 

`{"address": "0x93646745Ee291f1C32733f549091390C0ff83B1C"}`


## API internals description

[//]: # (TODO: worker lambda)
