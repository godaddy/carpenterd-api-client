# `carpenterd-api-client`

> ⚠️ **DEPRECATED**: This package is no longer maintained and has been deprecated. Please use an alternative solution or contact the maintainers for more information.

[![Version npm](https://img.shields.io/npm/v/carpenterd-api-client.svg?style=flat-square)](https://www.npmjs.com/package/carpenterd-api-client)
[![License](https://img.shields.io/npm/l/carpenterd-api-client.svg?style=flat-square)](https://github.com/warehouseai/carpenterd-api-client/blob/master/LICENSE)
[![npm Downloads](https://img.shields.io/npm/dm/carpenterd-api-client.svg?style=flat-square)](https://npmcharts.com/compare/carpenterd-api-client?minimal=true)
[![Dependencies](https://img.shields.io/david/warehouseai/carpenterd-api-client.svg?style=flat-square)](https://github.com/warehouseai/carpenterd-api-client/blob/master/package.json)

The `carpenterd-api-client` is an API client for the [`carpenterd`][carpenterd]
build service.

## Install

Install `carpenterd-api-client` from the npm registry:
```
npm install --save carpenterd-api-client
```

## Usage

In all examples we assume that you've already initialized the client as
followed:

```js
'use strict';

const Carpenter = require('carpenterd-api-client');

const carpenter = new Carpenter('url-to-the-service');
```

As you can see in the example above, the `Carpenter` constructor requires one
argument:

- The URL of the carpenter API where we should send the requests to.

## API

### build

Trigger a new build on carpenter service. The data provided should have
the same structure and signature as `npm publish` posted JSON.

```js
carpenter.build({ data: {
  "name": "tester",               // name of the package
  "dist-tags": {
    "latest": "1.0.0"
  },
  "versions": {
    "1.0.0": {
      "name": "tester",
      "version": "1.0.0"
      ...
    }
  },
  "_attachment": ""               // base64 encoded binary blob
}}, function () {

});
```

### cancel

Cancel a build on carpenter service.

```js
carpenter.cancel({
  "pkg": "tester",                  // name of the package
  "version": "1.0.0",               // valid semver
  "env": "prod"                     // optional environment parameter
}}, function () {

});
```

## Tests

```sh
npm test
```

[carpenterd]: https://github.com/godaddy/carpenterd
