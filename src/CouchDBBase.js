/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var Store = require("emily").Store,
    Tools = require("emily").Tools,
    Promise = require("emily").Promise;

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

/**
 * Triple duck typing
 * @private
 */
function _isPromise(promise) {
    if (typeof promise == "object" &&
        typeof promise.fulfill == "function" &&
        typeof promise.reject == "function" &&
        typeof promise.then == "function") {
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
    var _stateMachine = null,

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
    _syncInfo,

    /**
     * A promise returned and resolved when the store is synched
     * @private
     */
    _promise = new Promise;

    /**
     * Set the promise to be resolved when the store is synched
     * @return {Boolean} true if it's a promise
     */
    this.setPromise = function setPromise(promise) {
        if (_isPromise(promise)) {
            _promise = promise;
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get the promise to be resolved when the store is synched
     * @return {Promise} the promise
     */
    this.getPromise = function getPromise() {
        return _promise;
    };

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
    this.sync = function sync() {

        _promise = new Promise;

        if (_syncInfo = this.setSyncInfo.apply(this, arguments)) {
            _stateMachine.event("sync");
            return _promise;
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

    /**
     * This function will be called when the Store needs to be synchronized
     * It's to be overriden in the sub Store
     */
    this.onSync = function onSync() {

    };

    /**
     * This function will be called when the Store needs to subscribe to changes
     * It's to be overriden in the sub Store
     */
    this.onListen = function onListen() {

    };

    /**
     * This function will be called when the Store is unsynched
     */
    this.onUnsync = function onUnsync() {
        this.stopListening && this.stopListening();
        delete this.stopListening;
    };

    this.unsync = function unsync() {
        _stateMachine.event("unsync");
    };

    /**
     * This function will be called when the Store needs to be subscribe to changes
     * It's to be overriden in the sub Store
     */
    this.onChange = function onChange() {

    };

    /**
     * This function will be called when the Store needs to add something
     * It's to be overriden in the sub Store
     */
    this.onAdd = function onAdd() {

    };

    /**
     * This function will be called when the Store needs to remove something
     * It's to be overriden in the sub Store
     */
    this.onRemove = function onRemove() {

    };

    /**
     * This function must be overriden to validate the synchronization
     * information, and set the syncInfo object.
     * By default it only assigns the first arguments to syncInfo
     * @params {*} arguments all the arguments
     * @returns {Boolean} true
     */
    this.setSyncInfo = function setSyncInfo(syncInfo) {
        return _syncInfo = syncInfo;
    };

}

module.exports = function CouchDBBaseFactory(data) {
    CouchDBBaseConstructor.prototype = new Store(data);
    return new CouchDBBaseConstructor;
};