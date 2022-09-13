const isTransferMint = (transfer) => {
    return transfer.from === zeroAddress;
}

const isTransferBurnt = (transfer) => {
    return transfer.to === zeroAddress;
}

const zeroAddress = '0x0000000000000000000000000000000000000000';

module.exports = {
    zeroAddress,
    isTransferMint,
    isTransferBurnt
}