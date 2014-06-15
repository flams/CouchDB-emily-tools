/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
 var CouchDBDocument = require("../src/CouchDBDocument"),
	chai = require("chai"),
    serverTools = require("../tools"),
    Transport = require("transport"),
    Store = require("observable-store"),
	expect = chai.expect;

describe("Given CouchDBDocument and a transport", function () {

    var transport = new Transport(new Store({
        "CouchDB": serverTools.handler,
        "CouchDBChange": serverTools.changeHandler
    }));


    describe("When initialized", function () {
        var sut = new CouchDBDocument();

        it("is a simple observable data-store", function () {
            sut.set("test", true);

            expect(sut.get("test")).to.be.true;
        });

        describe("When synchronized with a CouchDBDocument", function () {

        
        });
    });
});
