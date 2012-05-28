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