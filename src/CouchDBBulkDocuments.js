/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

define("CouchDBBulkDocuments",

["Store", "CouchDBBase", "Tools", "Promise"],

/**
 * @class
 * CouchDBBulkDocuments synchronizes a Store with a bulk of CouchDB documents
 */
function CouchDBBulkDocuments(Store, CouchDBBase, Tools, Promise) {

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
				if (Array.isArray(_syncInfo["query"].keys)) {
					_syncInfo["keys"] = _syncInfo["query"].keys;
					delete _syncInfo["query"].keys;
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
			if (Array.isArray(_syncInfo["keys"])) {
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
						throw new Error("CouchDBBulkDocuments.sync(\"" + _syncInfo.database + "\", " + errorString + ") failed: " + results);
					} else {
						this.reset(json.rows);
						this.getPromise().fulfill(this);
						this.getStateMachine().event("listen");
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
					var json;
					// Should I test for this very special case (heartbeat?)
					// Or do I have to try catch for any invalid json?
					if (changes == "\n") {
						return false;
					}

					var json = JSON.parse(changes),
						action;

					if (json.changes[0].rev.search("1-") == 0) {
						action = "bulkAdd";
					} else if (json.deleted) {
						action = "delete";
					} else {
						action = "bulkChange";
					}

					this.getStateMachine().event(action, json.id, json.doc);

				}, this);
		};

	}

	return function CouchDBBulkDocumentsFactory(data) {
		CouchDBBulkDocumentsConstructor.prototype = new CouchDBBase(data);
		return new CouchDBBulkDocumentsConstructor;
	};

});
