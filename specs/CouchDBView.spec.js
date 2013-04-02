/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["CouchDBBase", "CouchDBView", "Store", "Promise"],

function (CouchDBBase, CouchDBView, Store, Promise) {

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
				promise = couchDBView.sync("db", "design", "view");
			expect(promise).toBeInstanceOf(Promise);
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
			stopListening = jasmine.createSpy();

		beforeEach(function () {
			couchDBView = new CouchDBView;
			transportMock = {
				request: jasmine.createSpy(),
				listen: jasmine.createSpy().andReturn(stopListening)
			};
			couchDBView.setTransport(transportMock);
			stateMachine = couchDBView.getStateMachine();
			couchDBView.sync("db", "design", "_view/view", query);
		});

		it("should get a view's data", function () {
			var reqData;

			couchDBView.onSync();
			expect(transportMock.request).toHaveBeenCalled();
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
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
			expect(couchDBView.reset.wasCalled).toEqual(true);
			expect(couchDBView.reset.mostRecentCall.args[0]).toBeInstanceOf(Object);
			expect(couchDBView.reset.mostRecentCall.args[0][0].value.date).toEqual("2012/01/13 12:45:56");
			expect(couchDBView.reset.mostRecentCall.args[0][2].value.title).toEqual("the 3rd document");

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToViewChanges");

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
			expect(promise.fulfill.wasCalled).toEqual(true);
			expect(promise.fulfill.mostRecentCall.args[0]).toBe(couchDBView);
		});

		it("should set the reduced flag if the view is reduced", function () {
			var res = '{"rows":[{"key":null,"value":[150]}]}',
				callback;

			couchDBView.onSync();
			callback = transportMock.request.mostRecentCall.args[2];
			callback.call(couchDBView, res);

			expect(couchDBView.getSyncInfo().reducedView).toEqual(true);

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

			expect(couchDBView.stopListening).not.toBe(stopListening);
			couchDBView.onListen();
			expect(couchDBView.stopListening).toBe(stopListening);
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1].path).toEqual("/db/_changes");
			reqData = transportMock.listen.mostRecentCall.args[1].query;
			expect(reqData.feed).toEqual("continuous");
			expect(reqData.heartbeat).toEqual(20000);
			expect(reqData.descending).toEqual(true);
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

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("change");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document3");
		});

		it("should call for document addition if one of them was added", function () {
			var listenRes = '{"seq":10,"id":"document4","changes":[{"rev":"1-5a99f185bc942f626934108bd604bb33"}]}',
				callback;

			spyOn(stateMachine, "event");

			couchDBView.onListen(8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBView, listenRes);

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("add");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document4");
		});

		it("should call for document removal if one of them was removed", function () {
			var listenRes = '{"seq":11,"id":"document4","changes":[{"rev":"2-36ec9b80dce993a4a6a9ee311d266807"}],"deleted":true}',
				callback;

			spyOn(stateMachine, "event");

			couchDBView.onListen(8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBView, listenRes);

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("delete");
			expect(stateMachine.event.mostRecentCall.args[1]).toEqual("document4");
		});

		it("should call for update on reduced view modification", function () {
			var listenRes = '{"rows":[{"key":null,"value":["50","60","80","30"]}]}',
				callback;

			spyOn(stateMachine, "event");
			couchDBView.getSyncInfo().reducedView = true;
			couchDBView.onListen(8);
			callback = transportMock.listen.mostRecentCall.args[2];
			callback.call(couchDBView, listenRes);

			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateReduced");
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
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);

			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBView, listenRes);

			expect(couchDBView.set.wasCalled).toEqual(true);
			expect(couchDBView.set.mostRecentCall.args[0]).toEqual(2);
			value = couchDBView.set.mostRecentCall.args[1];

			expect(value.value.body).toEqual("a change for the example");

		});

		it("should have a function to even the number of items between the view and the store", function () {
			expect(couchDBView.evenDocsInStore).toBeInstanceOf(Function);
		});

		it("should add a document that is present in the view but missing in the store -it's not a new doc, rev!=1-", function () {
			var view = 	'{"total_rows":3,"offset":0,"rows":[' +
				'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
				'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
				'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}',
				oldView = JSON.parse(view).rows,
				newView = JSON.parse(view).rows;

			oldView.splice(1, 1);

			couchDBView.reset(oldView);

			spyOn(couchDBView, "alter");
			couchDBView.evenDocsInStore(newView, "document2");

			expect(couchDBView.alter.wasCalled).toEqual(true);
			expect(couchDBView.alter.mostRecentCall.args[0]).toEqual("splice");
			expect(couchDBView.alter.mostRecentCall.args[1]).toEqual(1);
			expect(couchDBView.alter.mostRecentCall.args[2]).toEqual(0);
			expect(couchDBView.alter.mostRecentCall.args[3].id).toEqual("document2");
		});

		it("should remove a document that is not present in the view anymore -it's not a removed doc!-", function () {
			var view = 	'{"total_rows":3,"offset":0,"rows":[' +
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

			expect(couchDBView.loop.wasCalled).toEqual(true);
			expect(couchDBView.del.wasCalled).toEqual(true);
			expect(couchDBView.del.mostRecentCall.args[0]).toEqual(1);

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

			expect(couchDBView.evenDocsInStore.wasCalled).toEqual(true);
			expect(couchDBView.evenDocsInStore.mostRecentCall.args[0][1].id).toEqual("document3");
			expect(couchDBView.evenDocsInStore.mostRecentCall.args[1]).toEqual("document2");

		});
