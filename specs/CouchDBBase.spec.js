/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

/**
 * CouchDBBase is an abstract class for CouchDBView, BulkView, Document, BulkDocument
 */
require(["CouchDBBase", "Store", "Promise", "StateMachine"],

function (CouchDBBase, Store, Promise, StateMachine) {

	var transportMock = null,
		couchDBBase = null;

	beforeEach(function () {
		transportMock = {
				listen: jasmine.createSpy("listen"),
				request: jasmine.createSpy("request")
			};
		couchDBBase = new CouchDBBase;
	});

	describe("CouchDBBase is a subtype of an Emily Store", function () {

		var couchDBBase = new CouchDBBase;

		it("should be a constructor function", function () {
			expect(CouchDBBase).toBeInstanceOf(Function);
		});

		it("should inherit from Store", function () {
			expect(Object.getPrototypeOf(couchDBBase)).toBeInstanceOf(Store);
		});

		it("should init the store with values", function () {
			couchDBBase = new CouchDBBase({
				"key": "value"
			});
			expect(couchDBBase.get("key")).toBe("value");
		});
	});

	describe("CouchDBBase can be configured", function () {

		var couchDBBase = null;

		beforeEach(function () {
			couchDBBase = new CouchDBBase;
		});

		it("should have a function for setting the name of CouchDB's handler", function () {
			expect(couchDBBase.setHandlerName).toBeInstanceOf(Function);
			expect(couchDBBase.setHandlerName("CouchDB")).toBe(true);
			expect(couchDBBase.setHandlerName({})).toBe(false);
			expect(couchDBBase.getHandlerName()).toBe("CouchDB");
		});

		it("should have a default handler name", function () {
			expect(couchDBBase.getHandlerName()).toBe("CouchDB");
		});

		it("should have a function for setting the transport", function () {
			expect(couchDBBase.getTransport()).toBe(null);
			expect(couchDBBase.setTransport()).toBe(false);
			expect(couchDBBase.setTransport({})).toBe(false);
			expect(couchDBBase.setTransport(transportMock)).toBe(true);
			expect(couchDBBase.getTransport()).toBe(transportMock);
		});

		it("should have a function to set a new stateMachine", function () {
			var stateMachine = {event:function(){}};
			expect(couchDBBase.setStateMachine).toBeInstanceOf(Function);
			expect(couchDBBase.setStateMachine({})).toBe(false);
			expect(couchDBBase.setStateMachine(stateMachine)).toBe(true);
			expect(couchDBBase.getStateMachine()).toBe(stateMachine);
		});

	});

	describe("CouchDBBase has a common set of methods", function () {
		var couchDBBase = null,
			stateMachine = null,
			fakeReturn = {},
			promise = {
				fulfill: function () {},
				reject: function () {},
				then: function () {}
			};

		beforeEach(function () {
			couchDBBase = new CouchDBBase;
			stateMachine = {
				event: jasmine.createSpy().andReturn(fakeReturn)
			};
			couchDBBase.setStateMachine(stateMachine);
		});

		it("should have a function for setting the promise to be returned on sync", function () {
			expect(couchDBBase.setPromise).toBeInstanceOf(Function);
			expect(couchDBBase.setPromise()).toBe(false);
			expect(couchDBBase.setPromise(promise)).toBe(true);
			expect(couchDBBase.getPromise()).toBe(promise);
		});

		it("should have a function for synchronizing the store with CouchDB", function () {
			var syncInfo = {};
			expect(couchDBBase.sync).toBeInstanceOf(Function);
			expect(couchDBBase.sync()).toBe(false);
			expect(couchDBBase.sync(syncInfo)).toBeTruthy();
			expect(couchDBBase.getSyncInfo()).toBe(syncInfo);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("sync");
		});

		it("should return the promise on sync", function () {
			promise = couchDBBase.sync({});
			expect(promise).toBe(couchDBBase.getPromise());
		});

		it("should have a function for validating and setting the sync info that can be overriden", function () {
			expect(couchDBBase.setSyncInfo).toBeInstanceOf(Function);
			spyOn(couchDBBase, "setSyncInfo");

			var syncInfo = {};

			couchDBBase.sync(syncInfo);

			expect(couchDBBase.setSyncInfo.wasCalled).toBe(true);
			expect(couchDBBase.setSyncInfo.mostRecentCall.args[0]).toBe(syncInfo);

			var spySetInfo = jasmine.createSpy();

			couchDBBase.setSyncInfo = spySetInfo;

			couchDBBase.sync(syncInfo);

			expect(spySetInfo.wasCalled).toBe(true);
			expect(spySetInfo.mostRecentCall.args[0]).toBe(syncInfo);
		});

		it("should unsync a store, ie. stop listening to changes and reset it", function () {
			var spy = jasmine.createSpy();
			couchDBBase.stopListening = spy;
			couchDBBase.onUnsync();
			expect(spy.wasCalled).toEqual(true);
			expect(couchDBBase.stopListening).toBeUndefined();
		});

		it("should have an unsync method", function () {
			couchDBBase.unsync();
			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("unsync");
		});

		it("shouldn't prevent from unsyncing if stopListening is not defined", function() {
			expect(function () {
				couchDBBase.unsync();
			}).not.toThrow();
		});
	});

});
