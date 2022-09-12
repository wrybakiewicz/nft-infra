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

module.exports = {getCollectionHolderHoldings}