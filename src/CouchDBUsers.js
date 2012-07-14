/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
define("CouchDBUsers", 
		
["Transport", "Promise"],

/**
 * @class
 * CouchDBUser synchronises a CouchDBStore with a CouchDB User.
 * It also provides tools to ease the creation/modification of users.
 */
function CouchDBUsers(EmilyTransport, Promise) {
	
	return function CouchDBUsersConstructor() {
		
		var _transport = null;
		
		this.setTransport = function setTransport(transport) {
			if (transport instanceof EmilyTransport) {
				_transport = transport;
				return true;
			} else {
				return false;
			}
		};
		
		this.getTransport = function getTransport() {
			return _transport;
		};
		
		this.login = function login(name, password) {
			
			var promise = new Promise;
			
			if (typeof name == "string" && typeof password == "string") {
				_transport.request("CouchDB", {
					method: "POST",
					path: "/_session",
					"Content-Type": "application/x-www-form-urlencoded",
					data: "name=" + name + "&password=" + password
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