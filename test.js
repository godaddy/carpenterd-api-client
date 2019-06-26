var assume = require('assume');
var nock = require('nock');
var url = require('url');
var Carpenter = require('./');

describe('carpenter-api-client', function () {
  this.timeout(5e4);
  var carpenter, uri;

  beforeEach(function each() {
    uri = 'http://localhost:8999/';
    carpenter = new Carpenter(uri);
  });

  afterEach(function each() {
    carpenter = null;
  });

  it('can be configured with object', function () {
    carpenter = new Carpenter(url.parse(uri));

    assume(carpenter.base).to.be.an('string');
    assume(carpenter.base).to.equal(uri);
  });

  it('can be configured with an agent and url', function () {
    carpenter = new Carpenter({
      url: uri,
      agent: require('http').Agent
    });

    assume(carpenter.agent);
  });

  it('can be configured with default timeout and defaults to 0', function () {
    assume(carpenter).to.have.property('timeout', 0);

    carpenter = new Carpenter({
      url: uri,
      timeout: 2 * 60 * 1000
    });

    assume(carpenter).to.have.property('timeout', 120000);
  });

  it('can be configured with retry and defaults to { retries: 5, min: 500, max: 10000 }', function () {
    assume(carpenter.retryOpts).eqls({ retries: 5, min: 500, max: 10000 });
    carpenter = new Carpenter({
      url: uri,
      retry: {
        retries: 3,
        min: 100,
        max: 500
      }
    });

    assume(carpenter.retryOpts).eqls({ retries: 3, min: 100, max: 500 });
  });

  it('can be configured with an agent and url object', function () {
    carpenter = new Carpenter({
      url: url.format(uri),
      agent: require('http').Agent
    });

    assume(carpenter.base).to.equal(uri);
    assume(carpenter.agent);
  });

  it('can be configured with an api version', function () {
    [1, '1', 'v1'].forEach(function (version) {
      carpenter = new Carpenter({ uri, version });

      assume(carpenter.version).equals('');
    });
  });

  it('defaults to the v2 api', function () {
    assume(new Carpenter({ uri }).version).equals('v2');
    assume(new Carpenter({ uri, version: 'not one' }).version).equals('v2');
  });

  describe('#build', function () {
    var options = {
      data: {
        data: { name: 'foo-bar' },
        promote: true
      }
    };

    it('sends a request to /v2/build', function (next) {
      next = assume.wait(2, next);

      nock(uri)
        .post('/v2/build')
        .reply(200, function reply(uri, body) {
          assume(body.data.name).equals('foo-bar');
          assume(body.promote).equals(true);
          nock.cleanAll();
          next();

          return {};
        });

      carpenter.build(options, next);
    });

    it('sends a request to /v2/build with retries and fails after retries', next => {
      carpenter = new Carpenter({
        url: uri,
        retry: {
          retries: 3,
          min: 100,
          max: 500
        }
      });
      nock(uri, {
        badheaders: ['whatever']
      })
        .post('/v2/build')
        .reply(200);

      carpenter.build(Object.assign({}, options, {
        headers: {
          whatever: 'idontcare'
        }
      }), err => {
        assume(err.statusCode).equals(404);
        assume(err.message).includes('Nock: No match for request');
        // Verify it retries
        assume(err['attempt#0']).is.truthy();
        assume(err['attempt#2']).is.truthy();

        nock.cleanAll();
        next();
      });
    });

    it('can also send stringified data', function (next) {
      next = assume.wait(2, next);

      nock(uri)
        .post('/v2/build')
        .reply(200, function reply(uri, body) {
          assume(body.data.name).equals('foo-bar');
          assume(body.promote).equals(true);
          nock.cleanAll();
          next();

          return {};
        });

      carpenter.build({
        data: JSON.stringify(options.data)
      }, next);
    });

    it('sends a request to /build when using v1 API', function (next) {
      carpenter = new Carpenter({
        uri,
        version: 'v1'
      });

      next = assume.wait(2, next);

      nock(uri)
        .post('/build')
        .reply(200, function reply(uri, body) {
          assume(body.name).equals('foo-bar');
          nock.cleanAll();
          next();

          return {};
        });

      carpenter.build({
        data: { name: 'foo-bar' }
      }, next);
    });
  });

  describe('#cancel', function () {
    var options = {
      pkg: 'foo-bar',
      version: '1.0.0',
      env: 'prod'
    };

    it('sends a request to /cancel', function (next) {
      next = assume.wait(2, next);

      nock(uri)
        .get('/cancel/foo-bar/1.0.0/prod')
        .reply(200, function reply(uri, body) {
          assume(uri).equals('/cancel/foo-bar/1.0.0/prod');
          assume(body).to.be.falsey();
          nock.cleanAll();
          next();

          return {};
        });

      carpenter.cancel(options, next);
    });

    it('sends a request to /cancel with retries and fails after retries', next => {
      carpenter = new Carpenter({
        url: uri,
        retry: {
          retries: 3,
          min: 100,
          max: 500
        }
      });
      nock(uri, {
        badheaders: ['whatever']
      })
        .post('/cancel/foo-bar/1.0.0/prod')
        .reply(200);

      carpenter.build(Object.assign({}, options, {
        headers: {
          whatever: 'idontcare'
        }
      }), err => {
        assume(err.statusCode).equals(404);
        assume(err.message).includes('Nock: No match for request');
        // Verify it retries
        assume(err['attempt#0']).is.truthy();
        assume(err['attempt#2']).is.truthy();

        nock.cleanAll();
        next();
      });
    });

    it('has optional env parameter', function (next) {
      next = assume.wait(2, next);

      delete options.env;

      nock(uri)
        .get('/cancel/foo-bar/1.0.0')
        .reply(200, function reply(uri, body) {
          assume(uri).equals('/cancel/foo-bar/1.0.0');
          assume(body).to.be.falsey();
          nock.cleanAll();
          next();

          return {};
        });

      carpenter.cancel(options, next);
    });
  });
});
