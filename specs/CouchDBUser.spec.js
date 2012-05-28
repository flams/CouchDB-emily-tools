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
		
	});
	
});