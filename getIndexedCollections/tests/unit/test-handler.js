'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('get indexed collections', function () {

    it('should return indexed collections', async () => {
        let context;
        const event = {}

        const result = await app.handler(event, context)

        expect(result.statusCode).to.be.eq(200);
        const body = JSON.parse(result.body)
        expect(body.collections.length).to.be.gte(2);
        expect(body.collections.map(_ => _.address)).to.include("0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c");
        expect(body.collections.map(_ => _.address)).to.include("0x7ceee88e71f5c3614f6d0153e922871ae402d1d1");
    });


});
