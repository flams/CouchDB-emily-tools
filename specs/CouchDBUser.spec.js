/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var CouchDBUser = require("../src/CouchDBUser"),
    CouchDBBase = require("../src/CouchDBBase");

var Transport = require("emily").Transport,
    Promise = require("emily").Promise;

describe("CouchDBUserTest", function () {

    var couchDBUser = new CouchDBUser;

    it("should be a constructor function", function () {
        expect(CouchDBUser).toBeInstanceOf(Function);
    });

    it("should inherit from CouchDBDocument", function () {
        // WHY this doesn't work? expect(Object.getPrototypeOf(couchDBUser)).toBeInstanceOf(CouchDBDocument)
    });

});

describe("CouchDBUserDatabase", function () {

    var couchDBUser = null;

    beforeEach(function () {
        couchDBUser = new CouchDBUser;
    });

    it("should have a function to set the user's db", function () {
        expect(couchDBUser.setUserDB()).toEqual(false);
        expect(couchDBUser.setUserDB("_userz")).toEqual(true);

        expect(couchDBUser.getUserDB()).toEqual("_userz");
    });

    it("should have a default value", function () {
        expect(couchDBUser.getUserDB()).toEqual("_users");
    });

});

describe("CouchDBUserId", function () {

    var couchDBUser = null;

    beforeEach(function () {
        couchDBUser = new CouchDBUser;
    });

    it("should have a function to set id's prefix", function () {
        expect(couchDBUser.setIdPrefix()).toEqual(false);
        expect(couchDBUser.setIdPrefix("org.couchdb.uzer:")).toEqual(true);

        expect(couchDBUser.getIdPrefix()).toEqual("org.couchdb.uzer:");
    });

    it("should have a default value", function () {
        expect(couchDBUser.getIdPrefix()).toEqual("org.couchdb.user:");
    });

    it("should have a function to set id", function () {
        expect(couchDBUser.has("_id")).toEqual(false);
        expect(couchDBUser.setId()).toEqual(false);
        expect(couchDBUser.setId("123")).toEqual(true);

        expect(couchDBUser.get("_id")).toEqual("org.couchdb.user:123");
    });

    it("should have a function to get id", function () {
        expect(couchDBUser.setId("123")).toEqual(true);
        expect(couchDBUser.getId()).toEqual("org.couchdb.user:123");
    });

});

describe("CouchDBUserLoadSave", function () {

    var couchDBUser = null;

    beforeEach(function () {
        couchDBUser = new CouchDBUser;
    });

    it("should have a function to load user", function () {
        spyOn(couchDBUser, "sync");
        couchDBUser.load("123");

        expect(couchDBUser.sync.wasCalled).toEqual(true);
        expect(couchDBUser.sync.mostRecentCall.args[0]).toEqual("_users");
        expect(couchDBUser.sync.mostRecentCall.args[1]).toEqual("org.couchdb.user:123");
    });

    it("should return sync's promise", function () {
        var promise = {};
        spyOn(couchDBUser, "sync").andReturn(promise);
        expect(couchDBUser.load("123")).toBe(promise);
    });

});

