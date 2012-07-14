/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
require(["CouchDBUsers"], function (CouchDBUsers) {

	describe("CouchDBUsersTest", function () {
		
		it("should be a constructor function", function () {
			expect(CouchDBUsers).toBeInstanceOf(Function);
			expect(CouchDBUsers.name).toEqual("CouchDBUsersConstructor");
		});
		
	});
	
	
});