/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var CouchDBSecurity = require("../src/CouchDBSecurity"),
    CouchDBBase = require("../src/CouchDBBase");

describe("CouchDBSecurityTest", function () {

    var couchDBSecurity = new CouchDBSecurity;

    it("should be a constructor function", function () {
        expect(CouchDBSecurity).toBeInstanceOf(Function);
    });

    it("should inherit from CouchDBDocument", function () {
        //expect(Object.getPrototypeOf(couchDBSecurity)).toBeInstanceOf(CouchDBDocument)
    });

});

describe("CouchDBSecurityName", function () {

    var couchDBSecurity = null;

    beforeEach(function () {
        couchDBSecurity = new CouchDBSecurity;
    });

    it("should have a function to set the doc name", function () {
        expect(couchDBSecurity.setName()).toEqual(false);
        expect(couchDBSecurity.setName("_security")).toEqual(true);
    });

    it("should have a function to get the doc name", function () {
        couchDBSecurity.setName("_security");
        expect(couchDBSecurity.getName()).toEqual("_security");
    });

    it("should have a name by default", function () {
        expect(couchDBSecurity.getName()).toEqual("_security");
    });

});

describe("CouchDBSecurityLoad", function () {

    var couchDBSecurity = null;

    beforeEach(function () {
        couchDBSecurity = new CouchDBSecurity;
    });

    it("should have a function to load a security doc", function () {
        spyOn(couchDBSecurity, "sync").andReturn(true);
        expect(couchDBSecurity.load("db")).toEqual(true);

        expect(couchDBSecurity.sync.wasCalled).toEqual(true);
        expect(couchDBSecurity.sync.mostRecentCall.args[0]).toEqual("db");
        expect(couchDBSecurity.sync.mostRecentCall.args[1]).toEqual("_security");
    });
});
