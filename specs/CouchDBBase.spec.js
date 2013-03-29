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

	});


});
