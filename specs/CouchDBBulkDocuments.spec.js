/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["CouchDBBase", "CouchDBBulkDocuments", "Store", "Promise", "StateMachine"],

function (CouchDBBase, CouchDBBulkDocuments, Store, Promise, StateMachine) {

	var transportMock = null,
		stopListening = null,
		query = {};

	beforeEach(function () {
		stopListening = jasmine.createSpy();
		transportMock = {
			request: jasmine.createSpy(),
			listen: jasmine.createSpy().andReturn(stopListening)
		};
	});

	describe("CouchDBBulkDocuments inherits from CouchDBBase", function () {

		it("should be a constructor function", function () {
			expect(CouchDBBulkDocuments).toBeInstanceOf(Function);
		});

		it("should inherit from CouchDBBase", function () {
			expect(CouchDBBulkDocuments).toBeInstanceOf(CouchDBBase.constructor);
		});

		it("should initialize with data", function () {
			var data = {a:10},
				couchDBBulkDocuments = new CouchDBBulkDocuments(data);

			expect(couchDBBulkDocuments.get("a")).toBe(10);
		});

		it("should return a new promise", function () {
			var couchDBBulkDocuments = new CouchDBBulkDocuments,
				promise;

			couchDBBulkDocuments.setTransport(transportMock),
			promise = couchDBBulkDocuments.sync("db", query);
			expect(promise).toBeInstanceOf(Promise);
		});

	});

	describe("CouchDBBulkDocuments delegates its internal states to a stateMachine", function () {

		var couchDBBulkDocuments = null,
			stateMachine = null;

		beforeEach(function () {
			couchDBBulkDocuments = new CouchDBBulkDocuments;
			stateMachine = couchDBBulkDocuments.getStateMachine();
		});

		it("should embed a stateMachine", function () {
			expect(couchDBBulkDocuments.getStateMachine).toBeInstanceOf(Function);
			expect(couchDBBulkDocuments.getStateMachine()).toBeInstanceOf(StateMachine);
		});

		it("should have a function to set a new stateMachine", function () {
			var stateMachine = {event:function(){}};
			expect(couchDBBulkDocuments.setStateMachine).toBeInstanceOf(Function);
			expect(couchDBBulkDocuments.setStateMachine({})).toBe(false);
			expect(couchDBBulkDocuments.setStateMachine(stateMachine)).toBe(true);
			expect(couchDBBulkDocuments.getStateMachine()).toBe(stateMachine);
		});

		it("should be initialised in Unsynched state by default", function () {
			expect(stateMachine.getCurrent()).toBe("Unsynched");
		});

		it("should have a default Unsynched state", function () {
			var Unsynched = stateMachine.get("Unsynched");

			var sync = Unsynched.get("sync");
			expect(sync[0]).toBe(couchDBBulkDocuments.onSync);
			expect(sync[1]).toBe(couchDBBulkDocuments);
			expect(sync[2]).toBe("Synched");
		});

		it("should have a default synched state", function () {
			var Synched = stateMachine.get("Synched");

			var listen = Synched.get("listen");
			expect(listen[0]).toBe(couchDBBulkDocuments.onListen);
			expect(listen[1]).toBe(couchDBBulkDocuments);
			expect(listen[2]).toBe("Listening");

			var unsync = Synched.get("unsync");
			expect(unsync[0].name).toBe("NOOP");
			expect(unsync[2]).toBe("Unsynched");
		});

		it("should have a default Listening state", function () {
			var Listening = stateMachine.get("Listening");

			var unsync = Listening.get("unsync");
			expect(unsync[0]).toBe(couchDBBulkDocuments.onUnsync);
			expect(unsync[1]).toBe(couchDBBulkDocuments);
			expect(unsync[2]).toBe("Unsynched");

			var change = Listening.get("change");
			expect(change[0]).toBe(couchDBBulkDocuments.onChange);
			expect(change[1]).toBe(couchDBBulkDocuments);

			var add = Listening.get("add");
			expect(add[0]).toBe(couchDBBulkDocuments.onAdd);
			expect(add[1]).toBe(couchDBBulkDocuments);

			var remove = Listening.get("remove");
			expect(remove[0]).toBe(couchDBBulkDocuments.onRemove);
			expect(remove[1]).toBe(couchDBBulkDocuments);

			var upload = Listening.get("upload");
			expect(upload[0]).toBe(couchDBBulkDocuments.databaseUpdate);
			expect(upload[1]).toBe(couchDBBulkDocuments);
		});

	});

	describe("CouchDBBulkDocuments can be synchronized with a bulk of CouchDB documents", function () {

		var couchDBBulkDocuments = null;

		beforeEach(function () {
			couchDBBulkDocuments = new CouchDBBulkDocuments;
		});

		it("should only synchronize if a database and a query object is given", function () {
			expect(couchDBBulkDocuments.setSyncInfo({})).toBe(false);
			expect(couchDBBulkDocuments.setSyncInfo("db")).toBe(false);
			expect(couchDBBulkDocuments.setSyncInfo("db", {})).toBeTruthy();
		});

		it("should return the syncInfo as an object", function () {
			var query = {},
				syncInfo = couchDBBulkDocuments.setSyncInfo("db", query);

			expect(syncInfo["database"]).toBe("db");
			expect(syncInfo["query"]).toBe(query);
		});

		it("should bring up keys one level up", function () {
			var query = {},
				keys = [];

			query.keys = keys;
			syncInfo = couchDBBulkDocuments.setSyncInfo("db", query);

			expect(syncInfo["database"]).toBe("db");
			expect(syncInfo["query"]).toBe(query);
			expect(syncInfo["keys"]).toBe(keys);
			expect(syncInfo["query"].keys).toBeUndefined();
		});

	});


	/**
	 * A CouchDBBulkDocuments can synchronize with a bulk of documents
	 * A bulk of documents is an arbitrary ordered array of documents
	 */
	describe("CouchDBStoreBulkDocumentsData", function () {

		var couchDBBulkDocuments = null,
			stateMachine = null,
			query = {},
			keys = ["document1", "document2"];

		beforeEach(function () {
			couchDBBulkDocuments = new CouchDBBulkDocuments;
			couchDBBulkDocuments.setTransport(transportMock);
			query.keys = keys;
			couchDBBulkDocuments.sync("db", query);
			stateMachine = couchDBBulkDocuments.getStateMachine();
		});

		it("get a bulk of documents' data", function () {
			var reqData;

			couchDBBulkDocuments.onSync();

			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("POST");
			expect(reqData["path"]).toEqual("/db/_all_docs");
			expect(reqData["headers"]["Content-Type"]).toEqual("application/json");
			expect(reqData["query"]).toBe(query);
			expect(reqData["query"].include_docs).toEqual(true);
			expect(JSON.parse(reqData["data"]).keys[0]).toEqual("document1");
			expect(JSON.parse(reqData["data"]).keys[1]).toEqual("document2");
			expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBBulkDocuments);
		});

		it("should reset the store on sync and ask for changes subscription", function () {

			var res = '{"total_rows":2,"update_seq":2,"offset":0,"rows":['+
					'{"id":"document1","key":"document1","value":{"rev":"1-793111e6af0ccddb08147c0be1f49843"},"doc":{"_id":"document1","_rev":"1-793111e6af0ccddb08147c0be1f49843","desc":"my first doc"}},'+
					'{"id":"document2","key":"document2","value":{"rev":"1-498184b1f395834249a2ffbf3e73d372"},"doc":{"_id":"document2","_rev":"1-498184b1f395834249a2ffbf3e73d372","desc":"my second doc"}}'+
					']}',
				callback;

			couchDBBulkDocuments.onSync();

			callback = transportMock.request.mostRecentCall.args[2];
			spyOn(stateMachine, "event");
			spyOn(couchDBBulkDocuments, "reset");

			callback.call(couchDBBulkDocuments, res);

			expect(couchDBBulkDocuments.reset.wasCalled).toEqual(true);
			expect(couchDBBulkDocuments.reset.mostRecentCall.args[0]).toBeInstanceOf(Object);
			expect(couchDBBulkDocuments.reset.mostRecentCall.args[0][0].key).toEqual("document1");

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("listen");

		});

		it("should throw an explicit error if resulting json has no 'row' property", function () {
			var cb;

			couchDBBulkDocuments.onSync();
			cb = transportMock.request.mostRecentCall.args[2];

			expect(function () {
				cb.call(couchDBBulkDocuments, '{"error":""}');
			}).toThrow('CouchDBBulkDocuments.sync("db", {"keys":["document1","document2"]}) failed: {"error":""}');
		});

		it("should fulfill the promise when the bulk of docs is synched", function () {
			var promise = couchDBBulkDocuments.sync("db", {}),
				res = '{"total_rows":2,"update_seq":2,"offset":0,"rows":['+
					'{"id":"document1","key":"document1","value":{"rev":"1-793111e6af0ccddb08147c0be1f49843"},"doc":{"_id":"document1","_rev":"1-793111e6af0ccddb08147c0be1f49843","desc":"my first doc"}},'+
					'{"id":"document2","key":"document2","value":{"rev":"1-498184b1f395834249a2ffbf3e73d372"},"doc":{"_id":"document2","_rev":"1-498184b1f395834249a2ffbf3e73d372","desc":"my second doc"}}'+
					']}',
				callback;

			couchDBBulkDocuments.onSync();
			spyOn(promise, "fulfill");
			callback = transportMock.request.mostRecentCall.args[2];

			callback.call(couchDBBulkDocuments, res);
			expect(promise.fulfill.wasCalled).toEqual(true);
			expect(promise.fulfill.mostRecentCall.args[0]).toBe(couchDBBulkDocuments);
		});

		it("should subscribe to bulk changes", function () {
			var reqData;

			expect(couchDBBulkDocuments.stopListening).toBeUndefined();
			couchDBBulkDocuments.onListen();
			expect(couchDBBulkDocuments.stopListening).toBe(stopListening);

			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1].path).toEqual("/db/_changes");
			reqData = transportMock.listen.mostRecentCall.args[1].query;
			expect(reqData.feed).toEqual("continuous");
			expect(reqData.heartbeat).toEqual(20000);
			expect(reqData.descending).toEqual(true);
			expect(reqData.include_docs).toEqual(true);
			expect(reqData).toBe(query);
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.listen.mostRecentCall.args[3]).toBe(couchDBBulkDocuments);
		});

		it("should not fail with empty json from heartbeat", function () {
			var callback;

			couchDBBulkDocuments.onListen();
			callback = transportMock.listen.mostRecentCall.args[2];

			expect(function() {
				callback("\n");
			}).not.toThrow();
		});

		it("should call for document addition if a document has been added to the database", function () {
			var listenRes = '{"seq":3,"id":"document2","changes":[{"rev":"1-a071048ce217ff1341fb224b83417003"}],"doc":{"_id":"document2","_rev":"1-a071048ce217ff1341fb224b83417003","desc":"my second document"}}',
				callback;

			spyOn(stateMachine, "event");

			couchDBBulkDocuments.onListen();
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBBulkDocuments, listenRes);

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("add");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document2");
		});

		it("should call for document update if one of them has changed", function () {
			var listenRes = '{"seq":3,"id":"document2","changes":[{"rev":"2-a071048ce217ff1341fb224b83417003"}],"doc":{"_id":"document2","_rev":"2-a071048ce217ff1341fb224b83417003","desc":"my second document"}}',
				callback;

			spyOn(stateMachine, "event");

			couchDBBulkDocuments.onListen();
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBBulkDocuments, listenRes);

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("change");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document2");
			expect(stateMachine.event.mostRecentCall.args[2]._rev).toEqual("2-a071048ce217ff1341fb224b83417003");
		});

		it("should call for document removal if one of them was removed", function () {
			var listenRes = '{"seq":5,"id":"document2","changes":[{"rev":"3-e597919e6e32c045553beb8eb3688b21"}],"deleted":true}',
				callback;

			spyOn(stateMachine, "event");

			couchDBBulkDocuments.onListen();
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBBulkDocuments, listenRes);

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("remove");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document2");
		});

		it("should add the new document (only works with range)", function () {

			var query = {starkey: "document1", endkey: "document5"},
				result = '{"total_rows":2,"offset":0,"rows":[' +
					'{"id":"document2","key":"document2","value":{"rev":"5-aa1e4ec04d056f1cba18895a33be7f4d"},"doc":{"_id":"document2","_rev":"5-aa1e4ec04d056f1cba18895a33be7f4d","name":"Emily","type":"JS real-time Framework"}},' +
					'{"id":"document4","key":"document4","value":{"rev":"1-5b629f97e2298a911cce75d01bd6c65e"},"doc":{"_id":"document4","_rev":"1-5b629f97e2298a911cce75d01bd6c65e","name":"CouchDB","type":"NoSQL Database"}}' +
				']}';

			spyOn(couchDBBulkDocuments, "alter");

			expect(couchDBBulkDocuments.onAdd()).toEqual(false);

			couchDBBulkDocuments.sync("db", query);

			couchDBBulkDocuments.onAdd("document4");
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_all_docs");
			expect(reqData["query"]).toBe(query);
			expect(reqData["query"].include_docs).toEqual(true);
			expect(reqData["query"].update_seq).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBBulkDocuments);

			transportMock.request.mostRecentCall.args[2].call(couchDBBulkDocuments, result);

			expect(couchDBBulkDocuments.alter.wasCalled).toEqual(true);
			expect(couchDBBulkDocuments.alter.mostRecentCall.args[0]).toEqual("splice");
			expect(couchDBBulkDocuments.alter.mostRecentCall.args[1]).toEqual(1);
			expect(couchDBBulkDocuments.alter.mostRecentCall.args[2]).toEqual(0);
			expect(couchDBBulkDocuments.alter.mostRecentCall.args[3]._rev).toEqual("1-5b629f97e2298a911cce75d01bd6c65e");
		});

		it("should update the selected document", function () {
			var doc = {
					"_id":"document2",
					"_rev":"2-a071048ce217ff1341fb224b83417003",
					"desc":"my second document"
				},
				cb;

			spyOn(couchDBBulkDocuments, "loop");
			spyOn(couchDBBulkDocuments, "set");

			couchDBBulkDocuments.onChange("document2", doc);

			expect(couchDBBulkDocuments.loop.wasCalled).toEqual(true);
			cb = couchDBBulkDocuments.loop.mostRecentCall.args[0];

			expect(cb).toBeInstanceOf(Function);
			expect(couchDBBulkDocuments.loop.mostRecentCall.args[1]).toBe(couchDBBulkDocuments);

			cb.call(couchDBBulkDocuments, {id:"documentFake"}, 1);
			expect(couchDBBulkDocuments.set.wasCalled).toEqual(false);

			cb.call(couchDBBulkDocuments, {id:"document2"}, 1);
			expect(couchDBBulkDocuments.set.wasCalled).toEqual(true);
			expect(couchDBBulkDocuments.set.mostRecentCall.args[0]).toEqual(1);
			expect(couchDBBulkDocuments.set.mostRecentCall.args[1]._rev).toEqual("2-a071048ce217ff1341fb224b83417003");
		});

		it("should delete the removed document", function () {
			couchDBBulkDocuments.reset([{
				"id":"document1",
				"key":"2012/01/13 12:45:56",
				"value":{
					"date":"2012/01/13 12:45:56",
					"title":"my first document",
					"body":"in this database"
				}
			},
			{
				"id":"document2",
				"key":"2012/01/13 13:45:21",
				"value":{
					"date":"2012/01/13 13:45:21",
					"title":"this is a new document",
					"body":"in the database"
				}
			},
			{
				"id":"document3",
				"key":"2012/01/13 21:45:12",
				"value":{
					"date":"2012/01/13 21:45:12",
					"title":"the 3rd document",
					"body":"a change for the example"
				}
			},
			{
				"id":"document4",
				"key":"2012/01/13 23:37:12",
				"value":{
					"date":"2012/01/13 23:37:12",
					"title":"the 4th\'s just been added",
					"body":"do you see me?"
				}
			}]);

			spyOn(couchDBBulkDocuments, "del");
			couchDBBulkDocuments.onRemove("document4");
			expect(couchDBBulkDocuments.del.wasCalled).toBe(true);
			expect(couchDBBulkDocuments.del.mostRecentCall.args[0]).toBe(3);
		});

	});

	describe("CouchDBStoreDataBaseUpdateWithBulkDocuments", function () {

		var couchDBBulkDocuments = null,
			stateMachine = null;

		beforeEach(function () {
			couchDBBulkDocuments = new CouchDBBulkDocuments;
			couchDBBulkDocuments.setTransport(transportMock);
			couchDBBulkDocuments.sync("db", {keys: ["document1", "document2"]});
			stateMachine = couchDBBulkDocuments.getStateMachine();
		});

		it("should have a function to upload a document", function () {
			expect(couchDBBulkDocuments.upload).toBeInstanceOf(Function);
			spyOn(stateMachine, "event");
			couchDBBulkDocuments.upload();
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("upload");
		});

		it("should return a promise", function () {
			expect(couchDBBulkDocuments.upload()).toBeInstanceOf(Promise);
		});

		it("should fulfill the promise on update if update ok", function () {
			var promise = new Promise,
				response = '{}';
			spyOn(promise, "fulfill");
			couchDBBulkDocuments.databaseUpdate(promise);
			transportMock.request.mostRecentCall.args[2](response);
			expect(promise.fulfill.wasCalled).toEqual(true);
			expect(promise.fulfill.mostRecentCall.args[0]).toBeInstanceOf(Object);
		});

		it("should update the database on update", function () {
			var reqData,
				data;

			couchDBBulkDocuments.reset([
				{"id":"document1","key":"document1","value":{"rev":"1-793111e6af0ccddb08147c0be1f49843"},"doc":{"_id":"document1","_rev":"1-793111e6af0ccddb08147c0be1f49843","desc":"my first doc"}},
				{"id":"document2","key":"document2","value":{"rev":"2-a071048ce217ff1341fb224b83417003"},"doc":{"_id":"document2","_rev":"2-a071048ce217ff1341fb224b83417003","desc":"my second document"}}
			]);
			couchDBBulkDocuments.databaseUpdate();

			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			reqData = transportMock.request.mostRecentCall.args[1];

			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("POST");
			expect(reqData["path"]).toEqual("/db/_bulk_docs");
			expect(reqData["headers"]["Content-Type"]).toEqual("application/json");
			data = JSON.parse(reqData.data);
			expect(data.docs).toBeInstanceOf(Array);
			expect(data.docs[0]._id).toEqual("document1");
			expect(data.docs[1]._id).toEqual("document2");

		});

	});

});
