/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
require(["CouchDBUsers", "Transport"], function (CouchDBUsers, Transport) {

	describe("CouchDBUsersTest", function () {
		
		it("should be a constructor function", function () {
			expect(CouchDBUsers).toBeInstanceOf(Function);
			expect(CouchDBUsers.name).toEqual("CouchDBUsersConstructor");
		});
		
	});
	
	describe("CouchDBUsersTransport", function () {
		
		var couchDBUsers = null;
		
		beforeEach(function () {
			couchDBUsers = new CouchDBUsers;
		});
		
		it("should have a function to get/setTransport", function () {
			expect(couchDBUsers.setTransport).toBeInstanceOf(Function);
			expect(couchDBUsers.getTransport).toBeInstanceOf(Function);
		});
		
		it("should only save instances of Emily's Transport", function () {
			var transport = new Transport;
			
			expect(couchDBUsers.setTransport({})).toEqual(false);
			expect(couchDBUsers.getTransport()).toEqual(null);
			expect(couchDBUsers.setTransport(transport)).toEqual(true);
			expect(couchDBUsers.getTransport()).toBe(transport);
		});
		
	});
	
	describe("CouchDBUsersLogin", function () {
		
		var couchDBUsers = null,
			transport = null;
		
		beforeEach(function () {
			couchDBUsers = new CouchDBUsers;
			transport = new Transport;
			couchDBUsers.setTransport(transport);
		});
		
		it("should have a login function", function () {
			expect(couchDBUsers.login).toBeInstanceOf(Function);
		});
		
		it("should open a session", function () {
			var req;
			
			spyOn(transport, "request");
			couchDBUsers.login("n4me", "p4ssword");
			
			expect(transport.request.wasCalled).toEqual(true);
			expect(transport.request.mostRecentCall.args[0]).toEqual("CouchDB");
			req = transport.request.mostRecentCall.args[1];
			
			expect(req.method).toEqual("POST");
			expect(req.path).toEqual("/_session");
			expect(req["Content-Type"]).toEqual("application/x-www-form-urlencoded");
			expect(req.data).toEqual("name=n4me&password=p4ssword");
			
			
		});
	});
	
});