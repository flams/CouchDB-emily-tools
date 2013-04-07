/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["CouchDBBase", "CouchDBView", "Store", "Promise", "StateMachine"],

function (CouchDBBase, CouchDBView, Store, Promise, StateMachine) {

	describe("CouchDBView inherits from CouchDBBase", function () {

		it("should be a constructor function", function () {
			expect(CouchDBView).toBeInstanceOf(Function);
		});

		it("should inherit from CouchDBBase", function () {
			expect(CouchDBView).toBeInstanceOf(CouchDBBase.constructor);
		});

		it("should initialize with data", function () {
			var data = {a:10},
				couchDBView = new CouchDBView(data);

			expect(couchDBView.get("a")).toBe(10);
		});

		it("should return a new promise", function () {
			var couchDBView = new CouchDBView,
				promise;

			couchDBView.setTransport({
				request: jasmine.createSpy()
			});
			promise = couchDBView.sync("db", "design", "view");
			expect(promise).toBeInstanceOf(Promise);
		});

	});

	describe("CouchDBView delegates its internal states to a stateMachine", function () {

		var couchDBView = null,
			stateMachine = null;

		beforeEach(function () {
			couchDBView = new CouchDBView;
			stateMachine = couchDBView.getStateMachine();
		});

		it("should embed a stateMachine", function () {
			expect(couchDBView.getStateMachine).toBeInstanceOf(Function);
			expect(couchDBView.getStateMachine()).toBeInstanceOf(StateMachine);
		});

		it("should have a function to set a new stateMachine", function () {
			var stateMachine = {event:function(){}};
			expect(couchDBView.setStateMachine).toBeInstanceOf(Function);
			expect(couchDBView.setStateMachine({})).toBe(false);
			expect(couchDBView.setStateMachine(stateMachine)).toBe(true);
			expect(couchDBView.getStateMachine()).toBe(stateMachine);
		});

		it("should be initialised in Unsynched state by default", function () {
			expect(stateMachine.getCurrent()).toBe("Unsynched");
		});

		it("should have a default Unsynched state", function () {
			var Unsynched = stateMachine.get("Unsynched");

			var sync = Unsynched.get("sync");
			expect(sync[0]).toBe(couchDBView.onSync);
			expect(sync[1]).toBe(couchDBView);
			expect(sync[2]).toBe("Synched");
		});

		it("should have a default synched state", function () {
			var Synched = stateMachine.get("Synched");

			var listen = Synched.get("listen");
			expect(listen[0]).toBe(couchDBView.onListen);
			expect(listen[1]).toBe(couchDBView);
			expect(listen[2]).toBe("Listening");

			var unsync = Synched.get("unsync");
			expect(unsync[0].name).toBe("NOOP");
			expect(unsync[2]).toBe("Unsynched");
		});

		it("should have a default Listening state", function () {
			var Listening = stateMachine.get("Listening");

			var unsync = Listening.get("unsync");
			expect(unsync[0]).toBe(couchDBView.unsync);
			expect(unsync[1]).toBe(couchDBView);
			expect(unsync[2]).toBe("Unsynched");

			var change = Listening.get("change");
			expect(change[0]).toBe(couchDBView.onChange);
			expect(change[1]).toBe(couchDBView);

			var add = Listening.get("add");
			expect(add[0]).toBe(couchDBView.onAdd);
			expect(add[1]).toBe(couchDBView);

			var remove = Listening.get("remove");
			expect(remove[0]).toBe(couchDBView.onRemove);
			expect(remove[1]).toBe(couchDBView);

			var updateReduced = Listening.get("updateReduced");
			expect(updateReduced[0]).toBe(couchDBView.updateReduced);
			expect(updateReduced[1]).toBe(couchDBView);
		});

	});

	describe("CouchDBView can be synchronized with a CouchDB view", function () {

		var couchDBView = null;

		beforeEach(function () {
			couchDBView = new CouchDBView;
		});

		it("should only synchronize if a database, design doc and a view is given", function () {
			expect(couchDBView.setSyncInfo({})).toBe(false);
			expect(couchDBView.setSyncInfo("db", "design")).toBe(false);
			expect(couchDBView.setSyncInfo("db", "design", "doc")).toBeTruthy();
		});

		it("can also accept a query object", function () {
			expect(couchDBView.setSyncInfo("db", "design", "doc", "data")).toBe(false);
			expect(couchDBView.setSyncInfo("db", "design", "doc", {})).toBeTruthy();
		});

		it("should return the syncInfo as an object", function () {
			var query = {},
				syncInfo = couchDBView.setSyncInfo("db", "design", "view", query);

			expect(syncInfo["database"]).toBe("db");
			expect(syncInfo["design"]).toBe("design");
			expect(syncInfo["view"]).toBe("view");
			expect(syncInfo["query"]).toBe(query);
		});

	});

	describe("CouchDBView requests the view, then subscribes to changes", function () {

		var couchDBView = null,
			transportMock = null,
			stateMachine = null,
			query = {},
			stopListening = null;

		beforeEach(function () {
			couchDBView = new CouchDBView;
			stopListening = jasmine.createSpy();
			transportMock = {
				request: jasmine.createSpy(),
				listen: jasmine.createSpy().andReturn(stopListening)
			};
			couchDBView.setTransport(transportMock);
			stateMachine = couchDBView.getStateMachine();
			couchDBView.sync("db", "design", "_view/view", query);
		});

		it("should add ")

		it("should get a view's data", function () {
			var reqData;

			couchDBView.onSync();
			expect(transportMock.request).toHaveBeenCalled();
			expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toBe("GET");
			expect(reqData["path"]).toBe("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);
		});

		it("should reset the store on sync and ask for changes subscription", function () {
			var res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
			   callback;

			spyOn(stateMachine, "event");
			spyOn(couchDBView, "reset");
			couchDBView.onSync();
			callback = transportMock.request.mostRecentCall.args[2];

			callback.call(couchDBView, res);
			expect(couchDBView.reset.wasCalled).toBe(true);
			expect(couchDBView.reset.mostRecentCall.args[0]).toBeInstanceOf(Object);
			expect(couchDBView.reset.mostRecentCall.args[0][0].value.date).toBe("2012/01/13 12:45:56");
			expect(couchDBView.reset.mostRecentCall.args[0][2].value.title).toBe("the 3rd document");

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("listen");

			expect(transportMock.request.mostRecentCall.args[3]).toBe(couchDBView);
		});

		it("should fulfill the promise when the view is synched", function () {
			var promise = couchDBView.sync("db", "view", "name"),
				res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
				callback;

			couchDBView.onSync();
			spyOn(promise, "fulfill");
			callback = transportMock.request.mostRecentCall.args[2];

			callback.call(couchDBView, res);
			expect(promise.fulfill.wasCalled).toBe(true);
			expect(promise.fulfill.mostRecentCall.args[0]).toBe(couchDBView);
		});

		it("should set the reduced flag if the view is reduced", function () {
			var res = '{"rows":[{"key":null,"value":[150]}]}',
				callback;

			couchDBView.onSync();
			callback = transportMock.request.mostRecentCall.args[2];
			callback.call(couchDBView, res);

			expect(couchDBView.getSyncInfo().reducedView).toBe(true);

		});

		it("should throw an explicit error if resulting json has no 'row' property", function () {
			var cb;
			couchDBView.onSync();
			cb = transportMock.request.mostRecentCall.args[2];

			expect(function () {
				cb.call(couchDBView, '{"error":""}');
			}).toThrow('CouchDBStore [db, design, _view/view].sync() failed: {"error":""}');
		});

		it("should subscribe to view changes", function () {
			var reqData;

			expect(couchDBView.stopListening).toBeUndefined();
			couchDBView.onListen();
			expect(couchDBView.stopListening).toBe(stopListening);
			expect(transportMock.listen.wasCalled).toBe(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toBe("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1].path).toBe("/db/_changes");
			reqData = transportMock.listen.mostRecentCall.args[1].query;
			expect(reqData.feed).toBe("continuous");
			expect(reqData.heartbeat).toBe(20000);
			expect(reqData.descending).toBe(true);
			expect(reqData).toBe(query);
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			expect(transportMock.listen.mostRecentCall.args[3]).toBe(couchDBView);
		});

		it("should not fail with empty json from heartbeat", function () {
			var callback;

			couchDBView.onListen();
			callback = transportMock.listen.mostRecentCall.args[2];

			expect(function() {
				callback("\n");
			}).not.toThrow();

		});

		it("should not fail if json has no changes properties (happens when used with couchdb lucene)", function () {
			var callback;

			couchDBView.onListen();
			callback = transportMock.listen.mostRecentCall.args[2];

			expect(function() {
				callback.call(couchDBView, "{}");
			}).not.toThrow();
		});

		it("should call for document update if one of them has changed", function () {
			var listenRes = '{"seq":9,"id":"document3","changes":[{"rev":"2-4f2957d984aa9d94d4298407f3292a47"}]}',
				callback;

			spyOn(stateMachine, "event");

			couchDBView.onListen(8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBView, listenRes);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("change");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe("document3");
		});

		it("should call for document addition if one of them was added", function () {
			var listenRes = '{"seq":10,"id":"document4","changes":[{"rev":"1-5a99f185bc942f626934108bd604bb33"}]}',
				callback;

			spyOn(stateMachine, "event");

			couchDBView.onListen(8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBView, listenRes);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("add");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe("document4");
		});

		it("should call for document removal if one of them was removed", function () {
			var listenRes = '{"seq":11,"id":"document4","changes":[{"rev":"2-36ec9b80dce993a4a6a9ee311d266807"}],"deleted":true}',
				callback;

			spyOn(stateMachine, "event");

			couchDBView.onListen(8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBView, listenRes);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("delete");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe("document4");
		});

		it("should call for update on reduced view modification", function () {
			var listenRes = '{"rows":[{"key":null,"value":["50","60","80","30"]}]}',
				callback;

			spyOn(stateMachine, "event");
			couchDBView.getSyncInfo().reducedView = true;
			couchDBView.onListen(8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBView, listenRes);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("updateReduced");
			expect(stateMachine.event.mostRecentCall.args[1]).toBeUndefined();
		});

		it("should update the selected document", function () {
			var reqData,
				value,
				callback,
				listenRes = '{"total_rows":3,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}';

			// There must be some data at init for the updateDocInStore function to work
			couchDBView.reset(JSON.parse(listenRes).rows);

			spyOn(couchDBView, "set");

			couchDBView.onChange("document3");
			expect(transportMock.request.wasCalled).toBe(true);
			expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toBe("GET");
			expect(reqData["path"]).toBe("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);

			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBView, listenRes);

			expect(couchDBView.set.wasCalled).toBe(true);
			expect(couchDBView.set.mostRecentCall.args[0]).toBe(2);
			value = couchDBView.set.mostRecentCall.args[1];

			expect(value.value.body).toBe("a change for the example");

		});

		it("should have a function to even the number of items between the view and the store", function () {
			expect(couchDBView.evenDocsInStore).toBeInstanceOf(Function);
		});

		it("should add a document that is present in the view but missing in the store -it's not a new doc, rev!=1-", function () {
			var view =  '{"total_rows":3,"offset":0,"rows":[' +
				'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
				'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
				'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}',
				oldView = JSON.parse(view).rows,
				newView = JSON.parse(view).rows;

			oldView.splice(1, 1);

			couchDBView.reset(oldView);

			spyOn(couchDBView, "alter");
			couchDBView.evenDocsInStore(newView, "document2");

			expect(couchDBView.alter.wasCalled).toBe(true);
			expect(couchDBView.alter.mostRecentCall.args[0]).toBe("splice");
			expect(couchDBView.alter.mostRecentCall.args[1]).toBe(1);
			expect(couchDBView.alter.mostRecentCall.args[2]).toBe(0);
			expect(couchDBView.alter.mostRecentCall.args[3].id).toBe("document2");
		});

		it("should remove a document that is not present in the view anymore -it's not a removed doc!-", function () {
			var view =  '{"total_rows":3,"offset":0,"rows":[' +
				'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
				'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
				'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}',
				oldView = JSON.parse(view).rows,
				newView = JSON.parse(view).rows;

			newView.splice(1, 1);


			couchDBView.reset(oldView);

			spyOn(couchDBView, "loop").andCallThrough();
			spyOn(couchDBView, "del");
			couchDBView.evenDocsInStore(newView, "document2");

			expect(couchDBView.loop.wasCalled).toBe(true);
			expect(couchDBView.del.wasCalled).toBe(true);
			expect(couchDBView.del.mostRecentCall.args[0]).toBe(1);

		});

		it("should call the even function if there's a difference between the number of items in the store and the view", function () {
			var callback,
				listenRes = '{"total_rows":2,"offset":0,"rows":[' +
				'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
				'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}';

			couchDBView.onChange("document2");
			callback = transportMock.request.mostRecentCall.args[2];

			spyOn(couchDBView, "evenDocsInStore");
			callback.call(couchDBView, listenRes);

			expect(couchDBView.evenDocsInStore.wasCalled).toBe(true);
			expect(couchDBView.evenDocsInStore.mostRecentCall.args[0][1].id).toBe("document3");
			expect(couchDBView.evenDocsInStore.mostRecentCall.args[1]).toBe("document2");

		});

		it("should add the new document", function () {
			var reqData,
				value,
				callback,
				listenRes = '{"total_rows":4,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}},' +
					'{"id":"document4","key":"2012/01/13 23:37:12","value":{"date":"2012/01/13 23:37:12","title":"the 4th\'s just been added","body":"do you see me?"}}]}';

			spyOn(couchDBView, "alter");

			couchDBView.onAdd("document4");
			expect(transportMock.request.wasCalled).toBe(true);
			expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toBe("GET");
			expect(reqData["path"]).toBe("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);

			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBView, listenRes);

			expect(couchDBView.alter.wasCalled).toBe(true);
			expect(couchDBView.alter.mostRecentCall.args[0]).toBe("splice");
			expect(couchDBView.alter.mostRecentCall.args[1]).toBe(3);
			expect(couchDBView.alter.mostRecentCall.args[2]).toBe(0);
			value = couchDBView.alter.mostRecentCall.args[3];

			expect(value.value.body).toBe("do you see me?");
		});

		it("should delete the removed document", function () {
			couchDBView.reset([{
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

			spyOn(couchDBView, "del");
			couchDBView.onRemove("document4");
			expect(couchDBView.del.wasCalled).toBe(true);
			expect(couchDBView.del.mostRecentCall.args[0]).toBe(3);
		});

		it("should add a transition for updating a reduced view", function () {
			var Listening = stateMachine.get("Listening");
			var updateReduced = Listening.get("updateReduced");
			expect(updateReduced[0]).toBe(couchDBView.updateReduced);
			expect(updateReduced[1]).toBe(couchDBView);
		});

		it("should update the reduced view", function () {
			var reqData,
				json,
				callback,
				listenRes = '{"rows":[{"key":null,"value":["50","60","80","30"]}]}',
				parsed = JSON.parse(listenRes);

			spyOn(couchDBView, "set");
			spyOn(JSON, "parse").andReturn(parsed);

			couchDBView.updateReduced();
			expect(transportMock.request.wasCalled).toBe(true);
			expect(transportMock.request.mostRecentCall.args[0]).toBe("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toBe("GET");
			expect(reqData["path"]).toBe("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);

			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBView, listenRes);

			expect(JSON.parse.wasCalled).toBe(true);
			expect(JSON.parse.mostRecentCall.args[0]).toBe(listenRes);

			expect(couchDBView.set.wasCalled).toBe(true);
			expect(couchDBView.set.mostRecentCall.args[0]).toBe(0);
			expect(couchDBView.set.mostRecentCall.args[1]).toBe(parsed.rows[0]);
		});

	});

});
