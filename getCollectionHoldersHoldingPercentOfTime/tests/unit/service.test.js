'use strict';

const app = require('../../service');
const chai = require('chai');
const expect = chai.expect;

const zeroAddress = '0x0000000000000000000000000000000000000000'
const holder1 = '0x0000000000000000000000000000000000000001'
const holder2 = '0x0000000000000000000000000000000000000002'
const holder3 = '0x0000000000000000000000000000000000000003'

describe('get collection holding percent of time', () => {

    describe('get collection holders holding block details', () => {
        it('should return empty when no transfers', async () => {
            const result = app.getCollectionHoldersHoldingBlockDetails([])

            expect(result.length).to.be.eq(0);
        });

        it('should return details after mint', async () => {
            const transfers = [
                {
                    from: zeroAddress,
                    to: holder1,
                    block: 1
                },
                {
                    from: zeroAddress,
                    to: holder2,
                    block: 2
                },
                {
                    from: zeroAddress,
                    to: holder1,
                    block: 3
                }
            ]
            const result = app.getCollectionHoldersHoldingBlockDetails(transfers)

            expect(result.length).to.be.eq(2);
            expect(result[0].holder).to.be.eq(holder1);
            expect(result[0].blocksDetails.totalHoldingBlocks).to.be.eq(0);
            expect(result[0].blocksDetails.lastHoldingFrom).to.be.eq(1);
            expect(result[0].blocksDetails.holdingCount).to.be.eq(2);

            expect(result[1].holder).to.be.eq(holder2);
            expect(result[1].blocksDetails.totalHoldingBlocks).to.be.eq(0);
            expect(result[1].blocksDetails.lastHoldingFrom).to.be.eq(2);
            expect(result[1].blocksDetails.holdingCount).to.be.eq(1);
        });

        it('should return details after mint and burn', async () => {
            const transfers = [
                {
                    from: zeroAddress,
                    to: holder1,
                    block: 1
                },
                {
                    from: zeroAddress,
                    to: holder2,
                    block: 2
                },
                {
                    from: zeroAddress,
                    to: holder1,
                    block: 3
                },
                {
                    from: holder1,
                    to: zeroAddress,
                    block: 4
                }
            ]
            const result = app.getCollectionHoldersHoldingBlockDetails(transfers)

            expect(result.length).to.be.eq(2);
            expect(result[0].holder).to.be.eq(holder1);
            expect(result[0].blocksDetails.totalHoldingBlocks).to.be.eq(0);
            expect(result[0].blocksDetails.lastHoldingFrom).to.be.eq(1);
            expect(result[0].blocksDetails.holdingCount).to.be.eq(1);

            expect(result[1].holder).to.be.eq(holder2);
            expect(result[1].blocksDetails.totalHoldingBlocks).to.be.eq(0);
            expect(result[1].blocksDetails.lastHoldingFrom).to.be.eq(2);
            expect(result[1].blocksDetails.holdingCount).to.be.eq(1);
        });

        it('should return details after mint and transfer out', async () => {
            const transfers = [
                {
                    from: zeroAddress,
                    to: holder1,
                    block: 1
                },
                {
                    from: zeroAddress,
                    to: holder2,
                    block: 2
                },
                {
                    from: holder1,
                    to: holder3,
                    block: 3
                }
            ]
            const result = app.getCollectionHoldersHoldingBlockDetails(transfers)

            expect(result.length).to.be.eq(3);
            expect(result[0].holder).to.be.eq(holder1);
            expect(result[0].blocksDetails.totalHoldingBlocks).to.be.eq(2);
            expect(result[0].blocksDetails.lastHoldingFrom).to.be.eq(undefined);
            expect(result[0].blocksDetails.holdingCount).to.be.eq(0);

            expect(result[1].holder).to.be.eq(holder2);
            expect(result[1].blocksDetails.totalHoldingBlocks).to.be.eq(0);
            expect(result[1].blocksDetails.lastHoldingFrom).to.be.eq(2);
            expect(result[1].blocksDetails.holdingCount).to.be.eq(1);

            expect(result[2].holder).to.be.eq(holder3);
            expect(result[2].blocksDetails.totalHoldingBlocks).to.be.eq(0);
            expect(result[2].blocksDetails.lastHoldingFrom).to.be.eq(3);
            expect(result[2].blocksDetails.holdingCount).to.be.eq(1);
        });
    })

    describe('get collection holders holding percent of timeDetails', () => {
        it('should return empty when no transfers', async () => {
            const result = app.getCollectionHoldersHoldingPercentOfTimeDetails([], 10)

            expect(result.length).to.be.eq(0);
        });

        it('should return for two holders', async () => {
            const transfers = [
                {
                    from: zeroAddress,
                    to: holder1,
                    block: 1
                },
                {
                    from: zeroAddress,
                    to: holder3,
                    block: 2
                },
                {
                    from: holder1,
                    to: holder3,
                    block: 3
                },
                {
                    from: holder3,
                    to: holder2,
                    block: 4
                },
                {
                    from: holder2,
                    to: zeroAddress,
                    block: 5
                }
            ]

            const result = app.getCollectionHoldersHoldingPercentOfTimeDetails(transfers, 5)

            expect(result.totalCollectionBlocks).to.be.eq(5);
            expect(result.holderHoldingDetails.length).to.be.eq(3);
            expect(result.holderHoldingDetails[0].holder).to.be.eq(holder1);
            expect(result.holderHoldingDetails[0].totalHoldingBlocks).to.be.be.eq(2);
            expect(result.holderHoldingDetails[0].holdingPercent).to.be.be.eq(40);
            expect(result.holderHoldingDetails[1].holder).to.be.eq(holder3);
            expect(result.holderHoldingDetails[1].totalHoldingBlocks).to.be.be.eq(3);
            expect(result.holderHoldingDetails[1].holdingPercent).to.be.be.eq(60);
            expect(result.holderHoldingDetails[2].holder).to.be.eq(holder2);
            expect(result.holderHoldingDetails[2].totalHoldingBlocks).to.be.be.eq(1);
            expect(result.holderHoldingDetails[2].holdingPercent).to.be.be.eq(20);
        });
    })
})
