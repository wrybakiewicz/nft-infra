'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('get collection holders holdings at block', function () {

    it('should return bad request when no query string', async () => {
        let context;
        const event = {}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Pass block and collection as params");
    });

    it('should return holdings from last block when no block passed', async () => {
        let context;
        const event = {
            queryStringParameters: {
                collection: "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c"
            }
        }

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
        const body = JSON.parse(result.body)
        expect(body.holdersHoldings.length).to.be.eq(1974);
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

    it('should return holders holdings at block when collection existed', async () => {
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
        expect(body.holdersHoldings.length).to.be.eq(1);
        expect(body.holdersHoldings[0].holder).to.be.eq("0x57d1eae9f0972723f0e78eaf4e6c08e90565206f");
        expect(body.holdersHoldings[0].holdings).to.be.eq(100);
    });

    it('should return empty holders holdings at block when collection not existed', async () => {
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
        expect(body.holdersHoldings.length).to.be.eq(0);
    });

    it('should return empty holders holdings at latest block', async () => {
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
        expect(body.holdersHoldings.length).to.be.eq(1974);
        expect(body.holdersHoldings[0].holder).to.be.eq("0x57d1eae9f0972723f0e78eaf4e6c08e90565206f");
        expect(body.holdersHoldings[0].holdings).to.be.eq(674);
        expect(body.holdersHoldings[1].holder).to.be.eq("0x000a6457cd56f92ba4824344e1d16923762725e7");
        expect(body.holdersHoldings[1].holdings).to.be.eq(2);
        expect(body.holdersHoldings[2].holder).to.be.eq("0xb7745f7e815043ab1d32f5249b5329a59df04479");
        expect(body.holdersHoldings[2].holdings).to.be.eq(1);
    });

});
