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
    res.send({ foo: (new Date()).toString() });
  });

  it('should allow functions when asserting the parsed response body', done => {
    request(app)
      .get('/')
      .expect({ foo: () => false })
      .end(err => {
        should.exist(err);

        request(app)
          .get('/')
          .expect({ foo: val => !Number.isNaN(Date.parse(val)) })
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
