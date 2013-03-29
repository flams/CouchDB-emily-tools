/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

define("CouchDBBase",

["Store", "StateMachine", "Tools"],

/**
 * @class
 * CouchDBBase is a subtype of an Emily Store
 * and is an abstract class for CouchDBViews, BulkViews, Documents, BulkDocuments
 */
function CouchDBBase(Store, StateMachine, Tools) {

	/**
	 * Duck typing.
	 * @private
	 */
	function _isStateMachine(stateMachine) {
		if (typeof stateMachine == "object" &&
			typeof stateMachine.event == "function" ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Double duck typing
	 * @private
	 */
	function _isTransport(transport) {
		if (typeof transport == "object" &&
			typeof transport.request == "function" &&
			typeof transport.listen == "function") {
			return true;
		} else {
			return false;
		}
	}

	function CouchDBBaseConstructor() {

		/**
		 * It has a default state Machine
		 * @private
		 */
		var _stateMachine = new StateMachine,

		/**
		 * The default handler name
		 * @private
		 */
		_handlerName = "CouchDB",

		/**
		 * The transport to use to issue the requests
		 * @private
		 */
		_transport = null,

		/**
		 * The current synchronization informations
		 * @private
		 */
		_syncInfo;

		/**
		 * Get the current state machine
		 * @returns {StateMachine} the current state machine
		 */
		this.getStateMachine = function getStateMachine() {
			return _stateMachine;
		};

		/**
		 * Set the state machine
		 * @param {StateMachine} stateMachine the state machine to set
		 * @returns {Boolean} true if it's an accepted state Machine
		 */
		this.setStateMachine = function setStateMachine(stateMachine) {
			if (_isStateMachine(stateMachine)) {
				_stateMachine = stateMachine;
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Get the current transport
		 * @returns {Transport} the current transport
		 */
		this.getTransport = function getTransport() {
			return _transport;
		};

		/**
		 * Set the current transport
		 * @param {Transport} transport the transport to use
		 * @returns {Boolean} true if its an accepted transport
		 */
		this.setTransport = function setTransport(transport) {
			if (_isTransport(transport)) {
				_transport = transport;
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Get the current CouchDB handler name
		 * @returns {String} the current handler name
		 */
		this.getHandlerName = function getHandlerName() {
			return _handlerName;
		};

		/**
		 * Set the current CouchDB handler name
		 * @param {String} handlerName the name of the handler
		 * The name must be a string that matches with the handler
		 * as it's been added in Emily/Olives handlers
		 * @returns {Boolean} true if it's a string
		 */
		this.setHandlerName = function setHandlerName(handlerName) {
			if (typeof handlerName == "string") {
				_handlerName = handlerName;
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Synchronize the store with CouchDB
		 * depending on the provided sync info
		 * @param {Object} a configuration object
		 * @returns {Boolean} false if no configuration object given
		 */
		this.sync = function sync(syncInfo) {
			if (typeof syncInfo == "object") {
				_syncInfo = syncInfo;
				_stateMachine.event("sync");
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Unsync the store
		 * @returns {Boolean} true if unsynched
		 */
		this.unsync = function unsync() {
			return _stateMachine.event("unsync");
		};

		/**
		 * Returns the current synchronization info
		 * For debugging purpose
		 * @private
		 */
		this.getSyncInfo = function getSyncInfo() {
			return _syncInfo;
		};

	}

	return function CouchDBSBaseFactory(data) {
		CouchDBBaseConstructor.prototype = new Store(data);
		return new CouchDBBaseConstructor;
	};

});
