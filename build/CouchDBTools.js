/*
 https://github.com/flams/CouchDB-emily-tools
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBUser",["CouchDBStore"],function(e){function d(){var c="_users",b="org.couchdb.user:";this.getUserDB=function(){return c};this.setUserDB=function(a){return a?(c=a,true):false};this.getIdPrefix=function(){return b};this.setIdPrefix=function(a){return a?(b=a,true):false};this.setId=function(a){return a?(this.set("_id",b+a),true):false};this.getId=function(){return this.get("_id")};this.load=function(a){return a?this.sync(c,b+a):false}}return function(){d.prototype=new e;return new d}});
