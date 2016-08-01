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

  app.get('/test2', (req, res) => {
    res.send({
      email: 'hello@net.com',
      avatar: null,
      roles: ['admin', 'user'],
      createdAt: (new Date()).toString(),
      id: 457,
      token: 'nice token you have here',
    });
  });

  app.get('/test3', (req, res) => {
    res.send({
      data: {
        email: 'hello@net.com',
        avatar: null,
        roles: ['admin', 'user'],
        createdAt: (new Date()).toString(),
        id: 457,
        token: 'nice token you have here'
      }
    });
  });

  app.get('/test4', (req, res) => {
    res.send({
      roles: ['admin', 'user']
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
        should(err.expected).deepEqual({ foo: '<Date>' });

        request(app)
          .get('/')
          .expect({
            foo: val => typeof val !== 'string' ? '<string>' : true
          })
          .end(done);
      });
  });

  it('should not crash when there are complex values to check', done => {
    request(app)
      .get('/test2')
      .expect({
        email: 'hello@net.com',
        avatar: null,
        roles: ['admin', 'user'],
        createdAt: val => !Number.isNaN(Date.parse(val)) ? true : '<Date>',
        id: val => Number.isInteger(val) ? true : '<Integer>',
        token: val => typeof val === 'string' ? true : '<String>',
      })
      .end(done);
  });

  it('should display validator messages correctly', done => {
    request(app)
      .get('/test3')
      .expect({
        data: {
          email: 'hello@net.com',
          avatar: null,
          roles: ['admin', 'user'],
          createdAt: () => '<fail date>',
          id: () => '<fail int>',
          token: () => '<fail string>',
        }
      })
      .end(err => {
        const data = err.expected.data;
        should(data.createdAt).equal('<fail date>');
        should(data.id).equal('<fail int>');
        should(data.token).equal('<fail string>');

        done();
      });
  });

  it('does not care about array ordering', done => {
    request(app)
      .get('/test4')
      .expect({ roles: ['user', 'admin'] })
      .end(err => {
        should.not.exist(err);

        request(app)
          .get('/test4')
          .expect({ roles: ['admin', 'user'] })
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
