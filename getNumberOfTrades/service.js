const getNumberOfTrades = (transfers) => {
    const holdersToTradesMap = new Map()
    for (let i = 0; i < transfers.length; i++) {
        const transfer = transfers[i]
        const fromTrades = holdersToTradesMap.get(transfer.from)
        const toTrades = holdersToTradesMap.get(transfer.to)
        //not mint
        if (transfer.from !== '0x0000000000000000000000000000000000000000') {
            //burn
            if (transfer.to === '0x0000000000000000000000000000000000000000') {
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
            if (toTrades) {
                //mint
                if (transfer.from === '0x0000000000000000000000000000000000000000') {
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
                if (transfer.from === '0x0000000000000000000000000000000000000000') {
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

module.exports = {getNumberOfTrades}