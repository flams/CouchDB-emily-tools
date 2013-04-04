/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

define("CouchDBDocument",

["Store", "CouchDBBase", "Tools"],

/**
 * @class
 * CouchDBDocument synchronizes a Store with a CouchDB document
 */
function CouchDBDocument(Store, CouchDBBase, Tools) {

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
						this.getPromise().fulfill(this);
						this.getStateMachine().event("onListen");
					} else {
						this.getPromise().reject(results);
					}
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
				}, this);
		};

	}

	return function CouchDBDocumentFactory(data) {
		CouchDBDocumentConstructor.prototype = new CouchDBBase(data);
		return new CouchDBDocumentConstructor;
	};

});
