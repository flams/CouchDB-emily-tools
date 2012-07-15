/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
define("CouchDBUsers", 
		
["Promise"],

/**
 * @class
 * CouchDBUsers is a library with utility tools to manage users.
 * It helps with the creation of users and login
 */
function CouchDBUsers(Promise) {
	
	return function CouchDBUsersConstructor() {
		
		var _transport = null;
		
		/**
		 * Set the transport to be used, must be an Emily Transport
		 * @param transport
		 * @returns true if Transport is from Emily
		 */
		this.setTransport = function setTransport(transport) {
			if (transport instanceof Object) {
				_transport = transport;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the currently set transport
		 * For debugging only
		 * @private
		 * @returns {Transport}
		 */
		this.getTransport = function getTransport() {
			return _transport;
		};
		
		/**
		 * User login. It fetches the user document
		 * the corresponds to the given name.
		 * It will only work if the credentials are correct.
		 * @param {String} name the name of the user
		 * @param {String} password the password of the user
		 * @returns {Promise}
		 */
		this.login = function login(name, password) {
			
			var promise = new Promise;
			
			if (typeof name == "string" && typeof password == "string") {
				_transport.request("CouchDB", {
					method: "GET",
					path: "/_users/org.couchdb.user:"+name,
					auth: name + ":" + password
				}, 
				promise.resolve,
				promise);
			} else {
				promise.reject({
					error: "name & password must be strings"
				});
			}
			
			return promise;
			
		};
		
		
		
	};
	
});