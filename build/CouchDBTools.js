/*
 https://github.com/flams/CouchDB-emily-tools
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBUser",["CouchDBStore"],function(d){function a(){var a="_users",b="org.couchdb.user:";this.getUserDB=function(){return a};this.setUserDB=function(c){return c?(a=c,true):false};this.getIdPrefix=function(){return b};this.setIdPrefix=function(a){return a?(b=a,true):false}}return function(){a.prototype=new d;return new a}});
