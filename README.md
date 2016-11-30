# carpenter-api-client

The `carpenter-api-client` is an API client for the `carpenter` build service.

## Install

Install `carpenter-api-client` from the npm registry:
```
npm install --save carpenter-api-client
```

## API

In all examples we assume that you've already initialized the client as
followed:

```js
'use strict';

var Carpenter = require('carpenter-api-client');

var carpenter = new Carpenter('url-to-the-service');
```

As you can see in the example above, the `Carpenter` constructor requires one
argument:

- The URL of the carpenter API where we should send the requests to.

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

## License
MIT
