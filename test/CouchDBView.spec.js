/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
 var sut = require("../src/CouchDBView"),
	chai = require("chai"),
	expect = chai.expect;

describe("Given CouchDBView is loaded", function () {

    it("Then is a constructor function", function () {
        expect(typeof sut).to.equal("function");
    });


});
