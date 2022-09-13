'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('get number of trades', function () {

    it('should return bad request when no query string', async () => {
        let context;
        const event = {}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Pass block and collection as params");
    });

    it('should return trades from last block when no block passed', async () => {
        let context;
        const event = {
            queryStringParameters: {
                collection: "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c"
            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
        const body = JSON.parse(result.body)
        expect(body.holdersWithTrades.length).to.be.gte(5001);
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

    it('should return trades at block when collection existed', async () => {
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
        expect(body.holdersWithTrades.length).to.be.eq(1);
        expect(body.holdersWithTrades[0].holder).to.be.eq("0x57d1eae9f0972723f0e78eaf4e6c08e90565206f");
        expect(body.holdersWithTrades[0].trades.mints).to.be.eq(100);
        expect(body.holdersWithTrades[0].trades.burns).to.be.eq(0);
        expect(body.holdersWithTrades[0].trades.transfersIn).to.be.eq(0);
        expect(body.holdersWithTrades[0].trades.transfersOut).to.be.eq(0);
    });

    it('should return empty trades at block when collection not existed', async () => {
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
        expect(body.holdersWithTrades.length).to.be.eq(0);
    });

    it('should return trades at latest block', async () => {
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
        expect(body.holdersWithTrades.length).to.be.gte(5001);
        expect(body.holdersWithTrades[0].holder).to.be.eq("0x57d1eae9f0972723f0e78eaf4e6c08e90565206f");
        expect(body.holdersWithTrades[0].trades.mints).to.be.eq(700);
        expect(body.holdersWithTrades[0].trades.transfersIn).to.be.eq(0);
        expect(body.holdersWithTrades[0].trades.transfersOut).to.be.eq(26);
        expect(body.holdersWithTrades[0].trades.burns).to.be.eq(0);
        expect(body.holdersWithTrades[1].holder).to.be.eq("0x4770f67db9d09ca7347c1fccbf3795a464065ecb");
        expect(body.holdersWithTrades[1].trades.mints).to.be.eq(1);
        expect(body.holdersWithTrades[1].trades.transfersIn).to.be.eq(0);
        expect(body.holdersWithTrades[1].trades.transfersOut).to.be.eq(1);
        expect(body.holdersWithTrades[1].trades.burns).to.be.eq(0);
        expect(body.holdersWithTrades[2].holder).to.be.eq("0x3d80618ea35d9936de784584a57ba0d4e94515e2");
        expect(body.holdersWithTrades[2].trades.mints).to.be.eq(1);
        expect(body.holdersWithTrades[2].trades.transfersIn).to.be.eq(1);
        expect(body.holdersWithTrades[2].trades.transfersOut).to.be.eq(1);
        expect(body.holdersWithTrades[2].trades.burns).to.be.eq(0);
    });

});
