var assert = require('assert'),
    fs = require('fs'),
    path = require('path');

var parse = require('../lib/task.parse.js');

describe('parse', function() {

    beforeEach(function() {
        parse.init();
    });

    describe('init', function() {
        it('should update the regular expression used to match YAML blocks', function() {
            parse.init({
                cssBlockRegEx: /\/\*\s*?SG\n([\s\S]*?)\*\//g,
                htmlBlockRegEx: /<!--\s*?SG\n([\s\S]*?)--\>/
            });

            assert.deepEqual(parse.regEx, {
                css: /\/\*\s*?SG\n([\s\S]*?)\*\//g,
                html: /<!--\s*?SG\n([\s\S]*?)--\>/
            });
        });
    });

    describe('fromCss', function() {
        it('should return an array of objects given CSS containing commented YAML blocks', function() {
            assert.deepEqual([{
                name: 'Default button',
                notes: 'The default button',
                partial: 'btn',
                context: 'btn.default',
                other: 'example of random extra data'
            }, {
                name: 'Other button',
                notes: 'The other button',
                partial: 'btn',
                context: 'btn.other',
                other: 'example of random extra data'
            }], parse.fromCss([
                '/* YAPL',
                'name: Default button',
                'notes: The default button',
                'partial: btn',
                'context: btn.default',
                'other: example of random extra data',
                '*/',
                '.btn {',
                '    cursor: pointer;',
                '}',
                '/* YAPL',
                'name: Other button',
                'notes: The other button',
                'partial: btn',
                'context: btn.other',
                'other: example of random extra data',
                '*/',
                '.btn--other {',
                '    border: 1px solid #000;',
                '}'
            ].join('\n')));
        });

        it('should return an empty array given CSS containing no YAML blocks', function() {
            assert.deepEqual([], parse.fromCss([
                '.btn {',
                '    cursor: pointer;',
                '}',
                '.btn--other {',
                '    border: 1px solid #000;',
                '}'
            ].join('\n')));
        });
    });

    describe('fromHtml', function() {
        it('should return a single object given HTML containing a commented YAML block', function() {
            assert.deepEqual({
                name: 'Home Page',
                notes: 'The Home Page'
            }, parse.fromHtml([
                '<p>Miscellaneous HTML content</p>',
                '<p>Miscellaneous HTML content</p>',
                '<!-- YAPL',
                'name: Home Page',
                'notes: The Home Page',
                '-->',
                '<p>Miscellaneous HTML content</p>',
                '<p>Miscellaneous HTML content</p>'
            ].join('\n')));
        });

        it('should return an empty object given HTML containing no YAML blocks', function() {
            assert.deepEqual({}, parse.fromHtml([
                '<p>Miscellaneous HTML content</p>',
                '<p>Miscellaneous HTML content</p>'
            ].join('\n')));
        });
    });

    describe('fromFile', function() {
        it('should return an array of objects given a CSS file containing commented YAML blocks', function() {
            assert.deepEqual([{
                name: 'Default button',
                notes: 'The default button',
                partial: 'btn',
                context: 'btn.default',
                other: 'example of random extra data'
            }, {
                name: 'Other button',
                notes: 'The other button',
                partial: 'btn',
                context: 'btn.other',
                other: 'example of random extra data'
            }], parse.fromFile(__dirname + '/css/_btn.scss', 'css'));
        });

        it('should return a single object given an HTML file containing a commented YAML block', function() {
            assert.deepEqual({
                name: 'Home Page',
                notes: 'The Home Page'
            }, parse.fromFile(__dirname + '/html/home.html', 'html'));
        });

        it('should throw an error if the file type is not defined', function() {
            assert.throws(function() {
                parse.fromFile(__dirname + '/css/_btn.scss');
            }, Error);
        });
    });

});