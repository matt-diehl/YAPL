var chai = require('chai'),
    assert = chai.assert;

var Block = require('../lib/obj.block.js');

var block = Object.create(Block);

describe('obj.block', function() {

    // beforeEach(function() {
    //     block.init
    // });

    describe('init', function() {
        it('should be an object', function() {
            block.init();
            assert.isObject(block);
        });
    });

});