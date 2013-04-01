/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["CouchDBBase", "CouchDBView", "Store"],

function (CouchDBBase, CouchDBView, Store) {

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

	});

});
