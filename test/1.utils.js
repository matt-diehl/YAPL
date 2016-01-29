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
            assert.deepEqual([138, 70], utils.dimensions('images/logo.png'));
        });

        it('should return an array of dimensions given a placehold.it image', function() {
            assert.deepEqual([200, 200], utils.dimensions('http://placehold.it/200x200'));
        });

        it('should return an array of dimensions given a lorempixel image', function() {
            assert.deepEqual([200, 200], utils.dimensions('http://lorempixel.com/200/200'));
            assert.deepEqual([200, 200], utils.dimensions('http://lorempixel.com/g/200/200'));
            assert.deepEqual([200, 200], utils.dimensions('http://lorempixel.com/200/200/sports'));
        });

        it('should return an error for a non-local image other than placehold.it or lorempixel.com', function() {
            assert.throws(function() {
                utils.dimensions('http://website.com/image.jpg');
            }, Error);
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