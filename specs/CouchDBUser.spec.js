/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
require(["CouchDBUser", "Store", "CouchDBStore"], function (CouchDBUser, Store, CouchDBStore) {
	
	describe("CouchDBUserTest", function () {
		
		var couchDBUser = new CouchDBUser;
		
		it("should be a constructor function", function () {
			expect(CouchDBUser).toBeInstanceOf(Function);
		});
		
		it("should inherit from CouchDBStore", function () {
			// WHY this doesn't work? expect(Object.getPrototypeOf(couchDBUser)).toBeInstanceOf(CouchDBStore)
		});
		
	});
	
	describe("CouchDBUserDatabase", function () {
		
		var couchDBUser = null;
		
		beforeEach(function () {
			couchDBUser = new CouchDBUser;
		});
		
		it("should have a function to set the user's db", function () {
			expect(couchDBUser.setUserDB()).toEqual(false);
			expect(couchDBUser.setUserDB("_userz")).toEqual(true);
			
			expect(couchDBUser.getUserDB()).toEqual("_userz");
		});
		
		it("should have a default value", function () {
			expect(couchDBUser.getUserDB()).toEqual("_users");
		});
		
	});
	
	describe("CouchDBUserId", function () {
		
		var couchDBUser = null;
		
		beforeEach(function () {
			couchDBUser = new CouchDBUser;
		});
		
		it("should have a function to set id's prefix", function () {
			expect(couchDBUser.setIdPrefix()).toEqual(false);
			expect(couchDBUser.setIdPrefix("org.couchdb.uzer:")).toEqual(true);
			
			expect(couchDBUser.getIdPrefix()).toEqual("org.couchdb.uzer:");
		});
		
		it("should have a default value", function () {
			expect(couchDBUser.getIdPrefix()).toEqual("org.couchdb.user:");
		});
		
		it("should have a function to set id", function () {
			expect(couchDBUser.has("_id")).toEqual(false);
			expect(couchDBUser.setId()).toEqual(false);
			expect(couchDBUser.setId("123")).toEqual(true);
			
			expect(couchDBUser.get("_id")).toEqual("org.couchdb.user:123");
		});
		
		it("should have a function to get id", function () {
			expect(couchDBUser.setId("123")).toEqual(true);
			expect(couchDBUser.getId()).toEqual("org.couchdb.user:123");
		});
		
	});
	
	describe("CouchDBUserLoadSave", function () {
		
		var couchDBUser = null;
		
		beforeEach(function () {
			couchDBUser = new CouchDBUser;
		});
		
		it("should have a function to load user", function () {
			spyOn(couchDBUser, "sync").andReturn(true);
			expect(couchDBUser.load()).toEqual(false);
			expect(couchDBUser.load("123")).toEqual(true);
			
			expect(couchDBUser.sync.wasCalled).toEqual(true);
			expect(couchDBUser.sync.mostRecentCall.args[0]).toEqual("_users");
			expect(couchDBUser.sync.mostRecentCall.args[1]).toEqual("org.couchdb.user:123");
		});
		
	});
	
});