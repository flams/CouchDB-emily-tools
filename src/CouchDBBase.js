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
	 * Duck typing
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

	function CouchDBBaseConstructor() {

		/**
		 * It has a default state Machine
		 * @private
		 */
		var _stateMachine = new StateMachine;

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
		 */
		this.setStateMachine = function setStateMachine(stateMachine) {
			if (_isStateMachine(stateMachine)) {
				_stateMachine = stateMachine;
				return true;
			} else {
				return false;
			}
		};

	}

	return function CouchDBSBaseFactory(data) {
		CouchDBBaseConstructor.prototype = new Store(data);
		return new CouchDBBaseConstructor;
	};

});
