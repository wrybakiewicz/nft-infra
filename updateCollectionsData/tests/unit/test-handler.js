'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('update collection data', function () {

    it('should update collection data for one collection', async () => {
        let context;
        let event = { address: "0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c" };

        const result = await app.handler(event, context)

        expect(result).to.be.eq(undefined);
    });

});
