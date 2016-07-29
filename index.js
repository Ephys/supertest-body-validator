const supertest = require('supertest');
const assert = require('./lib/assert');
const util = require('util');

const Test = supertest.Test;
const originalExpect = Test.prototype.expect;

/**
 * Adds a method to supertest to validate JSON bodies using validators.
 *
 * @param {!(string|symbol)} [name = 'expect'] - The name of the function.
 */
module.exports = function supercharge(name) {
  name = name || 'expect';

  if (name !== 'expect' && Test.prototype[name] !== void 0) {
    throw new Error(name.toString() + ' is already defined by supertest.');
  }

  Test.prototype[name] = newExpect;

  return name;
};

function newExpect(expected, done, c) {
  if (!isHandled(expected)) {
    return originalExpect.call(this, expected, done, c);
  }

  if (done) {
    this.end(done);
  }

  this._asserts.push(res => assert.deepCompare(res.body, expected));
  return this;
}

function isHandled(expected) {
  return typeof expected === 'object' && !(expected instanceof RegExp);
}
