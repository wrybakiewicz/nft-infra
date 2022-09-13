const isTransferMint = (transfer) => {
    return transfer.from === '0x0000000000000000000000000000000000000000';
}

const isTransferBurnt = (transfer) => {
    return transfer.to === '0x0000000000000000000000000000000000000000';
}

module.exports = {
    isTransferMint,
    isTransferBurnt
}