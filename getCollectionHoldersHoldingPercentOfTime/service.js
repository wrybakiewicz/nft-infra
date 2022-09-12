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
    }).filter(details => details.totalHoldingBlocks !== 0)
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
                totalHoldingBlocks += block - fromHoldingBlocks.lastHoldingFrom
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
                    totalHoldingBlocks: 0,
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

module.exports = {
    getCollectionHoldersHoldingPercentOfTimeDetails,
    getCollectionHoldersHoldingBlockDetails
}