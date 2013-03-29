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

	function CouchDBBaseConstructor() {

	}

	return function CouchDBSBaseFactory(data) {
		CouchDBBaseConstructor.prototype = new Store(data);
		return new CouchDBBaseConstructor;
	};

});
