/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["CouchDBBase", "CouchDBDocument", "Store", "Promise"],

function (CouchDBBase, CouchDBDocument, Store, Promise) {

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
				promise = couchDBDocument.sync("db", "document");

			expect(promise).toBeInstanceOf(Promise);
		});

	});

	describe("CouchDBDocument can be synchronized with a CouchDB document", function () {

		var couchDBDocument = null;

		beforeEach(function () {
			couchDBDocument = new CouchDBDocument;
		});

		it("should only synchronize if a database, design doc and a view is given", function () {
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
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("onListen");
		});

		it("should reject the callback if the document doesn't exist", function () {
			couchDBDocument.onSync();
			var promise = couchDBDocument.sync("db", "document2"),
				callback = transportMock.request.mostRecentCall.args[2];

			spyOn(promise, "reject");
			callback.call(couchDBDocument, "{}");

			expect(promise.reject.wasCalled).toBe(true);
			expect(promise.reject.mostRecentCall.args[0]).toBe("{}");
		});

		it("should fulfill the promise when the doc is synched", function () {
			var promise = couchDBDocument.getPromise(),
				callback;

			couchDBDocument.onSync();

			callback = transportMock.request.mostRecentCall.args[2];

			spyOn(promise, "fulfill");
			callback.call(couchDBDocument, '{"_id": "id"}');

			expect(promise.fulfill.wasCalled).toBe(true);
			expect(promise.fulfill.mostRecentCall.args[0]).toBe(couchDBDocument);
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

		it("should have a function to remove a document", function () {
			expect(couchDBDocument.remove).toBeInstanceOf(Function);
			spyOn(stateMachine, "event");
			couchDBDocument.remove();
			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("removeFromDatabase");
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
/**
		it("should add document on update if it's missing", function () {
			var reqData;
			couchDBDocument.set("fakeRev", "10-hello");
			couchDBDocument.createDocument.call(couchDBDocument, new Promise);
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
			transportMock.request.mostRecentCall.args[2]('{"ok":true}');
			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("subscribeToDocumentChanges");
		});

		it("should fulfill the promise on doc create if update ok", function () {
			var promise = new Promise,
				response = '{"ok":true}';
			spyOn(promise, "fulfill");
			couchDBDocument.createDocument.call(couchDBDocument, promise);
			transportMock.request.mostRecentCall.args[2](response);
			expect(promise.fulfill.wasCalled).toBe(true);
			expect(promise.fulfill.mostRecentCall.args[0].ok).toBe(true);
		});

		it("should reject the promise on doc create if update failed", function () {
			var promise = new Promise,
				response = '{"ok":false}';
			spyOn(promise, "reject");
			couchDBDocument.createDocument.call(couchDBDocument, promise);
			transportMock.request.mostRecentCall.args[2](response);
			expect(promise.reject.wasCalled).toBe(true);
			expect(promise.reject.mostRecentCall.args[0].ok).toBe(false);
		});

		it("should remove a document from the database", function () {
			couchDBDocument.set("_rev", "10-hello");

			couchDBDocument.removeFromDatabase.call(couchDBDocument);
			expect(transportMock.request.wasCalled).toBe(true);
			expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");
			expect(transportMock.request.mostRecentCall.args[1].method).toBe("DELETE");
			expect(transportMock.request.mostRecentCall.args[1].path).toBe("/db/document1");
			expect(transportMock.request.mostRecentCall.args[1].query.rev).toBe("10-hello");
		});
**/
	});

});
