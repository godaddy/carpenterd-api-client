'use strict';

var request = require('hyperquest');
var url = require('url');
var Retryme = require('retryme');

//
// Methods that require an `application/json` header.
//
var methods = ['POST', 'PUT'];

/**
 * Carpenter API client.
 *
 * @constructor
 * @param {Object|String} opts Options for root URL of carpenter service
 * @param {String} opts.url The root URL of the carpenter service
 * @param {String} opts.uri The root URL of the carpenter service
 * @param {String} opts.href The href for root URL of the carpenter service
 * @param {String} opts.protocol Protocol for root URL of the carpenter service
 * @param {String} opts.version The carpenter build API version to use (defaults to v2)
 * @public
 */
function Carpenter(opts) {
  // eslint-disable-next-line no-new
  if (!this) new Carpenter(opts);

  if (typeof opts === 'string') {
    this.base = opts;
  } else if (opts.protocol && opts.href) {
    this.base = url.format(opts);
  } else if (opts.url || opts.uri) {
    this.base = opts.url || opts.uri;
  } else {
    throw new Error('Carpenter URL required');
  }

  this.version = (opts.version === '1' || opts.version === 'v1' || opts.version === 1) ? '' : 'v2';

  //
  // Handle all possible cases
  //
  this.base = typeof this.base === 'object'
    ? url.format(this.base)
    : this.base;

  this.timeout = opts.timeout || 0;
  this.agent = opts.agent;
  this.retryOpts = opts.retry || { retries: 5, min: 500, max: 10000 };
}

/**
 * Trigger a new build.
 *
 * @param {Object} options Configuration.
 * @param {Function} next Completion callback.
 * @returns {Stream} the request
 * @private
 */
Carpenter.prototype.build = function build(options, next) {
  options = options || {};
  options.method = options.method || 'POST';

  return this.send([
    this.version,
    'build'
  ].filter(Boolean).join('/'), options, next);
};

/**
 * Cancel a build. The parameters are provided by options and filtered to allow
 * optional parameters.
 *
 * @param {Object} options Configuration.
 * @param {Function} next Completion callback.
 * @returns {Stream} the request
 * @private
 */
Carpenter.prototype.cancel = function cancel(options, next) {
  options = options || {};
  options.method = 'GET';

  return this.send([
    'cancel',
    options.pkg,
    options.version,
    options.env
  ].filter(Boolean).join('/'), options, next);
};

/**
 * Internal API for sending data.
 *
 * @param {String} pathname Pathname we need to hit.
 * @param {Object} options Hyperquest options
 * @param {Function} done Completion callback.
 * @returns {Stream} the request
 * @api private
 */
Carpenter.prototype.send = function send(pathname, options, done) {
  var base = url.parse(this.base),
    data = false,
    req;

  if (typeof pathname === 'object') {
    options = pathname;
    pathname = null;
  }

  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  options.agent = this.agent;
  options.headers = options.headers || {};
  options.timeout = options.timeout || this.timeout;

  base.pathname = pathname || options.pathname || '/';

  //
  // Setup options from method and optional data.
  //
  data = options.data;
  if (typeof data === 'object' || ~methods.indexOf(options.method)) {
    options.method = options.method || 'POST';
    options.headers['Content-Type'] = 'application/json';
  }

  var operation = new Retryme(this.retryOpts);

  operation.attempt(next => {
    //
    // Setup hyperquest to formatted URL with retries.
    //
    req = request(url.format(base), options, next);

    //
    // Write JSON data to the request if provided. This is only required for
    // POST and PUT as hyperquest by default ends GET, DELETE and HEAD requests.
    //
    try {
      if (~methods.indexOf(options.method)) {
        req.end(typeof data === 'object' ? JSON.stringify(data) : data);
      }
    } catch (error) {
      return next(error);
    }
  }, done);


  return req;
};

//
// Expose the interface.
//
module.exports = Carpenter;
