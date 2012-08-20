/*
 https://github.com/flams/CouchDB-emily-tools
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBSecurity",["CouchDBStore"],function(e){function d(){var a="_security";this.setName=function(c){return c?(a=c,true):false};this.getName=function(){return a};this.load=function(c){return this.sync(c,a)}}return function(){d.prototype=new e;return new d}});
define("CouchDBUser",["CouchDBStore","Promise"],function(e,d){function a(){var c="_users",a="org.couchdb.user:";this.getUserDB=function(){return c};this.setUserDB=function(b){return b?(c=b,true):false};this.getIdPrefix=function(){return a};this.setIdPrefix=function(b){return b?(a=b,true):false};this.setId=function(b){return b?(this.set("_id",a+b),true):false};this.getId=function(){return this.get("_id")};this.load=function(b){return this.sync(c,a+b)};this.login=function(){var b=new d,a=this.get("name"),
c=this.get("password");a&&typeof a=="string"&&typeof c=="string"?this.getTransport().request("CouchDB",{method:"GET",path:"/_users/org.couchdb.user:"+a,auth:a+":"+c},b.resolve,b):b.reject({error:"name & password must be strings"});return b};this.create=function(){var b=new d;this.get("type")||this.set("type","user");this.get("roles")||this.set("roles",[]);this.load(this.get("name")).then(function(){b.reject({error:"Failed to create user. The user already exists"})},function(){this.upload().then(function(a){b.resolve(a)},
function(a){b.reject(a)})},this);return b}}return function(){a.prototype=new e;return new a}});
