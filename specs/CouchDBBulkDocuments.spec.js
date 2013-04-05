/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["CouchDBBase", "CouchDBBulkDocuments", "Store", "Promise"],

function (CouchDBBase, CouchDBBulkDocuments, Store, Promise) {

	var transportMock = null,
		stopListening = null;

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
				promise = couchDBBulkDocuments.sync("db");

			expect(promise).toBeInstanceOf(Promise);
		});

	});

	describe("CouchDBBulkDocuments can be synchronized with a bulk of CouchDB documents", function () {


	});

});
