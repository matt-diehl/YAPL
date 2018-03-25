'use strict';

var assert = require('chai').assert,
    fs = require('fs'),
    path = require('path');

var utils = require('../lib/utils.js');

describe('utils', function() {

    describe('camelCase', function() {
        it('should convert a string with spaces to camelCase notation', function() {
            assert.equal('camelCase', utils.camelCase('camel case'));
            assert.equal('camelCase', utils.camelCase('Camel Case'));
            assert.equal('camelCase', utils.camelCase('Camel case'));
            assert.equal('longerCamelCasePhrase', utils.camelCase('longer camel case phrase'));
        });
    });

    describe('cssCase', function() {
        it('should convert a string with spaces to lower case css notation', function() {
            assert.equal('css-case', utils.cssCase('css case'));
            assert.equal('css-case', utils.cssCase('CSS Case'));
            assert.equal('css-case', utils.cssCase('CSS case'));
            assert.equal('longer-css-case-phrase', utils.cssCase('longer css case phrase'));
        });
    });

    describe('findMatchingSelectors', function() {
        it('should return set of selectors that were found in the given HTML', function() {
            let html = `
                <div>
                    <div class="rtf">
                        text
                    </div>
                    <div class="portlet">
                        text
                    </div>
                    <div class="portlet portlet--lg">
                        text
                    </div>
                    <div id="abba" class="another-thing">
                        text
                    </div>
                </div>
            `;
            let matches = utils.findMatchingSelectors(html, ['.rtf', '.portlet', '.portlet--sm', '.dont-find-me'])
            assert.equal(matches.length, 2);
        });
    });

    describe('generateCssSelector', function() {
        it('create a css selector give the first dom node in an HTML block', function() {
            let html = `
                <div class="test-class test-class--mod">
                    <div class="rtf">
                        text
                    </div>
                    <div class="portlet">
                        text
                    </div>
                </div>
            `;
            let selector = utils.generateCssSelector(html)
            assert.equal(selector, '.test-class.test-class--mod');
        });
    });

    describe('titleCase', function() {
        it('should convert a string with spaces to title case notation', function() {
            assert.equal('Title Case', utils.titleCase('title case'));
            assert.equal('Title Case', utils.titleCase('Title Case'));
            assert.equal('Title Case', utils.titleCase('tiTle cAse'));
            assert.equal('Longer Title Case Phrase', utils.titleCase('longer title case phrase'));
        });
    });

    describe('placeholderImage', function() {
        it('should return an HTML image tag given an array containing width and height', function() {
            assert.equal('<img src="http://placehold.it/200x200" width="200" height="200">', utils.placeholderImage([200, 200]));
        });
    });

    describe('aspectRatio', function() {
        it('should return an image ratio given an array containing width and height', function() {
            assert.equal('1:1', utils.aspectRatio([200, 200]));
            assert.equal('2:1', utils.aspectRatio([200, 100]));
            assert.equal('3:1', utils.aspectRatio([333, 111]));
            assert.equal('8:5', utils.aspectRatio([600, 375]));
        });
    });

    describe('dimensions', function() {
        it('should return an array of dimensions given a local image', function() {
            assert.deepEqual([138, 70], utils.dimensions(path.join(__dirname, 'images/logo.png')));
        });

        it('should return an array of dimensions given a placehold.it image', function() {
            assert.deepEqual([200, 200], utils.dimensions('http://placehold.it/200x200'));
        });

        it('should return an array of dimensions given a lorempixel image', function() {
            assert.deepEqual([200, 200], utils.dimensions('http://lorempixel.com/200/200'));
            assert.deepEqual([200, 200], utils.dimensions('http://lorempixel.com/g/200/200'));
            assert.deepEqual([200, 200], utils.dimensions('http://lorempixel.com/200/200/sports'));
        });

        it('should return an array of dimensions given other random placeholder services', function() {
            assert.deepEqual([200, 300], utils.dimensions('http://unsplash.it/200/300'));
            assert.deepEqual([200, 300], utils.dimensions('http://unsplash.it/200/300/?random'));
            assert.deepEqual([600, 300], utils.dimensions('http://dummyimage.com/600x300/000/fff'));
            assert.deepEqual([200, 300], utils.dimensions('http://placekitten.com/200/300'));
            assert.deepEqual([200, 300], utils.dimensions('http://placekitten.com/g/200/300'));
            assert.deepEqual([640, 480], utils.dimensions('https://placeimg.com/640/480/any'));
            assert.deepEqual([200, 300], utils.dimensions('http://placebear.com/g/200/300'));
        });
    });

    describe('copyFile', function() {
        it('should copy a file from one location to another', function() {
            utils.copyFile(
                path.resolve(__dirname, 'images/logo.png'),
                path.resolve(__dirname, 'images/logo-copy.png')
            );
            assert.equal(true, fs.statSync(path.resolve(__dirname, 'images/logo-copy.png')).isFile());
            fs.unlinkSync(path.resolve(__dirname, 'images/logo-copy.png'));
        });
    });

    describe('linkFromRoot', function() {
       it('should return an absolute path given a root directory and the file to link to', function() {
           assert('/folder/containing/file.html', utils.linkFromRoot('folder', 'containing/file.html'));
       });
    });

});