describe("CouchDBUserLogin", function () {

    var couchDBUser = null,
        transport = null;

    beforeEach(function () {
        couchDBUser = new CouchDBUser;
        transport = new Transport;
        couchDBUser.setTransport(transport);
        spyOn(transport, "request");
    });

    it("should have a function to log the user in", function () {
        expect(couchDBUser.login).toBeInstanceOf(Function);
    });

    it("should try to open a session", function () {
        var req;

        couchDBUser.set("name", "n4me");
        couchDBUser.set("password", "p4ssword");

        couchDBUser.login();

        expect(transport.request.wasCalled).toEqual(true);
        expect(transport.request.mostRecentCall.args[0]).toEqual("CouchDB");
        req = transport.request.mostRecentCall.args[1];

        expect(req.method).toEqual("GET");
        expect(req.path).toEqual("/_users/org.couchdb.user:n4me");
        expect(req.auth).toEqual("n4me:p4ssword");
    });

    it("should return a promise", function () {
        expect(couchDBUser.login()).toBeInstanceOf(Promise);
    });

    it("should fulfill the promise with the request's result", function () {
        var promise,
            callback;

        couchDBUser.set("name", "n4me");
        couchDBUser.set("password", "p4ssword");

        promise = couchDBUser.login();
        promise.then(function (result) {
            expect(result.result).toEqual("whatever");
        });

        transport.request.mostRecentCall.args[2]({"result": "whatever"});

    });

    it("should reject the promise when name or password is not a string", function () {
        var promise;

        couchDBUser.set("name", {});
        couchDBUser.set("password", {});

        promise = couchDBUser.login();

        promise.then(function () {}, function (result) {
            expect(result.error).toEqual("name & password must be strings");
        });
    });

});

describe("CouchDBUserCreate", function () {

    var couchDBUser = null,
    transport = null;

    beforeEach(function () {
        couchDBUser = new CouchDBUser;
        transport = new Transport;
        couchDBUser.setTransport(transport);
        spyOn(transport, "request");
        couchDBUser.set("name", "name");
    });

    it("should have a function to create a user, given a name and a password", function () {
        expect(couchDBUser.create).toBeInstanceOf(Function);
    });

    it("should return a promise", function () {
        expect(couchDBUser.create()).toBeInstanceOf(Promise);
    });

    it("should reject the promise if the user already exists", function (done) {
        var loadPromise = new Promise,
            promise,
            assert;

        loadPromise.fulfill(),

        spyOn(couchDBUser, "load").andReturn(loadPromise);

        promise = couchDBUser.create();

        expect(couchDBUser.load.wasCalled).toEqual(true);
        expect(couchDBUser.load.mostRecentCall.args[0]).toEqual("name");

        promise.then(function() {}, function (failed) {
            expect(failed).toBeTruthy();
            expect(failed.error).toEqual("Failed to create user. The user already exists");
            done();
        });


    });

    it("should save the user if it doesn't exist", function (done) {
        var loadPromise = new Promise,
            uploadPromise = new Promise,
            promise,
            assert;

        loadPromise.reject();
        uploadPromise.fulfill("success");

        spyOn(couchDBUser, "load").andReturn(loadPromise);
        spyOn(couchDBUser, "upload").andReturn(uploadPromise);

        promise = couchDBUser.create();

        promise.then(function (success) {
            expect(couchDBUser.upload.wasCalled).toEqual(true);
            expect(couchDBUser.upload.mostRecentCall.args[0]).toBeUndefined();
            expect(success).toEqual("success");
            done();
        });
    });

    it("should fulfill the promise with upload's promise's result if it fails too", function (done) {
        var loadPromise = new Promise,
            uploadPromise = new Promise,
            promise,
            assert;

        loadPromise.reject();
        uploadPromise.reject("failed");

        spyOn(couchDBUser, "load").andReturn(loadPromise);
        spyOn(couchDBUser, "upload").andReturn(uploadPromise);

        promise = couchDBUser.create();

        promise.then(function () {}, function (failed) {
            expect(failed).toEqual("failed");
            done();
        });


    });

    it("should create the user if defaults params for roles and type if not set", function () {
        couchDBUser.create();
        expect(JSON.stringify(couchDBUser.get("roles"))).toEqual("[]");
        expect(couchDBUser.get("type")).toEqual("user");
    });

    it("shouldn't override given fields", function () {
        var roles = ["writer"];
        couchDBUser.set("type", "admin");
        couchDBUser.set("roles", roles);

        couchDBUser.create();

        expect(couchDBUser.get("type")).toEqual("admin");
        expect(couchDBUser.get("roles")).toBe(roles);
    });

});