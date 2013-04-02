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

});
