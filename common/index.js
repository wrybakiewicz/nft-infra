const getCollectionHolderHoldings = (transfers) => {
    const holderHoldingMap = new Map()
    for (let i = 0; i < transfers.length; i++) {
        const transfer = transfers[i]
        const fromHolding = holderHoldingMap.get(transfer.from)
        const toHolding = holderHoldingMap.get(transfer.to)
        //not mint
        if (transfer.from !== '0x0000000000000000000000000000000000000000') {
            if (fromHolding === 1) {
                holderHoldingMap.delete(transfer.from);
            } else {
                holderHoldingMap.set(transfer.from, fromHolding - 1)
            }
        }
        //not burn
        if (transfer.to !== '0x0000000000000000000000000000000000000000') {
            if (!toHolding) {
                holderHoldingMap.set(transfer.to, 1)
            } else {
                holderHoldingMap.set(transfer.to, toHolding + 1)
            }
        }
    }
    return Array.from(holderHoldingMap.entries()).map(entry => {
        return {
            holder: entry[0],
            holdings: entry[1]
        }
    })
}

const getCollectionHoldersHoldingPercentOfTimeDetails = (transfers, toBlock) => {
    if (transfers.length === 0) {
        return []
    }
    const firstBlock = transfers[0].block
    const totalCollectionBlocks = (toBlock - firstBlock) + 1
    const holdersHoldingBlockDetails = getCollectionHoldersHoldingBlockDetails(transfers)
    const holdersTotalHoldingBlocks = holdersHoldingBlockDetails.map(details => {
        let totalHoldingBlocks = details.blocksDetails.totalHoldingBlocks
        if (details.blocksDetails.lastHoldingFrom) {
            totalHoldingBlocks += (toBlock - details.blocksDetails.lastHoldingFrom)
        }
        return {
            holder: details.holder,
            totalHoldingBlocks: totalHoldingBlocks,
            holdingPercent: (100.0 * totalHoldingBlocks) / totalCollectionBlocks
        }
    })
    return {
        totalCollectionBlocks: totalCollectionBlocks,
        holderHoldingDetails: holdersTotalHoldingBlocks
    }
}

const getCollectionHoldersHoldingBlockDetails = (transfers) => {
    const holdersToHoldingBlocksMap = new Map()
    for (let i = 0; i < transfers.length; i++) {
        const transfer = transfers[i]
        const block = transfer.block
        const fromHoldingBlocks = holdersToHoldingBlocksMap.get(transfer.from)
        const toHoldingBlocks = holdersToHoldingBlocksMap.get(transfer.to)
        //not mint
        if (transfer.from !== '0x0000000000000000000000000000000000000000') {
            let lastHoldingFrom
            let totalHoldingBlocks = fromHoldingBlocks.totalHoldingBlocks
            if (fromHoldingBlocks.holdingCount > 1) {
                lastHoldingFrom = fromHoldingBlocks.lastHoldingFrom
            } else {
                totalHoldingBlocks += (block - fromHoldingBlocks.lastHoldingFrom - 1)
                lastHoldingFrom = undefined
            }
            holdersToHoldingBlocksMap.set(transfer.from, {
                totalHoldingBlocks: totalHoldingBlocks,
                lastHoldingFrom: lastHoldingFrom,
                holdingCount: fromHoldingBlocks.holdingCount - 1
            })
        }
        //not burn
        if (transfer.to !== '0x0000000000000000000000000000000000000000') {
            if (toHoldingBlocks) {
                let lastHoldingFrom = block
                if (toHoldingBlocks.lastHoldingFrom) {
                    lastHoldingFrom = toHoldingBlocks.lastHoldingFrom
                }
                holdersToHoldingBlocksMap.set(transfer.to, {
                    totalHoldingBlocks: toHoldingBlocks.totalHoldingBlocks,
                    lastHoldingFrom: lastHoldingFrom,
                    holdingCount: toHoldingBlocks.holdingCount + 1
                })
            } else {
                holdersToHoldingBlocksMap.set(transfer.to, {
                    totalHoldingBlocks: 1,
                    lastHoldingFrom: block,
                    holdingCount: 1
                })
            }
        }
    }
    return Array.from(holdersToHoldingBlocksMap.entries()).map(entry => {
        return {
            holder: entry[0],
            blocksDetails: entry[1]
        }
    })
}

const getNumberOfTrades = (transfers) => {
    const holdersToTradesMap = new Map()
    for (let i = 0; i < transfers.length; i++) {
        const transfer = transfers[i]
        const fromTrades = holdersToTradesMap.get(transfer.from)
        const toTrades = holdersToTradesMap.get(transfer.to)
        //not mint
        if (transfer.from !== '0x0000000000000000000000000000000000000000') {
            //burn
            if(transfer.to === '0x0000000000000000000000000000000000000000') {
                holdersToTradesMap.set(transfer.from, {
                    mints: fromTrades.mints,
                    transfersIn: fromTrades.transfersIn,
                    transfersOut: fromTrades.transfersOut,
                    burns: fromTrades.burns + 1
                })
            } else {
                holdersToTradesMap.set(transfer.from, {
                    mints: fromTrades.mints,
                    transfersIn: fromTrades.transfersIn,
                    transfersOut: fromTrades.transfersOut + 1,
                    burns: fromTrades.burns
                })
            }
        }
        //not burn
        if (transfer.to !== '0x0000000000000000000000000000000000000000') {
            if(toTrades) {
                //mint
                if(transfer.from === '0x0000000000000000000000000000000000000000') {
                    holdersToTradesMap.set(transfer.to, {
                        mints: toTrades.mints + 1,
                        transfersIn: toTrades.transfersIn,
                        transfersOut: toTrades.transfersOut,
                        burns: toTrades.burns
                    })
                } else {
                    holdersToTradesMap.set(transfer.to, {
                        mints: toTrades.mints,
                        transfersIn: toTrades.transfersIn + 1,
                        transfersOut: toTrades.transfersOut,
                        burns: toTrades.burns
                    })
                }
            } else {
                if(transfer.from === '0x0000000000000000000000000000000000000000') {
                    holdersToTradesMap.set(transfer.to, {
                        mints: 1,
                        transfersIn: 0,
                        transfersOut: 0,
                        burns: 0
                    })
                } else {
                    holdersToTradesMap.set(transfer.to, {
                        mints: 0,
                        transfersIn: 1,
                        transfersOut: 0,
                        burns: 0
                    })
                }
            }
        }
    }

    return Array.from(holdersToTradesMap.entries()).map(entry => {
        return {
            holder: entry[0],
            trades: entry[1]
        }
    })
}

module.exports = {
    getCollectionHolderHoldings,
    getCollectionHoldersHoldingPercentOfTimeDetails,
    getCollectionHoldersHoldingBlockDetails,
    getNumberOfTrades
}