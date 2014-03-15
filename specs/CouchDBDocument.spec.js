/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var transportMock = null,
    stopListening = null;

beforeEach(function () {
    stopListening = jasmine.createSpy();
    transportMock = {
        request: jasmine.createSpy(),
        listen: jasmine.createSpy().andReturn(stopListening)
    };
});

describe("CouchDBDocument inherits from CouchDBBase", function () {

    it("should be a constructor function", function () {
        expect(CouchDBDocument).toBeInstanceOf(Function);
    });

    it("should inherit from CouchDBBase", function () {
        expect(CouchDBDocument).toBeInstanceOf(CouchDBBase.constructor);
    });

    it("should initialize with data", function () {
        var data = {a:10},
            couchDBDocument = new CouchDBDocument(data);

        expect(couchDBDocument.get("a")).toBe(10);
    });

    it("should return a new promise", function () {
        var couchDBDocument = new CouchDBDocument,
            promise;

        couchDBDocument.setTransport(transportMock),
        promise = couchDBDocument.sync("db", "document");
        expect(promise).toBeInstanceOf(Promise);
    });

});

describe("CouchDBDocument delegates its internal states to a stateMachine", function () {

    var couchDBDocument = null,
        stateMachine = null;

    beforeEach(function () {
        couchDBDocument = new CouchDBDocument;
        stateMachine = couchDBDocument.getStateMachine();
    });

    it("should embed a stateMachine", function () {
        expect(couchDBDocument.getStateMachine).toBeInstanceOf(Function);
        expect(couchDBDocument.getStateMachine()).toBeInstanceOf(StateMachine);
    });

    it("should have a function to set a new stateMachine", function () {
        var stateMachine = {event:function(){}};
        expect(couchDBDocument.setStateMachine).toBeInstanceOf(Function);
        expect(couchDBDocument.setStateMachine({})).toBe(false);
        expect(couchDBDocument.setStateMachine(stateMachine)).toBe(true);
        expect(couchDBDocument.getStateMachine()).toBe(stateMachine);
    });

    it("should be initialised in Unsynched state by default", function () {
        expect(stateMachine.getCurrent()).toBe("Unsynched");
    });

    it("should have a default Unsynched state", function () {
        var Unsynched = stateMachine.get("Unsynched");

        var sync = Unsynched.get("sync");
        expect(sync[0]).toBe(couchDBDocument.onSync);
        expect(sync[1]).toBe(couchDBDocument);
        expect(sync[2]).toBe("Synched");
    });

    it("should have a default synched state", function () {
        var Synched = stateMachine.get("Synched");

        var listen = Synched.get("listen");
        expect(listen[0]).toBe(couchDBDocument.onListen);
        expect(listen[1]).toBe(couchDBDocument);
        expect(listen[2]).toBe("Listening");

        var unsync = Synched.get("unsync");
        expect(unsync[0].name).toBe("NOOP");
        expect(unsync[2]).toBe("Unsynched");

        var upload = Synched.get("upload");
        expect(upload[0]).toBe(couchDBDocument.databaseCreate);
        expect(upload[1]).toBe(couchDBDocument);
    });

    it("should have a default Listening state", function () {
        var Listening = stateMachine.get("Listening");

        var unsync = Listening.get("unsync");
        expect(unsync[0]).toBe(couchDBDocument.onUnsync);
        expect(unsync[1]).toBe(couchDBDocument);
        expect(unsync[2]).toBe("Unsynched");

        var change = Listening.get("change");
        expect(change[0]).toBe(couchDBDocument.onChange);
        expect(change[1]).toBe(couchDBDocument);

        var add = Listening.get("add");
        expect(add[0]).toBe(couchDBDocument.onAdd);
        expect(add[1]).toBe(couchDBDocument);

        var remove = Listening.get("remove");
        expect(remove[0]).toBe(couchDBDocument.onRemove);
        expect(remove[1]).toBe(couchDBDocument);

        var upload = Listening.get("upload");
        expect(upload[0]).toBe(couchDBDocument.databaseUpdate);
        expect(upload[1]).toBe(couchDBDocument);

        var removeFromDatabase = Listening.get("removeFromDatabase");
        expect(removeFromDatabase[0]).toBe(couchDBDocument.databaseRemove);
        expect(removeFromDatabase[1]).toBe(couchDBDocument);
    });

});

