/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
require(["CouchDBUsers", "Transport", "Promise"], function (CouchDBUsers, Transport, Promise) {

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
			spyOn(transport, "request");
		});
		
		it("should have a login function", function () {
			expect(couchDBUsers.login).toBeInstanceOf(Function);
		});
		
		it("should try to open a session", function () {
			var req;
			
			couchDBUsers.login("n4me", "p4ssword");
			
			expect(transport.request.wasCalled).toEqual(true);
			expect(transport.request.mostRecentCall.args[0]).toEqual("CouchDB");
			req = transport.request.mostRecentCall.args[1];
			
			expect(req.method).toEqual("GET");
			expect(req.path).toEqual("/_users/org.couchdb.user:n4me");
			expect(req.auth).toEqual("n4me:p4ssword");
		});
		
		it("should return a promise", function () {
			expect(couchDBUsers.login()).toBeInstanceOf(Promise);
		});
		
		it("should resolve the promise with the request's result", function () {
			var promise,
				callback;
			
			promise = couchDBUsers.login("","");
			promise.then(function (result) {
				expect(result.result).toEqual("whatever");
			});
			
			transport.request.mostRecentCall.args[2]({"result": "whatever"});
			
		});
		
		it("should reject the promise when name and passwords are not strings", function () {
			var promise;
			
			promise = couchDBUsers.login();
			
			promise.then(function () {}, function (result) {
				expect(result.error).toEqual("name & password must be strings");
			});
		});
		
		
		
	});
	
});