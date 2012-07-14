/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */
define("CouchDBUsers", 
		
["Transport"],

/**
 * @class
 * CouchDBUser synchronises a CouchDBStore with a CouchDB User.
 * It also provides tools to ease the creation/modification of users.
 */
function CouchDBUsers(EmilyTransport) {
	
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
			
			_transport.request("CouchDB", {});
			
		};
		
	};
	
});