describe("CouchDBDocument can be synchronized with a CouchDB document", function () {

    var couchDBDocument = null;

    beforeEach(function () {
        couchDBDocument = new CouchDBDocument;
    });

    it("should only synchronize if a database and a document is given", function () {
        expect(couchDBDocument.setSyncInfo({})).toBe(false);
        expect(couchDBDocument.setSyncInfo("db")).toBe(false);
        expect(couchDBDocument.setSyncInfo("db", "document")).toBeTruthy();
    });

    it("can also accept a query object", function () {
        expect(couchDBDocument.setSyncInfo("db", "document", "data")).toBe(false);
        expect(couchDBDocument.setSyncInfo("db", "document", {})).toBeTruthy();
    });

    it("should return the syncInfo as an object", function () {
        var query = {},
            syncInfo = couchDBDocument.setSyncInfo("db", "document", query);

        expect(syncInfo["database"]).toBe("db");
        expect(syncInfo["document"]).toBe("document");
        expect(syncInfo["query"]).toBe(query);
    });

});

describe("CouchDBDocument requests the document then subscribes to changes", function () {

    var couchDBDocument = null,
        stateMachine = null,
        query = {};

    beforeEach(function () {
        couchDBDocument = new CouchDBDocument;
        couchDBDocument.setTransport(transportMock);
        couchDBDocument.sync("db", "document1", query);
        stateMachine = couchDBDocument.getStateMachine();
    });

    it("should get a document's data", function () {
        var reqData;

        couchDBDocument.onSync();

        expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");
        reqData = transportMock.request.mostRecentCall.args[1];
        expect(reqData).toBeInstanceOf(Object);
        expect(reqData["method"]).toBe("GET");
        expect(reqData["path"]).toBe("/db/document1");
        expect(reqData["query"]).toBe(query);
        expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
        expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBDocument);
    });

    it("should reset the store on sync and ask for changes subscription", function () {
        var res =  '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
            callback,
            doc;

        couchDBDocument.onSync();

        callback = transportMock.request.mostRecentCall.args[2];
        spyOn(stateMachine, "event");
        spyOn(couchDBDocument, "reset");

        callback.call(couchDBDocument, res);

        expect(couchDBDocument.reset.wasCalled).toBe(true);
        doc = couchDBDocument.reset.mostRecentCall.args[0];
        expect(doc).toBeInstanceOf(Object);

        expect(doc["_rev"]).toBe("1-7f5175756a7ab72660278c3c0aed2eee")

        expect(stateMachine.event.wasCalled).toBe(true);
        expect(stateMachine.event.mostRecentCall.args[0]).toBe("listen");
    });

    it("should fulfill the promise if the document doesn't exist", function () {
        couchDBDocument.onSync();
        var promise = couchDBDocument.sync("db", "document2"),
            callback = transportMock.request.mostRecentCall.args[2];

        spyOn(promise, "fulfill");
        callback.call(couchDBDocument, '{"reason": "missing"}');

        expect(promise.fulfill.wasCalled).toBe(true);
        expect(promise.fulfill.mostRecentCall.args[0].reason).toBe("missing");
    });

    it("should fulfill the promise when the doc is synched", function () {
        var promise = couchDBDocument.getPromise(),
            callback;

        couchDBDocument.onSync();

        callback = transportMock.request.mostRecentCall.args[2];

        spyOn(promise, "fulfill");
        callback.call(couchDBDocument, '{"_id": "id"}');

        expect(promise.fulfill.wasCalled).toBe(true);
        expect(promise.fulfill.mostRecentCall.args[0]._id).toBe("id");
    });

    it("should subscribe to document changes", function () {
        var reqData;
        expect(couchDBDocument.stopListening).toBeUndefined();
        couchDBDocument.onListen();
        expect(couchDBDocument.stopListening).toBe(stopListening);
        expect(transportMock.listen.wasCalled).toBe(true);
        expect(transportMock.listen.mostRecentCall.args[0]).toBe("CouchDB");
        expect(transportMock.listen.mostRecentCall.args[1].path).toBe("/db/_changes");
        reqData = transportMock.listen.mostRecentCall.args[1].query;
        expect(reqData.feed).toBe("continuous");
        expect(reqData.heartbeat).toBe(20000);
        expect(reqData.descending).toBe(true);
        expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
        expect(transportMock.listen.mostRecentCall.args[3]).toBe(couchDBDocument);
    });

    it("should not fail with empty json from heartbeat", function () {
        couchDBDocument.onListen();
        callback = transportMock.listen.mostRecentCall.args[2];

        expect(function() {
            callback("\n");
        }).not.toThrow();
    });

    it("should call for store update on document update", function () {
        var listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
            callback;

        spyOn(stateMachine, "event");

        couchDBDocument.onListen();
        callback = transportMock.listen.mostRecentCall.args[2];

        callback.call(couchDBDocument, listenRes);

        expect(stateMachine.event.wasCalled).toBe(true);
        expect(stateMachine.event.mostRecentCall.args[0]).toBe("change");
    });

    it("should not get changes when another document is updated", function () {
        var listenRes = '{"seq":12,"id":"document5","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
            callback;

        spyOn(stateMachine, "event");

        couchDBDocument.onListen();
        callback = transportMock.listen.mostRecentCall.args[2];

        callback.call(couchDBDocument, listenRes);

        expect(stateMachine.event.wasCalled).toBe(false);
    });

    it("should not get changes if the rev is the same", function () {
        var listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
            callback;

        couchDBDocument.set("_rev", "2-0b77a81676739718c23c72a12a131986");

        spyOn(stateMachine, "event");

        couchDBDocument.onListen();
        callback = transportMock.listen.mostRecentCall.args[2];

        callback.call(couchDBDocument, listenRes);

        expect(stateMachine.event.wasCalled).toBe(false);
    });

    it("should call for document deletion when the document is removed", function () {
        var listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}], "deleted": true}',
            callback;

        spyOn(stateMachine, "event");

        couchDBDocument.onListen();
        callback = transportMock.listen.mostRecentCall.args[2];

        callback.call(couchDBDocument, listenRes);

        expect(stateMachine.event.wasCalled).toBe(true);
        expect(stateMachine.event.mostRecentCall.args[0]).toBe("remove");
    });

    it("should update store on call for update", function () {
        var reqData,
            callback;

        couchDBDocument.onChange();

        expect(transportMock.request.wasCalled).toBe(true);
        expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");

        reqData = transportMock.request.mostRecentCall.args[1];
        expect(reqData).toBeInstanceOf(Object);
        expect(reqData["method"]).toBe("GET");
        expect(reqData["path"]).toBe("/db/document1");

        spyOn(couchDBDocument, "reset");
        callback = transportMock.request.mostRecentCall.args[2];
        expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
        callback.call(couchDBDocument, '{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}');
        expect(couchDBDocument.reset.wasCalled).toBe(true);
        expect(couchDBDocument.reset.mostRecentCall.args[0]._rev).toBe("2-0b77a81676739718c23c72a12a131986");

        expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBDocument);
    });

    it("should empty the store on document deletion", function () {
        spyOn(couchDBDocument, "reset");
        couchDBDocument.onRemove();
        expect(couchDBDocument.reset.wasCalled).toBe(true);
        expect(couchDBDocument.getNbItems()).toBe(0);
    });

});

