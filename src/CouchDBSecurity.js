/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var CouchDBDocument = require("./CouchDBDocument");

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

/**
 * @class
 * CouchDBSecurity synchronises a CouchDBDocument with _security document
 */
module.exports = function CouchDBSecurityFactory() {
	CouchDBSecurityConstructor.prototype = new CouchDBDocument;
	return new CouchDBSecurityConstructor;
};
