/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var Store = require("emily").Store,
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
    _promise = new Promise();

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
        var _syncInfo;

        _promise = new Promise();
        _syncInfo = this.setSyncInfo.apply(this, arguments);

        if (_syncInfo) {
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
        if (this.stopListening) {
            this.stopListening();
            delete this.stopListening;
        }
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
        _syncInfo = syncInfo;
        return _syncInfo;
    };

}

module.exports = function CouchDBBaseFactory(data) {
    CouchDBBaseConstructor.prototype = new Store(data);
    return new CouchDBBaseConstructor();
};
},{}],2:[function(require,module,exports){
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var CouchDBBase = require("./CouchDBBase");

var Tools = require("emily").Tools,
    Promise = require("emily").Promise,
    StateMachine = require("emily").StateMachine;


function CouchDBBulkDocumentsConstructor() {

    /**
     * Set the synchronization data if valid data is supplied
     * @param {String} database the database to sync with
     * @param {Object} query an object with queryparams
     * @returns {Object} syncInfo if valid, false if not
     */
    this.setSyncInfo = function setSyncInfo(database,  query) {
        if (typeof database == "string" &&
            typeof query == "object") {

            var _syncInfo = {
                "database": database,
                "query": query || {}
            };

            // Bring keys one level up
            if (Array.isArray(_syncInfo.query.keys)) {
                _syncInfo.keys = _syncInfo.query.keys;
                delete _syncInfo.query.keys;
            }

            return _syncInfo;

        } else {
            return false;
        }
    };

    /**
     * Get a bulk of documents
     * @private
     */
    this.onSync = function onSync() {

        var _syncInfo = this.getSyncInfo(),
        reqData = {
            path: "/" + _syncInfo.database + "/_all_docs",
            query: _syncInfo.query
        },
        errorString;

        // If an array of keys is defined, we POST it to _all_docs to get arbitrary docs.
        if (Array.isArray(_syncInfo.keys)) {
            reqData.method = "POST";
            reqData.data = JSON.stringify({keys:_syncInfo.keys});
            reqData.headers = {
                "Content-Type": "application/json"
            };
            errorString = reqData.data;

        // Else, we just GET the documents using startkey/endkey
        } else {
            reqData.method = "GET";
            errorString = JSON.stringify(_syncInfo.query);
        }

        _syncInfo.query.include_docs = true;

        this.getTransport().request(
            this.getHandlerName(),
            reqData,
            function (results) {

                var json = JSON.parse(results);

                if (!json.rows) {
                    throw new Error("CouchDBBulkDocuments.sync(\"" +
                        _syncInfo.database + "\", " + errorString + ") failed: " + results);
                } else {
                    this.reset(json.rows);
                    this.getStateMachine().event("listen");
                    this.getPromise().fulfill(this);
                }
            }, this);
    };

    /**
     * Subscribe to changes when synchronized with a bulk of documents
     * @private
     */
    this.onListen = function onListen() {

        var _syncInfo = this.getSyncInfo();

        Tools.mixin({
            feed: "continuous",
            heartbeat: 20000,
            descending: true,
            include_docs: true
        }, _syncInfo.query);

        this.stopListening = this.getTransport().listen(
            this.getHandlerName(),
            {
                path: "/" + _syncInfo.database + "/_changes",
                query: _syncInfo.query
            },
            function (changes) {
                var json,
                action;

                // Should I test for this very special case (heartbeat?)
                // Or do I have to try catch for any invalid json?
                if (changes == "\n") {
                    return false;
                }

                json = JSON.parse(changes);

                if (json.changes[0].rev.search("1-") === 0) {
                    action = "add";
                } else if (json.deleted) {
                    action = "remove";
                } else {
                    action = "change";
                }

                this.getStateMachine().event(action, json.id, json.doc);

            }, this);
    };

    /**
     * Add in the Store a document that was added in CouchDB
     * @private
     */
    this.onAdd = function onAdd(id) {

        var _syncInfo = this.getSyncInfo();

        if (_syncInfo.query.startkey || _syncInfo.query.endkey) {
            _syncInfo.query.include_docs = true;
            _syncInfo.query.update_seq = true;

            this.getTransport().request(
                this.getHandlerName(),
                {
                    method: "GET",
                    path: "/" + _syncInfo.database + "/_all_docs",
                    query: _syncInfo.query
                },
                function (results) {

                    var json = JSON.parse(results);

                    json.rows.forEach(function (value, idx) {
                        if (value.id == id) {
                            this.alter("splice", idx, 0, value.doc);
                        }
                    }, this);

                }, this);
        } else {
            return false;
        }
    };

    /**
     * Update in the Store a document that was updated in CouchDB
     * @private
     */
    this.onChange = function onChange(id, doc) {
        this.loop(function (value, idx) {
            if (value.id == id) {
                this.set(idx, doc);
            }
        }, this);
    };

    /**
     * Remove from the Store a document that was removed in CouchDB
     * @private
     */
    this.onRemove = function onRemove(id) {
        this.loop(function (value, idx) {
            if (value.id == id) {
                this.del(idx);
            }
        }, this);
    };

    /**
     * Update the database with bulk documents
     * @private
     */
    this.databaseUpdate = function databaseUpdate(promise) {
        var docs = [],
        _syncInfo = this.getSyncInfo();

        this.loop(function (value) {
            docs.push(value.doc);
        });

        this.getTransport().request(
            this.getHandlerName(),
            {
                method: "POST",
                path: "/" + _syncInfo.database + "/_bulk_docs",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({"docs": docs})
            },
            function (response) {
                var updates = JSON.parse(response);
                this.loop(function (doc, idx) {
                    if (updates[idx].ok) {
                        doc.doc._rev = updates[idx].rev;
                    }
                });
                promise.fulfill(updates);
            }, this);
    };

    /**
     * Upload the document to the database
     * @returns {Promise}
     */
    this.upload = function upload() {
        var promise = new Promise();
        this.getStateMachine().event("upload", promise);
        return promise;
    };

    this.setStateMachine(new StateMachine("Unsynched", {
        "Unsynched": [
            ["sync", this.onSync, this, "Synched"]
        ],

        "Synched": [
            ["listen", this.onListen, this, "Listening"],
            ["unsync", function NOOP() {}, "Unsynched"]
        ],

        "Listening": [
            ["unsync", this.onUnsync, this, "Unsynched"],
            ["change", this.onChange, this],
            ["add", this.onAdd, this],
            ["remove", this.onRemove, this],
            ["upload", this.databaseUpdate, this]
        ]
    }));

}

/**
 * @class
 * CouchDBBulkDocuments synchronizes a Store with a bulk of CouchDB documents
 */
module.exports = function CouchDBBulkDocumentsFactory(data) {
    CouchDBBulkDocumentsConstructor.prototype = new CouchDBBase(data);
    return new CouchDBBulkDocumentsConstructor();
};

},{"./CouchDBBase":1}],3:[function(require,module,exports){
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var CouchDBBase = require("./CouchDBBase");

var Promise = require("emily").Promise,
    StateMachine = require("emily").StateMachine;

function CouchDBDocumentConstructor() {

    /**
     * Set the synchronization data if valid data is supplied
     * @param {String} database the database to sync with
     * @param {String} document the document to request
     * @param {Object} [optional] query an object with queryparams
     * @returns {Object} syncInfo if valid, false if not
     */
    this.setSyncInfo = function setSyncInfo(database, doc, query) {
        if (typeof database == "string" &&
            typeof doc == "string") {

            if (!query || (typeof query == "object")) {
                return {
                    "database": database,
                    "document": doc,
                    "query": query || {}
                };
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * Get a CouchDB document
     * @private
     */
    this.onSync = function onSync() {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(
            this.getHandlerName(),
            {
                method: "GET",
                path: "/" + _syncInfo.database + "/" + _syncInfo.document,
                query: _syncInfo.query
            },
            function (results) {
                var json = JSON.parse(results);
                if (json._id) {
                    this.reset(json);
                    this.getStateMachine().event("listen");
                }
                this.getPromise().fulfill(json);
            }, this);
    };

    /**
     * Subscribe to changes when synchronized with a document
     * @private
     */
    this.onListen = function onListen() {

        var _syncInfo = this.getSyncInfo();

        this.stopListening = this.getTransport().listen(
            this.getHandlerName(),
            {
                path: "/" + _syncInfo.database + "/_changes",
                query: {
                    feed: "continuous",
                    heartbeat: 20000,
                    descending: true
                }
            },
            function (changes) {
                var json;
                // Should I test for this very special case (heartbeat?)
                // Or do I have to try catch for any invalid json?
                if (changes == "\n") {
                    return false;
                }

                json = JSON.parse(changes);

                // The document is the modified document is the current one
                if (json.id == _syncInfo.document &&
                    // And if it has a new revision
                    json.changes.pop().rev != this.get("_rev")) {

                    if (json.deleted) {
                        this.getStateMachine().event("remove");
                    } else {
                        this.getStateMachine().event("change");
                    }
                }
            }, this
            );
    };

    /**
     * Update the document when synchronized with a document.
     * @private
     */
    this.onChange = function onChange() {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(
            this.getHandlerName(),
            {
                method: "GET",
                path: "/"+_syncInfo.database+"/" + _syncInfo.document
            },
            function (doc) {
                this.reset(JSON.parse(doc));
            }, this
            );
    };

    /**
     * Delete all document's properties
     * @private
     */
    this.onRemove = function onRemove() {
        this.reset({});
    };

    /**
     * Upload the document to the database
     * @returns true if synched
     */
    this.upload = function upload() {
        var promise = new Promise(),
        _syncInfo = this.getSyncInfo();

        if (_syncInfo.document) {
            this.getStateMachine().event("upload", promise);
            return promise;
        }

        return false;
    };

    /**
     * Remove the document from the database
     * @returns true if remove called
     */
    this.remove = function remove() {
        var promise = new Promise();

        this.getStateMachine().event("removeFromDatabase", promise);
        return promise;
    };

    /**
     * Put a new document in CouchDB
     * @private
     */
    this.databaseCreate = function databaseCreate(promise) {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(
            this.getHandlerName(),
            {
                method: "PUT",
                path: "/" + _syncInfo.database + "/" + _syncInfo.document,
                headers: {
                    "Content-Type": "application/json"
                },
                data: this.toJSON()
            },
            function (result) {
                var json = JSON.parse(result);
                if (json.ok) {
                    this.set("_rev", json.rev);
                    this.set("_id", json.id);
                    this.getStateMachine().event("listen");
                    promise.fulfill(json);
                } else {
                    promise.reject(json);
                }
            }, this
            );
    };

    /**
     * Update a document in CouchDB through a PUT request
     * @private
     */
    this.databaseUpdate = function databaseUpdate(promise) {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(
            this.getHandlerName(),
            {
                method: "PUT",
                path: "/" + _syncInfo.database + "/" + _syncInfo.document,
                headers: {
                    "Content-Type": "application/json"
                },
                data: this.toJSON()
            },
            function (response) {
                var json = JSON.parse(response);
                if (json.ok) {
                    this.set("_rev", json.rev);
                    promise.fulfill(json);
                } else {
                    promise.reject(json);
                }
            },
            this);
    };

    /**
     * Remove a document from CouchDB through a DELETE request
     * @private
     */
    this.databaseRemove = function databaseRemove(promise) {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(this.getHandlerName(),
        {
            method: "DELETE",
            path: "/" + _syncInfo.database + "/" + _syncInfo.document,
            query: {
                rev: this.get("_rev")
            }
        },
        function (response) {
            var json = JSON.parse(response);
            if (json.ok) {
                promise.fulfill(json);
            } else {
                promise.reject(json);
            }
        });
    };

    this.setStateMachine(new StateMachine("Unsynched", {
        "Unsynched": [
            ["sync", this.onSync, this, "Synched"]
        ],

        "Synched": [
            ["listen", this.onListen, this, "Listening"],
            ["unsync", function NOOP() {}, "Unsynched"],
            ["upload", this.databaseCreate, this]
        ],

        "Listening": [
            ["unsync", this.onUnsync, this, "Unsynched"],
            ["change", this.onChange, this],
            ["add", this.onAdd, this],
            ["remove", this.onRemove, this],
            ["upload", this.databaseUpdate, this],
            ["removeFromDatabase", this.databaseRemove, this]
        ]

    }));
}

/**
 * @class
 * CouchDBDocument synchronizes a Store with a CouchDB document
 */
module.exports = function CouchDBDocumentFactory(data) {
    CouchDBDocumentConstructor.prototype = new CouchDBBase(data);
    return new CouchDBDocumentConstructor();
};

},{"./CouchDBBase":1}],4:[function(require,module,exports){
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

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
}

/**
 * @class
 * CouchDBSecurity synchronises a CouchDBDocument with _security document
 */
module.exports = function CouchDBSecurityFactory() {
	CouchDBSecurityConstructor.prototype = new CouchDBDocument();
	return new CouchDBSecurityConstructor();
};

},{"./CouchDBDocument":3}],"fjvByQ":[function(require,module,exports){
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

module.exports = {
	CouchDBBulkDocuments: require("./CouchDBBulkDocuments"),
	CouchDBDocument: require("./CouchDBDocument"),
	CouchDBView: require("./CouchDBView"),
	CouchDBSecurity: require("./CouchDBSecurity"),
	CouchDBUser: require("./CouchDBUser")
};
},{"./CouchDBBulkDocuments":2,"./CouchDBDocument":3,"./CouchDBSecurity":4,"./CouchDBUser":7,"./CouchDBView":8}],"CouchDBTools":[function(require,module,exports){
module.exports=require('fjvByQ');
},{}],7:[function(require,module,exports){
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var CouchDBDocument = require("./CouchDBDocument");

var Promise = require("emily").Promise;

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
        return this.sync(_userDB, _idPrefix + id);
    };

    /**
     * Gets the user profile in couchDB by using its own credentials.
     * name and password must be set prior to calling login, or the promise will be rejected.
     * If the login is successful, the promise is fulfilled with the user information like:
     * { _id: 'org.couchdb.user:couchdb',
     *  _rev: '1-8995e8ff247dae75048ab2dc800136d7',
     * name: 'couchdb',
     * password: null,
     * roles: [],
     * type: 'user' }
     *
     * @returns {Promise}
     */
    this.login = function login() {
        var promise = new Promise(),
            name = this.get("name"),
            password = this.get("password");

        if (name && typeof name == "string" && typeof password == "string") {
            this.getTransport().request("CouchDB", {
                method: "GET",
                path: "/_users/org.couchdb.user:"+name,
                auth: name + ":" + password
            },
            promise.fulfill,
            promise);
        } else {
            promise.reject({
                error: "name & password must be strings"
            });
        }

        return promise;
    };

    /**
     * Adds a user to the database
     * The following fields must be set prior to calling create:
     * name: the name of the user
     * password: its desired password, NOT encrypted
     *
     * If not specified, the following fields have default values:
     * type: "user"
     * roles: []
     *
     * The function itself will not warn you for incorrect fields
     * but the promise that is returned will fulfilled with couchdb's reply.
     * @returns {Promise}
    */
    this.create = function create() {
        var promise = new Promise();

        if (!this.get("type")) {
            this.set("type", "user");
        }

        if (!this.get("roles")) {
            this.set("roles", []);
        }

        this.load(this.get("name")).then(function () {
            promise.reject({error: "Failed to create user. The user already exists"});
        }, function () {
            this.upload().then(function (success) {
                promise.fulfill(success);
            }, function (error) {
                promise.reject(error);
            });
        }, this);

        return promise;
    };
}

/**
 * @class
 * CouchDBUser synchronises a CouchDBDocument with a CouchDB User.
 * It also provides tools to ease the creation/modification of users.
 */
module.exports = function CouchDBUserFactory() {
    CouchDBUserConstructor.prototype = new CouchDBDocument();
    return new CouchDBUserConstructor();
};
},{"./CouchDBDocument":3}],8:[function(require,module,exports){
/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var CouchDBBase = require("./CouchDBBase");

var Tools = require("emily").Tools,
    StateMachine = require("emily").StateMachine;

function CouchDBViewConstructor() {

    /**
     * Set the synchronization data if valid data is supplied
     * @param {String} database the database to sync with
     * @param {String} designDocument the design document to be used
     * @param {String} view the name of the view to request
     * @param {Object} [optional] query an object with queryparams
     * @returns {Object} syncInfo if valid, false if not
     */
    this.setSyncInfo = function setSyncInfo(database, designDocument, view, query) {
        if (typeof database == "string" &&
            typeof designDocument == "string" &&
            typeof view == "string") {

            if (!query || (typeof query == "object")) {
                return {
                    "database": database,
                    "design": designDocument,
                    "view": view,
                    "query": query || {}
                };
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * Get a CouchDB view
     * @private
     */
    this.onSync = function onSync() {
        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(this.getHandlerName(), {
            method: "GET",
            path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + _syncInfo.view,
            query: _syncInfo.query
        }, function (results) {
            var json = JSON.parse(results);
            if (!json.rows) {
                throw new Error("CouchDBStore [" + _syncInfo.database +
                 ", " + _syncInfo.design + ", " + _syncInfo.view + "].sync() failed: " + results);
            } else {
                this.reset(json.rows);
                if (typeof json.total_rows == "undefined") {
                    _syncInfo.reducedView = true;
                }

                this.getStateMachine().event("listen");
                this.getPromise().fulfill(json);
            }
        }, this);
    };

    /**
     * Subscribe to changes when synchronized with a view
     * @private
     */
    this.onListen = function onListen() {

        var _syncInfo = this.getSyncInfo();

        Tools.mixin({
            feed: "continuous",
            heartbeat: 20000,
            descending: true
        }, _syncInfo.query);

        this.stopListening = this.getTransport().listen(
            this.getHandlerName(), {
                path: "/" + _syncInfo.database + "/_changes",
                query: _syncInfo.query
            },
            function (changes) {
                // Should I test for this very special case (heartbeat?)
                // Or do I have to try catch for any invalid json?
                if (changes == "\n") {
                    return false;
                }

                var json = JSON.parse(changes),
                    action;

                // reducedView is known on the first get view
                if (_syncInfo.reducedView) {
                    action = "updateReduced";
                } else {
                    if (json.deleted) {
                        action = "remove";
                    } else if (json.changes && json.changes[0].rev.search("1-") === 0) {
                        action = "add";
                    } else {
                        action = "change";
                    }
                }

                this.getStateMachine().event(action, json.id);
            }, this);
    };

    /**
     * Update in the Store a document that was updated in CouchDB
     * Get the whole view :(, then get the modified document and update it.
     * I have no choice but to request the whole view and look for the document
     * so I can also retrieve its position in the store (idx) and update the item.
     * Maybe I've missed something
     * @private
     */
    this.onChange = function onChange(id) {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(
            this.getHandlerName(),{
                method: "GET",
                path: "/" + _syncInfo.database + "/_design/" +
                _syncInfo.design + "/" + _syncInfo.view,
                query: _syncInfo.query
            }, function (view) {
                var json = JSON.parse(view);

                if (json.rows.length == this.getNbItems()) {
                    json.rows.some(function (value, idx) {
                        if (value.id == id) {
                            this.set(idx, value);
                        }
                    }, this);
                } else {
                    this.evenDocsInStore.call(this, json.rows, id);
                }
            }, this);
    };

    /**
     * When a doc is removed from the view even though it still exists
     * or when it's added to a view, though it wasn't just created
     * This function must be called to even the store
     * @private
     */
    this.evenDocsInStore = function evenDocsInStore(view, id) {
        var nbItems = this.getNbItems();

        // If a document was removed from the view
        if (view.length < nbItems) {
            // Look for it in the store to remove it
            this.loop(function (value, idx) {
                if (value.id == id) {
                    this.del(idx);
                }
            }, this);

        // If a document was added to the view
        } else if (view.length > nbItems) {
            // Look for it in the view and add it to the store at the same place
            view.some(function (value, idx) {
                if (value.id == id) {
                    return this.alter("splice", idx, 0, value);
                }
            }, this);
        }

    };

    /**
    * Add in the Store a document that was added in CouchDB
    * @private
    */
    this.onAdd = function onAdd(id) {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(
            this.getHandlerName(), {
                method: "GET",
                path: "/" + _syncInfo.database + "/_design/" +
                _syncInfo.design + "/" + _syncInfo.view,
                query: _syncInfo.query
            }, function (view) {
                var json = JSON.parse(view);

                json.rows.some(function (value, idx) {
                    if (value.id == id) {
                        this.alter("splice", idx, 0, value);
                    }
                }, this);
            }, this);
    };

    /**
     * Remove from the Store a document that was removed in CouchDB
     * @private
     */
    this.onRemove = function onRemove(id) {
        this.loop(function (value, idx) {
            if (value.id == id) {
                this.del(idx);
            }
        }, this);
    };

    /**
     * Update a reduced view (it has one row with no id)
     * @private
     */
    this.updateReduced = function updateReduced() {

        var _syncInfo = this.getSyncInfo();

        this.getTransport().request(
            this.getHandlerName(),{
                method: "GET",
                path: "/" + _syncInfo.database + "/_design/" +
                _syncInfo.design + "/" + _syncInfo.view,
                query: _syncInfo.query
            }, function (view) {
                var json = JSON.parse(view);

                this.set(0, json.rows[0]);
            }, this);
    };

    this.setStateMachine(new StateMachine("Unsynched", {

        "Unsynched": [
            ["sync", this.onSync, this, "Synched"]
        ],

        "Synched": [
            ["listen", this.onListen, this, "Listening"],
            ["unsync", function NOOP() {}, "Unsynched"]
        ],

        "Listening": [
            ["unsync", this.onUnsync, this, "Unsynched"],
            ["change", this.onChange, this],
            ["add", this.onAdd, this],
            ["remove", this.onRemove, this],
            ["updateReduced", this.updateReduced, this]
        ]

    }));

}

module.exports = function CouchDBViewFactory(data) {
    CouchDBViewConstructor.prototype = new CouchDBBase(data);
    return new CouchDBViewConstructor();
};
},{"./CouchDBBase":1}],9:[function(require,module,exports){

},{}]},{},[])