# NFT Airdrop API

## Info

This project is submission for <strong>ETH</strong>Online Hackathon.

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

###GET /getAverageHoldingTimePerToken
Returns data about tokens held (or holding) for each holder of collection until block.

<strong>Input parameters:</strong> \
[Required] `collection` - collection address \
[Optional] `block` - block until which metric should be calculated, if not provided - uses latest block 

<strong>Output parameters for each holder</strong>: \
`holder` - holder address \
`heldTokenCount` - unique number of tokens that ever was on holder address \
`totalTokensHoldingTime` - sum of blocks that address was holding for tokens (holding e.g. 2 NFTs counts 2x more than holding one)
`averageHoldingTime` - `totalTokensHoldingTime / heldTokenCount` - average number of blocks that NFTs from collection was held for


###GET /getHoldingTimeForCollection</strong>
Returns all indexed collections that may be queried in API.
  
Returns status code 200 and JSON {collections: [{address: ...}, {address: ...}, ...]}


- <strong>GET /getHoldingsCount</strong> - returns all indexed collections that may be queried in API. Returns status
  code 200 and JSON {collections: [{address: ...}, {address: ...}, ...]}


- <strong>GET /getTransfersDetails</strong> - returns all indexed collections that may be queried in API. Returns status
  code 200 and JSON {collections: [{address: ...}, {address: ...}, ...]}


- <strong>GET /getIndexedCollections</strong> - returns all indexed collections that may be queried in API. Returns
  status code 200 and JSON `{"collections": [{"address": ...}, ...]}`


- <strong>POST /addCollection</strong> - add new collection to be queried in API. Takes JSON body eg.
  `{
  "address": "0x93646745Ee291f1C32733f549091390C0ff83B1C"
  }`

## Examples

[//]: # (TODO: example curls)