const {isTransferBurnt, isTransferMint} = require("../common");
const getCollectionHolderHoldings = (transfers) => {
    const holderHoldingMap = new Map()

    transfers.forEach(transfer => {
        const fromHolding = holderHoldingMap.get(transfer.from)
        const toHolding = holderHoldingMap.get(transfer.to)

        if (!isTransferMint(transfer)) {
            if (fromHolding === 1) {
                holderHoldingMap.delete(transfer.from);
            } else {
                holderHoldingMap.set(transfer.from, fromHolding - 1)
            }
        }

        if (!isTransferBurnt(transfer)) {
            if (!toHolding) {
                holderHoldingMap.set(transfer.to, 1)
            } else {
                holderHoldingMap.set(transfer.to, toHolding + 1)
            }
        }
    })
    return Array.from(holderHoldingMap.entries()).map(entry => {
        return {
            holder: entry[0],
            holdings: entry[1]
        }
    })
}

module.exports = {getCollectionHolderHoldings}