/**
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

			couchDBView.actions.addDocInStore.call(couchDBView, "document4");
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);

			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBView, listenRes);

			expect(couchDBView.alter.wasCalled).toEqual(true);
			expect(couchDBView.alter.mostRecentCall.args[0]).toEqual("splice");
			expect(couchDBView.alter.mostRecentCall.args[1]).toEqual(3);
			expect(couchDBView.alter.mostRecentCall.args[2]).toEqual(0);
			value = couchDBView.alter.mostRecentCall.args[3];

			expect(value.value.body).toEqual("do you see me?");
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
			couchDBView.actions.removeDocInStore.call(couchDBView, "document4");
			expect(couchDBView.del.wasCalled).toEqual(true);
			expect(couchDBView.del.mostRecentCall.args[0]).toEqual(3);
		});

		it("should update the reduced view", function () {
			var reqData,
				json,
				callback,
				listenRes = '{"rows":[{"key":null,"value":["50","60","80","30"]}]}',
				parsed = JSON.parse(listenRes);

			spyOn(couchDBView, "set");
			spyOn(JSON, "parse").andReturn(parsed);

			couchDBView.actions.updateReduced.call(couchDBView);
			expect(transportMock.request.wasCalled).toEqual(true);
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");

			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view");
			expect(reqData["query"]).toBe(query);

			callback = transportMock.request.mostRecentCall.args[2];
			expect(callback).toBeInstanceOf(Function);
			callback.call(couchDBView, listenRes);

			expect(JSON.parse.wasCalled).toEqual(true);
			expect(JSON.parse.mostRecentCall.args[0]).toEqual(listenRes);

			expect(couchDBView.set.wasCalled).toEqual(true);
			expect(couchDBView.set.mostRecentCall.args[0]).toEqual(0);
			expect(couchDBView.set.mostRecentCall.args[1]).toBe(parsed.rows[0]);
		});

		it("should unsync a view, ie. stop listening to changes and reset it", function () {
			var spy = jasmine.createSpy();
			couchDBView.stopListening = spy;
			couchDBView.actions.unsync.call(couchDBView);
			expect(spy.wasCalled).toEqual(true);
			expect(couchDBView.stopListening).toBeUndefined();
		});

		it("shouldn't allow for database modification (a view is readonly)", function () {
			spyOn(stateMachine, "event");
			expect(couchDBView.remove()).toEqual(false);
			expect(couchDBView.update()).toEqual(false);
			expect(stateMachine.event.wasCalled).toEqual(false);
		});
*/
	});

});
