const request = require('supertest');
const surcharge = require('../index');
const should = require('should');
const express = require('express');
const mocha = require('mocha');

const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

describe('body-validator', () => {
  before(() => surcharge());

  const app = express();

  app.set('json spaces', 0);
  app.get('/', (req, res) => {
    res.send({
      foo: 'John'
    });
  });

  it('should allow functions when asserting the parsed response body', done => {
    request(app)
      .get('/')
      .expect({
        foo: val => Number.isNaN(Date.parse(val)) ? '<Date>' : true
      })
      .end(err => {
        should.exist(err);
        should(err.message).equal("{ foo: 'John' } deepEqual { foo: '<Date>' }");

        request(app)
          .get('/')
          .expect({
            foo: val => typeof val !== 'string' ? '<string>' : true
          })
          .end(done);
      });
  });

  it('allows using a different name instead of surcharging', done => {
    surcharge('validateJson');

    request(app)
      .get('/')
      .validateJson({ foo: () => true })
      .end(done);
  });

  it('allows the use of symbols as a name for the new method', done => {
    const validateJson = surcharge(Symbol('validateJson'));

    request(app)
      .get('/')
      [validateJson]({ foo: () => true })
      .end(done);
  });
});
