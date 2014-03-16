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