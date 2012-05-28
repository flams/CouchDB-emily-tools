/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
require(["CouchDBSecurity", "CouchDBStore"], function (CouchDBSecurity, CouchDBStore) {
	
describe("CouchDBSecurityTest", function () {
		
		var couchDBSecurity = new CouchDBSecurity;
		
		it("should be a constructor function", function () {
			expect(CouchDBSecurity).toBeInstanceOf(Function);
		});
		
		it("should inherit from CouchDBStore", function () {
			//expect(Object.getPrototypeOf(couchDBSecurity)).toBeInstanceOf(CouchDBStore)
		});
		
	});
	
});