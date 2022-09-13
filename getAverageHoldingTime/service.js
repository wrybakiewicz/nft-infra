const {isTransferMint, isTransferBurnt} = require("../common");
const getAverageHoldingTime = (transfers, toBlock) => {
    const holdersToHoldingDetails = getHoldersToHoldingDetails(transfers)
    const holdersToHoldingDetailsToBlock = holdersToHoldingDetails.map(holdersToHoldings => {
        const updatedHoldings = holdersToHoldings.holdingDetails.map(holding => {
            if(holding.holdingTo) {
                return holding
            } else {
                return {
                    tokenId: holding.tokenId,
                    holdingFrom: holding.holdingFrom,
                    holdingTo: toBlock
                }
            }
        })
        return {
            holder: holdersToHoldings.holder,
            holdingDetails: updatedHoldings
        }
    })
    return holdersToHoldingDetailsToBlock.map(holderToHoldingDetails => {
        const tokenIds = holderToHoldingDetails.holdingDetails.map(holding => holding.tokenId)
        const heldTokensCount = [...new Set(tokenIds)].length
        const totalTokenHoldingTime = holderToHoldingDetails.holdingDetails
            .map(holding => holding.holdingTo - holding.holdingFrom, 1)
            .reduce((e1, e2) => e1 + e2, 0)

        return {
            holder: holderToHoldingDetails.holder,
            heldTokensCount: heldTokensCount,
            totalTokenHoldingTime: totalTokenHoldingTime,
            averageHoldingTime: (1.0 * totalTokenHoldingTime) / heldTokensCount
        }
    })
}

const getHoldersToHoldingDetails = (transfers) => {
    const holdersToHoldingsMap = new Map();

    transfers.forEach(transfer =>{
        const fromHoldings = getOrEmptyArray(holdersToHoldingsMap.get(transfer.from))
        const toHoldings = getOrEmptyArray(holdersToHoldingsMap.get(transfer.to))
        //{[{tokenId, holdingFrom, holdingTo}]}
        if (!isTransferMint(transfer)) {
            const holding = fromHoldings.filter(holding => isHoldingMatching(holding, transfer))[0]
            const updatedHolding = {
                tokenId: holding.tokenId,
                holdingFrom: holding.holdingFrom,
                holdingTo: transfer.block
            }
            const updatedHoldings = fromHoldings.map(holding => {
                if (isHoldingMatching(holding, transfer)) {
                    return updatedHolding
                } else {
                    return holding
                }
            })
            holdersToHoldingsMap.set(transfer.from, updatedHoldings)
        }
        if (!isTransferBurnt(transfer)) {
            const newHolding = {
                tokenId: transfer.token,
                holdingFrom: transfer.block
            }
            holdersToHoldingsMap.set(transfer.to, [...toHoldings, newHolding])
        }
    })
    return Array.from(holdersToHoldingsMap.entries()).map(entry => {
        return {
            holder: entry[0],
            holdingDetails: entry[1]
        }
    })
}

const getOrEmptyArray = (element) => {
    if (element) {
        return element
    } else {
        return []
    }
}

const isHoldingMatching = (holding, transfer) => {
    return holding.tokenId === transfer.token && holding.holdingTo === undefined
}

module.exports = {
    getAverageHoldingTime
}