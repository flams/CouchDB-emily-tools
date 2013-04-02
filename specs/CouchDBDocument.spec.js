/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["CouchDBBase", "CouchDBDocument", "Store", "Promise"],

function (CouchDBBase, CouchDBDocument, Store, Promise) {

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

});
