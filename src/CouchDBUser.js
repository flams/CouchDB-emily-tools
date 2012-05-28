define("CouchDBUser", ["CouchDBStore"], function (CouchDBStore) {
	
	function CouchDBUserConstructor() {
		
		var _userDB = "_users",
			_idPrefix = "org.couchdb.user:";
		
		this.getUserDB = function getUserDB() {
			return _userDB;
		};
		
		this.setUserDB = function setUserDB(name) {
			if (name) {
				_userDB = name;
				return true;
			} else {
				return false;
			}
		};
		
		this.getIdPrefix = function getIdPrefix() {
			return _idPrefix;
		};
		
		this.setIdPrefix = function setIdPrefix(name) {
			if (name) {
				_idPrefix = name;
				return true;
			} else {
				return false;
			}
		};
		
	};
	
	return function CouchDBUserFactory() {
		CouchDBUserConstructor.prototype = new CouchDBStore;
		return new CouchDBUserConstructor;
	};
	
	
	
});