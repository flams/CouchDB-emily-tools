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

	}

	return function CouchDBBulkDocumentsFactory(data) {
		CouchDBBulkDocumentsConstructor.prototype = new CouchDBBase(data);
		return new CouchDBBulkDocumentsConstructor;
	};

});
