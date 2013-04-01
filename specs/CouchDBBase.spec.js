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
		couchDBBase = null,
		stopListening = null;

	beforeEach(function () {
		stopListening = jasmine.createSpy();
		transportMock = {
				listen: jasmine.createSpy("listen").andReturn(stopListening),
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

	});

	describe("CouchDBBase delegates its internal states to a stateMachine", function () {

		var couchDBBase = null,
			stateMachine = null;

		beforeEach(function () {
			couchDBBase = new CouchDBBase;
			stateMachine = couchDBBase.getStateMachine();
		});

		it("should embed a stateMachine", function () {
			expect(couchDBBase.getStateMachine).toBeInstanceOf(Function);
			expect(couchDBBase.getStateMachine()).toBeInstanceOf(StateMachine);
		});

		it("should have a function to set a new stateMachine", function () {
			var stateMachine = {event:function(){}};
			expect(couchDBBase.setStateMachine).toBeInstanceOf(Function);
			expect(couchDBBase.setStateMachine({})).toBe(false);
			expect(couchDBBase.setStateMachine(stateMachine)).toBe(true);
			expect(couchDBBase.getStateMachine()).toBe(stateMachine);
		});

		it("should be initialised in Unsynched state by default", function () {
			expect(stateMachine.getCurrent()).toBe("Unsynched");
		});

		it("should have a default Unsynched state", function () {
			var Unsynched = stateMachine.get("Unsynched");

			var sync = Unsynched.get("sync");
			expect(sync[0]).toBe(couchDBBase.onSync);
			expect(sync[1]).toBe(couchDBBase);
			expect(sync[2]).toBe("Synched");
		});

		it("should have a default synched state", function () {
			var Synched = stateMachine.get("Synched");

			var listen = Synched.get("listen");
			expect(listen[0]).toBe(couchDBBase.onListen);
			expect(listen[1]).toBe(couchDBBase);
			expect(listen[2]).toBe("Listening");

			var unsync = Synched.get("unsync");
			expect(unsync[0].name).toBe("NOOP");
			expect(unsync[2]).toBe("Unsynched");
		});

		it("should have a default Listening state", function () {
			var Listening = stateMachine.get("Listening");

			var unsync = Listening.get("unsync");
			expect(unsync[0]).toBe(couchDBBase.stopListening);
			expect(unsync[1]).toBe(couchDBBase);
			expect(unsync[2]).toBe("Unsynched");

			var change = Listening.get("change");
			expect(change[0]).toBe(couchDBBase.onChange);
			expect(change[1]).toBe(couchDBBase);
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
			couchDBBase.setPromise(promise);
			expect(couchDBBase.sync).toBeInstanceOf(Function);
			expect(couchDBBase.sync(syncInfo)).toBeTruthy();
			expect(couchDBBase.sync()).toBe(false);
			expect(couchDBBase.getSyncInfo()).toBe(syncInfo);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("sync");
		});

		it("should return the promise on sync", function () {
			var syncInfo = {};
			couchDBBase.setPromise(promise);
			expect(couchDBBase.sync(syncInfo)).toBe(promise);
		});

		it("should have a function for unsynchronizing the store", function () {
			expect(couchDBBase.unsync).toBeInstanceOf(Function);
			expect(couchDBBase.unsync()).toBe(fakeReturn);

			expect(stateMachine.event.wasCalled).toBe(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toBe("unsync");
		});
	});

});
