'use strict';

const app = require('../../service');
const chai = require('chai');
const expect = chai.expect;
const {zeroAddress} = require('../../../common')

const holder1 = '0x0000000000000000000000000000000000000001'
const holder2 = '0x0000000000000000000000000000000000000002'
const holder3 = '0x0000000000000000000000000000000000000003'

describe('get average holding time', () => {
    it('should return empty when no transfers', async () => {
        const result = app.getAverageHoldingTime([])

        expect(result.length).to.be.eq(0);
    });

    it('should average holding time after mint', async () => {
        const transfers = [
            {
                from: zeroAddress,
                to: holder1,
                block: 1,
                token: 1
            },
            {
                from: zeroAddress,
                to: holder2,
                block: 2,
                token: 2
            },
            {
                from: zeroAddress,
                to: holder1,
                block: 3,
                token: 3
            }
        ]
        const result = app.getAverageHoldingTime(transfers, 3)

        expect(result.length).to.be.eq(2);
        expect(result[0].holder).to.be.eq(holder1);
        expect(result[0].heldTokensCount).to.be.eq(2);
        expect(result[0].totalTokenHoldingTime).to.be.eq(2);
        expect(result[0].averageHoldingTime).to.be.eq(1);

        expect(result[1].holder).to.be.eq(holder2);
        expect(result[1].heldTokensCount).to.be.eq(1);
        expect(result[1].totalTokenHoldingTime).to.be.eq(1);
        expect(result[1].averageHoldingTime).to.be.eq(1);
    });

    it('should return average holding time after mint and transfers', async () => {
        const transfers = [
            {
                from: zeroAddress,
                to: holder1,
                block: 1,
                token: 1
            },
            {
                from: zeroAddress,
                to: holder1,
                block: 1,
                token: 2
            },
            {
                from: zeroAddress,
                to: holder2,
                block: 2,
                token: 3
            },
            {
                from: holder1,
                to: holder3,
                block: 3,
                token: 1
            },
            {
                from: holder3,
                to: holder1,
                block: 4,
                token: 1
            }

        ]
        const result = app.getAverageHoldingTime(transfers, 5)

        expect(result.length).to.be.eq(3);
        expect(result[0].holder).to.be.eq(holder1);
        expect(result[0].heldTokensCount).to.be.eq(2);
        expect(result[0].totalTokenHoldingTime).to.be.eq(7);
        expect(result[0].averageHoldingTime).to.be.eq(3.5);

        expect(result[1].holder).to.be.eq(holder2);
        expect(result[1].heldTokensCount).to.be.eq(1);
        expect(result[1].totalTokenHoldingTime).to.be.eq(3);
        expect(result[1].averageHoldingTime).to.be.eq(3);

        expect(result[2].holder).to.be.eq(holder3);
        expect(result[2].heldTokensCount).to.be.eq(1);
        expect(result[2].totalTokenHoldingTime).to.be.eq(1);
        expect(result[2].averageHoldingTime).to.be.eq(1);
    });
})