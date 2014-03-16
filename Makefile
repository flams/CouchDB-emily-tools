###############################################################################################
# https://github.com/flams/CouchDB-emily-tools
# The MIT License (MIT)
# Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
#
# Targets:
#
# make tests-unit: runs the JsTestDriver unit tests
# make tests-integration: runs the mocha integration tests
# make tests: runs both tests
#
# make docs: generates the documentation into docs/latest
# make build: generates CouchDBTools.js and CouchDBTools.min.js as they appear in the release
#
# make all: tests + docs + build
#
# make release VERSION=x.x.x: make all, then creates the package and pushes to github
#
# //make gh-pages VERSION=x.x.x: generates the web site with latest version and pushes to github
#
################################################################################################

SRC := $(wildcard src/*.js)
SPECS := $(wildcard specs/*.js)
INTEGRATION := $(wildcard integration-tests/*.js)
JsTestDriver = $(shell find tools -name "JsTestDriver-*.jar" -type f)

all: tests docs build

clean-docs:
	-rm -rf docs/latest/

clean-build:
	-rm -rf build/

clean-temp:
	rm -f temp.js

docs: clean-docs
	java -jar tools/JsDoc/jsrun.jar \
		tools/JsDoc/app/run.js src \
		-r=2 \
		-d=docs/latest/ \
		-t=tools/JsDoc/templates/jsdoc

jshint:
	jshint src

tests: tests-unit

tests-unit:
	jasmine-node specs/

tests-integration:
	node $(INTEGRATION)

build: clean-build CouchDBTools.min.js
	cp LICENSE build/

temp.js: clean-temp
	browserify -r ./src/CouchDBTools.js:CouchDBTools -u emily -o temp.js

CouchDBTools.js: temp.js
	mkdir -p build
	cat LICENSE-MINI temp.js > build/$@

CouchDBTools.min.js: CouchDBTools.js
	java -jar tools/GoogleCompiler/compiler.jar \
		--js build/CouchDBTools.js \
		--js_output_file build/CouchDBTools.min.js \
		--create_source_map build/CouchDBTools-map

clean: clean-build clean-docs

release: all
ifndef VERSION
	@echo "You must give a VERSION number to make release"
	@exit 2
endif

	mkdir -p release/tmp/CouchDBTools-$(VERSION)
	cp -rf build/* release/tmp/CouchDBTools-$(VERSION)

	cd release/tmp/CouchDBTools-$(VERSION); \
	sed -i .bak 's#<VERSION>#'$(VERSION)'#' CouchDBTools.js CouchDBTools.min.js; \
	rm CouchDBTools.js.bak CouchDBTools.min.js.bak

	cd release/tmp/; \
	tar czf ../CouchDBTools-$(VERSION).tgz CouchDBTools-$(VERSION)

	rm -rf release/tmp/

	cp -rf docs/latest/ docs/$(VERSION)/

	git add build docs release

	git commit -am "released version $(VERSION)"

	git push

	git tag $(VERSION)

	git push --tags

gh-pages:
ifndef VERSION
	@echo "You must give a VERSION number to make gh-pages"
	@exit 2
endif

	git checkout gh-pages

	git checkout master build Makefile docs src specs tools lib release
	git add build docs src specs tools lib release

	sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
	sed -i .bak 's#<a href="release/CouchDBTools.*\.tgz">#<a href="release/CouchDBTools-'${VERSION}'.tgz">#' index.html
	rm index.html.bak

	git commit -am "updated to $(VERSION)"

	git push

	git checkout master


.PHONY: docs clean-docs clean-build build tests release clean gh-pages jshint
