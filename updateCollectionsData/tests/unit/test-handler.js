'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('update collection data', function () {
    it('should update collection data', async () => {
        let context;
        let event;

        const result = await app.handler(event, context)

        expect(result).to.be.eq(undefined);
    });

    it('should update collection data for one collection', async () => {
        let context;
        let event = { address: '0x0000000000000000000000000000000000000000' };

        const result = await app.handler(event, context)

        expect(result).to.be.eq(undefined);
    });

});
