'use strict';

const app = require('../../service');
const chai = require('chai');
const expect = chai.expect;

const zeroAddress = '0x0000000000000000000000000000000000000000'
const holder1 = '0x0000000000000000000000000000000000000001'
const holder2 = '0x0000000000000000000000000000000000000002'
const holder3 = '0x0000000000000000000000000000000000000003'

describe('get number of trades', () => {
    it('should return empty when no transfers', async () => {
        const result = app.getNumberOfTrades([], 10)

        expect(result.length).to.be.eq(0);
    });

    it('should return trades after mint & burns', async () => {
        const transfers = [
            {
                from: zeroAddress,
                to: holder1,
            },
            {
                from: zeroAddress,
                to: holder1,
            },
            {
                from: zeroAddress,
                to: holder2,
            },
            {
                from: holder1,
                to: zeroAddress,
            },
            {
                from: holder2,
                to: zeroAddress,
            }]
        const result = app.getNumberOfTrades(transfers, 10)

        expect(result.length).to.be.eq(2);
        expect(result[0].holder).to.be.eq(holder1);
        expect(result[0].trades.mints).to.be.eq(2);
        expect(result[0].trades.transfersIn).to.be.eq(0);
        expect(result[0].trades.transfersOut).to.be.eq(0);
        expect(result[0].trades.burns).to.be.eq(1);
        expect(result[1].holder).to.be.eq(holder2);
        expect(result[1].trades.mints).to.be.eq(1);
        expect(result[1].trades.transfersIn).to.be.eq(0);
        expect(result[1].trades.transfersOut).to.be.eq(0);
        expect(result[1].trades.burns).to.be.eq(1);
    });

    it('should return trades after transfers in & transfers out & mint & burns', async () => {
        const transfers = [
            {
                from: zeroAddress,
                to: holder1,
            },
            {
                from: zeroAddress,
                to: holder1,
            },
            {
                from: zeroAddress,
                to: holder2,
            },
            {
                from: holder1,
                to: zeroAddress,
            },
            {
                from: holder1,
                to: holder3,
            },
            {
                from: holder2,
                to: holder3,
            },
            {
                from: holder3,
                to: holder1,
            },
            {
                from: holder3,
                to: holder1,
            },
        ]
        const result = app.getNumberOfTrades(transfers, 10)

        expect(result.length).to.be.eq(3);
        expect(result[0].holder).to.be.eq(holder1);
        expect(result[0].trades.mints).to.be.eq(2);
        expect(result[0].trades.transfersIn).to.be.eq(2);
        expect(result[0].trades.transfersOut).to.be.eq(1);
        expect(result[0].trades.burns).to.be.eq(1);
        expect(result[1].holder).to.be.eq(holder2);
        expect(result[1].trades.mints).to.be.eq(1);
        expect(result[1].trades.transfersIn).to.be.eq(0);
        expect(result[1].trades.transfersOut).to.be.eq(1);
        expect(result[1].trades.burns).to.be.eq(0);
        expect(result[2].holder).to.be.eq(holder3);
        expect(result[2].trades.mints).to.be.eq(0);
        expect(result[2].trades.transfersIn).to.be.eq(2);
        expect(result[2].trades.transfersOut).to.be.eq(2);
        expect(result[2].trades.burns).to.be.eq(0);
    });

})
