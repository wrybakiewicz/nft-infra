'use strict';

const app = require('../../service');
const chai = require('chai');
const expect = chai.expect;

const zeroAddress = '0x0000000000000000000000000000000000000000'
const holder1 = '0x0000000000000000000000000000000000000001'
const holder2 = '0x0000000000000000000000000000000000000002'
const holder3 = '0x0000000000000000000000000000000000000003'

describe('get collection holders holding map', () => {

    it('should return empty when no transfers', async () => {
        const result = await app.getCollectionHolderHoldings([])

        expect(result.length).to.be.eq(0);
    });

    it('should return holdings after mint', async () => {
        const transfers = [
            {
                from: zeroAddress,
                to: holder1,
            },
            {
                from: zeroAddress,
                to: holder2,
            }
        ]

        const result = await app.getCollectionHolderHoldings(transfers)

        expect(result.length).to.be.eq(2);
        expect(result[0].holder).to.be.eq(holder1);
        expect(result[0].holdings).to.be.eq(1);
        expect(result[1].holder).to.be.eq(holder2);
        expect(result[1].holdings).to.be.eq(1);
    });

    it('should return holdings after mint and transfers', async () => {
        const transfers = [
            {
                from: zeroAddress,
                to: holder1,
            },
            {
                from: zeroAddress,
                to: holder2,
            },
            {
                from: zeroAddress,
                to: holder3,
            },
            {
                from: holder1,
                to: holder2,
            },
            {
                from: holder3,
                to: holder1,
            },
        ]

        const result = await app.getCollectionHolderHoldings(transfers)

        expect(result.length).to.be.eq(2);
        expect(result[0].holder).to.be.eq(holder2);
        expect(result[0].holdings).to.be.eq(2);
        expect(result[1].holder).to.be.eq(holder1);
        expect(result[1].holdings).to.be.eq(1);
    });

    it('should return holdings after mint, transfers and burn', async () => {
        const transfers = [
            {
                from: zeroAddress,
                to: holder1,
            },
            {
                from: zeroAddress,
                to: holder2,
            },
            {
                from: zeroAddress,
                to: holder3,
            },
            {
                from: holder1,
                to: holder2,
            },
            {
                from: holder3,
                to: holder1,
            },
            {
                from: holder1,
                to: zeroAddress,
            },
        ]

        const result = await app.getCollectionHolderHoldings(transfers)

        expect(result.length).to.be.eq(1);
        expect(result[0].holder).to.be.eq(holder2);
        expect(result[0].holdings).to.be.eq(2);
    });

});