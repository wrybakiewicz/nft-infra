'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const {zeroAddress} = require("../../../common");
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
        let event = { address: zeroAddress };

        const result = await app.handler(event, context)

        expect(result).to.be.eq(undefined);
    });

});
