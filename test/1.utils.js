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

    describe('findRelevantSelectorsInNestedCss', function() {
        let css = `
            @mixin my-mixin {
                display: flex;

                .mixin-child {
                    align-self: flex-end;
                }
            }
            .parent {
                border: 2px solid #000;
                position: relative;
                width: 50px;

                // A Sass comment

                &:hover {
                    background-color: $someVariable;
                }

                &__child,
                &__child2 {
                    border-radius: 8px;
                    @include my-mixin;

                    input[type="checkbox"] {
                        float: left;
                    }
                }

                // A Sass comment
                &__child {
                    font-size: 20px;
                    font-weight: bold;
                    &:hover {
                        background-color: orange;
                    }

                    .ancestor & {
                        display: none;
                    }

                    &--bigger {
                        font-size: 30px;
                    }

                    @include large-and-above {
                        &--smaller {
                            font-size: 20px;
                        }
                    }
                }

                // A Sass comment
                &__child-#{$interpolated-thing} {
                    font-size: 20px;
                    font-weight: bold;
                }

                &__other-child {
                    height: 6px;
                    width: 6px;

                    &::before {
                        content: 'pseudo';
                    }
                }

                &--modifier {
                    display: none;

                    &[type="button"] {
                        display: block;
                    }
                }

                .another-module {
                    position: absolute;
                    top: 0;

                    .ancestor & {
                        right: 0;

                        .super-ancestor & {
                            transform: scale(.5);

                            &__child {
                                border: 0;

                                .super-super-ancestor & {
                                    border: 2px solid;
                                }
                            }
                        }

                        > .portlet {
                            bottom: 0;

                            + .portlet {
                                margin-left: 5px;
                            }
                        }
                    }
                }

                #id-based-selector {
                    display: block;
                }
            }

            .portlet {
                display: flex;

                &--small,
                .ancestor &--small {
                    height: 2px;

                    img {
                        width: 100%;
                    }
                }

                @include large-and-above {
                    img {
                        width: 40%;
                    }
                }
            }
        `;
        let selectors = utils.findRelevantSelectorsInNestedCss(css);

        it('should return an array', function() {
            assert.isArray(selectors);
        });

        it('should not contain pseudo selectors', function() {
            assert.lengthOf(
                selectors.filter(s => s.includes(':')),
                0
            )
        });

        it('should not contain classes containing string interpolation characters', function() {
            assert.lengthOf(
            selectors.filter(s => s.includes('#{$')),
                0
            )
        });

        it('should contain the expected selectors', function() {
            assert.sameMembers(selectors, [
                '.ancestor .parent .another-module',
                '.ancestor .parent .another-module > .portlet',
                '.ancestor .parent .another-module > .portlet + .portlet',
                '.ancestor .parent__child',
                '.ancestor .portlet--small img',
                '.ancestor .portlet--small',
                '.mixin-child',
                '.parent .another-module',
                '.parent #id-based-selector',
                '.parent__child input[type="checkbox"]',
                '.parent__child--bigger',
                '.parent__child--smaller',
                '.parent__child',
                '.parent__child2 input[type="checkbox"]',
                '.parent__child2',
                '.parent__other-child',
                '.parent--modifier',
                '.parent--modifier[type="button"]',
                '.parent',
                '.portlet img',
                '.portlet--small',
                '.portlet--small img',
                '.portlet',
                '.super-ancestor .ancestor .parent .another-module__child',
                '.super-ancestor .ancestor .parent .another-module',
                '.super-super-ancestor .super-ancestor .ancestor .parent .another-module__child',
            ].sort());
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

       it('should be formatted for the web. Directories should be separated by a single forward slash', function() {
           assert('/folder/containing/file.html', utils.linkFromRoot('folder', 'containing/file.html'));
       });
    });

});
