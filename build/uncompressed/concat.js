/**
 * @license https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
define("CouchDBSecurity", 
		
["CouchDBStore"], 

/**
 * @class
 * CouchDBSecurity synchronises a CouchDBStore with _security document
 */
function CouchDBSecurity(CouchDBStore) {
	
	/**
	 * Defines CouchDBSecurity
	 * @returns {CouchDBSecurityConstructor}
	 */
	function CouchDBSecurityConstructor() {
		
		/**
		 * the name of the _security document
		 * @private
		 */
		var _name = "_security";
		
		/**
		 * Set the name of the _security document
		 * @param {String} name the name of the docuyment
		 * @returns {Boolean} true if name is truthy
		 */
		this.setName = function setName(name) {
			if (name){
				_name = name;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the name of the _Security document
		 * @returns {String}
		 */
		this.getName = function getName() {
			return _name;
		};
		
		/**
		 * Load the security document
		 * @param {String} db the name of the database
		 */
		this.load = function load(db) {
			return this.sync(db, _name);
		};
		
		
	};
	
	return function CouchDBSecurityFactory() {
		CouchDBSecurityConstructor.prototype = new CouchDBStore;
		return new CouchDBSecurityConstructor;
	};
	
	
	
});/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
define("CouchDBUser", 
		
["CouchDBStore"], 

/**
 * @class
 * CouchDBUser synchronises a CouchDBStore with a CouchDB User.
 * It also provides tools to ease the creation/modification of users.
 */
function CouchDBUser(CouchDBStore) {
	
	/**
	 * Defines CouchDBUser
	 * @returns {CouchDBUserConstructor}
	 */
	function CouchDBUserConstructor() {
		
		/**
		 * the name of the table in which users are saved
		 * @private
		 */
		var _userDB = "_users",
		
		/**
		 * the string which prefixes a user's id 
		 * @private
		 */
		_idPrefix = "org.couchdb.user:";
		
		/**
		 * Get the name of the users' db
		 * @returns {String}
		 */
		this.getUserDB = function getUserDB() {
			return _userDB;
		};
		
		/**
		 * Set the name of the users' db
		 * @param {String} name of the db
		 * @returns {Boolean} true if name truthy
		 */
		this.setUserDB = function setUserDB(name) {
			if (name) {
				_userDB = name;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the string that prefixes the users' id
		 * @returns {String}
		 */
		this.getIdPrefix = function getIdPrefix() {
			return _idPrefix;
		};
		
		/**
		 * Set the string that prefixes the users' id
		 * @param {String} name string that prefixes the users' id
		 * @returns {Boolean} true if name truthy
		 */
		this.setIdPrefix = function setIdPrefix(name) {
			if (name) {
				_idPrefix = name;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Set user's id
		 * @param {String} id
		 * @returns {Boolean} true if id truthy
		 */
		this.setId = function setId(id) {
			if (id) {
				this.set("_id", _idPrefix + id);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the user's id
		 * @returns {String} the user's id
		 */
		this.getId = function getId() {
			return this.get("_id");
		};
		
		/**
		 * Load a user given it's id
		 * @param {String} id of the user (without prefix)
		 * @returns {Boolean} true if sync succeeded
		 */
		this.load = function load(id) {
			if (id) {
				return this.sync(_userDB, _idPrefix + id);
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