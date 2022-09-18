'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('update collection data', function () {

    it('should update collection data for one collection', async () => {
        let context;
        let event = { address: "0x81b30ff521d1feb67ede32db726d95714eb00637" };

        const result = await app.handler(event, context)

        expect(result).to.be.eq(undefined);
    });

});
