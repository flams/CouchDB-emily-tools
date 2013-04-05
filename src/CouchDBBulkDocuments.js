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

				if (!query || (typeof query == "object")) {
					return {
						"database": database,
						"query": query || {}
					};
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

	}

	return function CouchDBBulkDocumentsFactory(data) {
		CouchDBBulkDocumentsConstructor.prototype = new CouchDBBase(data);
		return new CouchDBBulkDocumentsConstructor;
	};

});