describe("CouchDBDocument can also update the database", function () {

    var couchDBDocument = null,
        stateMachine = null;

    beforeEach(function () {
        couchDBDocument = new CouchDBDocument;
        couchDBDocument.setTransport(transportMock);
        couchDBDocument.sync("db", "document1");
        stateMachine = couchDBDocument.getStateMachine();
    });

    it("should have a function to upload a document", function () {
        expect(couchDBDocument.upload).toBeInstanceOf(Function);
        spyOn(stateMachine, "event");
        couchDBDocument.upload();
        expect(stateMachine.event.wasCalled).toBe(true);
        expect(stateMachine.event.mostRecentCall.args[0]).toBe("upload");
    });

    it("should return a promise", function () {
        spyOn(stateMachine, "event");
        expect(couchDBDocument.upload()).toBeInstanceOf(Promise);
    });

    it("should add a transition for creating a document", function () {
        var Synched = stateMachine.get("Synched");
        var createDocument = Synched.get("upload");
        expect(createDocument[0]).toBe(couchDBDocument.databaseCreate);
        expect(createDocument[1]).toBe(couchDBDocument);
    });

    it("should pass the promise to the upload function so it can fulfill or reject it", function () {
        spyOn(stateMachine, "event");
        var promise = couchDBDocument.upload();
        expect(stateMachine.event.mostRecentCall.args[1]).toBe(promise);
    });

    it("should update the database on update", function () {
        var reqData;
        couchDBDocument.set("fakeRev", "10-hello");
        couchDBDocument.databaseCreate();
        expect(transportMock.request.wasCalled).toBe(true);
        expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");

        reqData = transportMock.request.mostRecentCall.args[1];
        expect(reqData).toBeInstanceOf(Object);
        expect(reqData["method"]).toBe("PUT");
        expect(reqData["path"]).toBe("/db/document1");
        expect(reqData["headers"]["Content-Type"]).toBe("application/json");
        expect(JSON.parse(reqData.data).fakeRev).toBe("10-hello");
    });

    it("should fulfill the promise on update if update ok", function () {
        var promise = new Promise,
            response = '{"ok":true}';
        spyOn(promise, "fulfill");
        couchDBDocument.databaseUpdate(promise);
        transportMock.request.mostRecentCall.args[2].call(couchDBDocument, response);
        expect(promise.fulfill.wasCalled).toBe(true);
        expect(promise.fulfill.mostRecentCall.args[0].ok).toBe(true);
    });

    it("should update rev on update ok", function () {
        var response = '{"ok":true,"rev":7}',
            promise = new Promise;

        spyOn(couchDBDocument, "set");
        couchDBDocument.databaseUpdate(promise);
        transportMock.request.mostRecentCall.args[2].call(couchDBDocument, response);
        expect(couchDBDocument.set.wasCalled).toBe(true);
        expect(couchDBDocument.set.mostRecentCall.args[0]).toBe("_rev");
        expect(couchDBDocument.set.mostRecentCall.args[1]).toBe(7);
    });

    it("should reject the promise on update if update failed", function () {
        var promise = new Promise,
            response = '{"ok":false}';
        spyOn(promise, "reject");
        couchDBDocument.databaseUpdate(promise);
        transportMock.request.mostRecentCall.args[2](response);
        expect(promise.reject.wasCalled).toBe(true);
        expect(promise.reject.mostRecentCall.args[0].ok).toBe(false);
    });

    it("should add document on update if it's missing", function () {
        var reqData;
        couchDBDocument.set("fakeRev", "10-hello");
        couchDBDocument.databaseCreate(new Promise);
        expect(transportMock.request.wasCalled).toBe(true);
        expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");

        reqData = transportMock.request.mostRecentCall.args[1];
        expect(reqData).toBeInstanceOf(Object);
        expect(reqData["method"]).toBe("PUT");
        expect(reqData["path"]).toBe("/db/document1");
        expect(reqData["headers"]["Content-Type"]).toBe("application/json");
        expect(JSON.parse(reqData.data).fakeRev).toBe("10-hello");

        spyOn(stateMachine, "event");
        expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
        transportMock.request.mostRecentCall.args[2].call(couchDBDocument, '{"ok":true}');
        expect(stateMachine.event.wasCalled).toBe(true);
        expect(stateMachine.event.mostRecentCall.args[0]).toBe("listen");
    });

    it("should fulfill the promise on doc create if update ok", function () {
        var promise = new Promise,
            response = '{"ok":true}';
        spyOn(promise, "fulfill");
        couchDBDocument.databaseCreate(promise);
        transportMock.request.mostRecentCall.args[2].call(couchDBDocument, response);
        expect(promise.fulfill.wasCalled).toBe(true);
        expect(promise.fulfill.mostRecentCall.args[0].ok).toBe(true);
    });

    it("should set the _rev and _id when the doc is created", function () {
        var promise = new Promise,
            response = '{"ok":true, "id": "document", "rev": "10"}';
        couchDBDocument.databaseCreate(promise);
        transportMock.request.mostRecentCall.args[2].call(couchDBDocument, response);
        expect(couchDBDocument.get("_id")).toBe("document");
        expect(couchDBDocument.get("_rev")).toBe("10");
    });

    it("should reject the promise on doc create if update failed", function () {
        var promise = new Promise,
            response = '{"ok":false}';
        spyOn(promise, "reject");
        couchDBDocument.databaseCreate(promise);
        transportMock.request.mostRecentCall.args[2].call(couchDBDocument, response);
        expect(promise.reject.wasCalled).toBe(true);
        expect(promise.reject.mostRecentCall.args[0].ok).toBe(false);
    });

    it("should have a function to remove a document", function () {
        expect(couchDBDocument.remove).toBeInstanceOf(Function);
        spyOn(stateMachine, "event");
        couchDBDocument.remove();
        expect(stateMachine.event.wasCalled).toBe(true);
        expect(stateMachine.event.mostRecentCall.args[0]).toBe("removeFromDatabase");
    });

    it("should remove a document from the database", function () {
        couchDBDocument.set("_rev", "10-hello");

        couchDBDocument.databaseRemove();
        expect(transportMock.request.wasCalled).toBe(true);
        expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");
        expect(transportMock.request.mostRecentCall.args[1].method).toBe("DELETE");
        expect(transportMock.request.mostRecentCall.args[1].path).toBe("/db/document1");
        expect(transportMock.request.mostRecentCall.args[1].query.rev).toBe("10-hello");
    });

    it("should return a promise that is fulfilled when the document is removed", function () {
        expect(couchDBDocument.remove()).toBeInstanceOf(Promise);
        var promise = new Promise();
        couchDBDocument.databaseRemove(promise);
        var callback = transportMock.request.mostRecentCall.args[2];

        spyOn(promise, "fulfill");

        expect(callback).toBeInstanceOf(Function);
        callback('{"ok":true}');

        expect(promise.fulfill.wasCalled).toBe(true);
        expect(promise.fulfill.mostRecentCall.args[0].ok).toBe(true);
    });

    it("should return a promise that is fulfilled when the document is removed", function () {
        var promise = new Promise();
        couchDBDocument.databaseRemove(promise);
        var callback = transportMock.request.mostRecentCall.args[2];

        spyOn(promise, "reject");

        expect(callback).toBeInstanceOf(Function);
        callback('{}');

        expect(promise.reject.wasCalled).toBe(true);
    });

});