'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('get collection holders holding percent of time', function () {

    it('should return bad request when no query string', async () => {
        let context;
        const event = {}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Pass block and collection as params");
    });

    it('should return holders holding percent of time from last block when no block passed', async () => {
        let context;
        const event = {
            queryStringParameters: {
                collection: "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c"
            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
        const body = JSON.parse(result.body)
        expect(body.holdersHoldingPercentOfTime.totalCollectionBlocks).to.be.gt(6295554);
        expect(body.holdersHoldingPercentOfTime.holderHoldingDetails.length).to.be.gte(5001);
    });

    it('should return bad request when no collection', async () => {
        let context;
        const event = {
            queryStringParameters: {
                block: "not exist"
            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Pass block and collection as params");
    });


    it('should return not found if collection not indexed', async () => {
        let context;
        const event = {
            queryStringParameters: {
                block: '1',
                collection: "not exist"

            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(404);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Collection is not indexed");
    });

    it('should return holders holdings percent of time at block when collection existed', async () => {
        let context;
        const event = {
            queryStringParameters: {
                block: '16358448',
                collection: "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c"

            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
        const body = JSON.parse(result.body)
        expect(body.holdersHoldingPercentOfTime.totalCollectionBlocks).to.be.eq(1);
        expect(body.holdersHoldingPercentOfTime.holderHoldingDetails.length).to.be.eq(1);
        expect(body.holdersHoldingPercentOfTime.holderHoldingDetails[0].holder).to.be.eq("0x57d1eae9f0972723f0e78eaf4e6c08e90565206f");
        expect(body.holdersHoldingPercentOfTime.holderHoldingDetails[0].totalHoldingBlocks).to.be.eq(1);
        expect(body.holdersHoldingPercentOfTime.holderHoldingDetails[0].holdingPercent).to.be.eq(100);
    });

    it('should return empty holders percent of time rating at block when collection not existed', async () => {
        let context;
        const event = {
            queryStringParameters: {
                block: '1',
                collection: "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c"

            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
        const body = JSON.parse(result.body)
        expect(body.holdersHoldingPercentOfTime.length).to.be.eq(0);
    });

    it('should return holders holding percent of time at latest block', async () => {
        let context;
        const event = {
            queryStringParameters: {
                block: '999999999',
                collection: "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c"
            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
        const body = JSON.parse(result.body)
        expect(body.holdersHoldingPercentOfTime.holderHoldingDetails.length).to.be.gte(5001);
    });

});
