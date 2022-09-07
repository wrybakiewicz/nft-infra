'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('update holder concentration', function () {
    it('should update holder concentration', async () => {
        let context;
        let event;

        const result = await app.handler(event, context)

        expect(result).to.be.eq(undefined);
    });

});
