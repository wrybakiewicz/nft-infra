'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('add collection', function () {

    it('should return 400 when collection exist', async () => {
        let context;
        const event = {body: '{"address": "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c"}',}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Collection is indexed");
    });

    it('should return 400 when no address passed', async () => {
        let context;
        const event = {body: '{}',}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Address is required");
    });

    it('should return 400 when no body', async () => {
        let context;
        const event = {}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Address is required");
    });

    it('should return 400 when no event', async () => {
        let context;
        let event

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Address is required");
    });

    it('should return 400 when invalid address', async () => {
        let context;
        const event = {body: '{"address": "abc"}'}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(400);
        const body = JSON.parse(result.body)
        expect(body.error).to.be.eq("Address is required");
    });

    it('should add new collection', async () => {
        let context;
        const event = {body: '{\n\t"address": "0x0000000000000000000000000000000000000000"\n}',}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
    });

});
