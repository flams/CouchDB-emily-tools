/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
 var CouchDBView = require("../src/CouchDBView"),
    CouchDBDocument = require("../src/CouchDBDocument"),
	chai = require("chai"),
	chaiAsPromised = require("chai-as-promised"),
    serverTools = require("../tools"),
    Transport = require("transport"),
    Store = require("observable-store"),
	expect = chai.expect;

chai.use(chaiAsPromised);

describe("Given CouchDBView and a transport", function () {

    var transport = new Transport(new Store({
        "CouchDB": serverTools.handler,
        "CouchDBChange": serverTools.changeHandler
    }));


    describe("When initialized", function () {
        var sut = new CouchDBView();

        it("is a simple observable data-store", function () {
            sut.set("test", true);

            expect(sut.get("test")).to.be.true;
        });

        describe("When synchronized with a CouchDBView", function (done) {

            sut.setTransport(transport);
            var promise = sut.sync("test", "list", "_view/id")

            it("Then retrieves the view's documents from the database", function (done) {
                promise.then(function () {
                    expect(sut.count() > 0).to.be.true;
                    done();
                });
            });

            describe("When a document is added", function () {
                var couchDBDocument = new CouchDBDocument(),
                    onAdded = null;

                couchDBDocument.setTransport(transport);
                sut.watch("added", function () {
                    onAdded = arguments;
                });

                promise = couchDBDocument.sync("test", "newDocument")
                .then(function () {
                     return couchDBDocument.upload();
                });

                it("Then publishes an 'added' event", function (done) {
                    promise.then(function () {
                        var docIndex = onAdded[0],
                            doc = onAdded[1];

                        expect(sut.get(docIndex)).to.equal(doc);
                        done();
                    });
                });

                describe("When the document is updated", function () {
                    var onUpdated, promiseUploaded;

                    promiseUploaded = promise.then(function() {
                        couchDBDocument.set("new property", "new value");

                        sut.watch("updated", function () {
                            onUpdated = arguments;
                        });

                        return couchDBDocument.upload();
                    });

                    it("Then publishes an 'updated' event", function (done) {
                        promiseUploaded.then(function () {
                            var docIndex = onUpdated[0],
                                doc = onUpdated[1];

                            expect(sut.get(docIndex)).to.equal(doc);
                            done();
                        });
                    });

                    describe("When the document is removed", function () {
                        var onDeleted = null, promiseRemoved;

                        sut.watch("deleted", function () {
                            onDeleted = arguments;
                        });

                        promiseRemoved = promiseUploaded.then(function () {
                            return couchDBDocument.remove();
                        });

                        it("Then publishes a 'deleted' event", function (done) {
                            promiseRemoved.then(function () {
                                var docIndex = onDeleted[1];
                                expect(sut.get(docIndex)).to.be.undefined;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
