const assert = require('assert');

/**
 * Version of {@link assert#deepCompare} that accepts functions in expected.
 * @param actual
 * @param expected
 */
function _deepEqual(actual, expected) {

  // Custom validator. Return error message rather than false.
  if (typeof expected === 'function') {
    const result = expected(actual);
    if (result !== true) {
      return (result || 'please make your validator return what the value should have been');
    }

    return true;
  }

  if (Object.is(actual, expected)) {
    return true;
  }

  if (actual == null || expected == null) {
    return false;
  }

  // They should have been equivalent.
  if (typeof expected !== 'object') {
    return false;
  }

  // Avoid checking `actual` is the same type each time.
  if (Object.getPrototypeOf(expected) !== Object.getPrototypeOf(actual)) {
    return false;
  }

  if (expected instanceof Date) {
    return expected.getTime() === actual.getTime();
  }

  if (expected instanceof Buffer) {
    return expected.equals(actual);
  }

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  if (expected instanceof RegExp) {
    return actual.source === expected.source &&
      actual.global === expected.global &&
      actual.multiline === expected.multiline &&
      actual.lastIndex === expected.lastIndex &&
      actual.ignoreCase === expected.ignoreCase;
  }

  // Other objects: Compare enumerable properties properties:
  if (isArguments(expected)) {
    // they have the same prototype as {}
    if (!isArguments(actual)) {
      return false;
    }
  }

  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual);

  let valid = actualKeys.length === expectedKeys.length;

  /**
   * same as *expected* except that functions are replaced by their error message if there was an error.
   * or by their *actual* counterpart if there was no error.
   * @type {*}
   */
  const toReturn = Object.assign({}, expected);
  expectedKeys.forEach(key => {
    const deepCompareResult = _deepEqual(actual[key], expected[key]);
    if (deepCompareResult !== true) {
      valid = false;
    }

    if (typeof expected[key] === 'function') {
      toReturn[key] = (deepCompareResult === true) ? actual[key] : deepCompareResult;
    }
  });

  return valid ? true : toReturn;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) === '[object Arguments]';
}

exports.deepCompare = function deepEqual(actual, expected, message) {
  const result = _deepEqual(actual, expected);

  if (result !== true) {
    assert.fail(actual, result === false ? expected : result, message, 'deepEqual', exports.deepCompare);
  }
};
