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
 * It also provides tools to manipulate them.
 */
function CouchDBSecurity(CouchDBStore) {
	
	/**
	 * Defines CouchDBSecurity
	 * @returns {CouchDBSecurityConstructor}
	 */
	function CouchDBSecurityConstructor() {
		
		
		
	};
	
	return function CouchDBSecurityFactory() {
		CouchDBSecurityConstructor.prototype = new CouchDBStore;
		return new CouchDBSecurityConstructor;
	};
	
	
	
});