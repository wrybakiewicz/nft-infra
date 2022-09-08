'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('get collection concentration at block', function () {
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

    it('should return concentration at block when collection existed', async () => {
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
        expect(body.concentration.length).to.be.eq(1);

    });

    //TODO: before created

    //TODO: after last transfer

});
