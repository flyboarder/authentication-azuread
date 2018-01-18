# @feathersjs/authentication-azuread

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/authentication-azuread.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/authentication-azuread.png?branch=master)](https://travis-ci.org/feathersjs/authentication-azuread)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d948ae0f5b7572578d5a/test_coverage)](https://codeclimate.com/github/feathersjs/authentication-azuread/test_coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/authentication-azuread.svg?style=flat-square)](https://david-dm.org/feathersjs/authentication-azuread)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/authentication-azuread.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-azuread)

> AzureAD authentication strategy for feathers-authentication using Passport without all the boilerplate.

## Installation

```
npm install @feathersjs/authentication-azuread --save
```

## Quick example

```js
const feathers = require('@feathersjs/feathers');
const authentication = require('feathers-authentication');
const azuread = require('@feathersjs/authentication-azuread');
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(azuread());

// Setup a hook to only allow valid JWTs or successful 
// azuread auth to authenticate and get new JWT access tokens
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['azuread-openidconnect', 'jwt'])
    ]
  }
});
```

## Documentation

Please refer to the [@feathersjs/authentication-azuread API documentation](https://docs.feathersjs.com/api/authentication/azuread.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
