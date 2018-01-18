const Debug = require('debug');
const merge = require('lodash.merge');
const omit = require('lodash.omit');
const pick = require('lodash.pick');
const hooks = require('./hooks');
const DefaultVerifier = require('./verifier');

const passportAzureAD = require('passport-azure-ad');

const debug = Debug('@feathersjs/authentication-azuread');
const defaults = {
  name: 'azuread-openidconnect',
  usernameField: 'email',
  passwordField: 'password',
  identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
  clientID: '<client-id>',
  clientSecret: '<client-secret>',
  responseType: 'code',
  responseMode: 'form_post',
  redirectUrl: 'https://localhost/callback',
  allowHttpForRedirectUrl: false,
  isB2C: false,
  passReqToCallback: true
};

const KEYS = [
  'entity',
  'service',
  'passReqToCallback',
  'session'
];

function init (options = {}) {
  return function azureadAuth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before @feathersjs/authentication-azuread?`);
    }

    let name = options.name || defaults.name;
    let authOptions = app.get('authentication') || {};
    let azureadOptions = authOptions[name] || {};

    // NOTE (EK): Pull from global auth config to support legacy auth for an easier transition.
    const azureadSettings = merge({}, defaults, pick(authOptions, KEYS), azureadOptions, omit(options, ['Verifier']));
    let Verifier = DefaultVerifier;

    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    if (!azureadSettings.identityMetadata) {
      throw new Error(`You must provide 'identityMetadata' option.`);
    }

    if (!azureadSettings.clientID) {
      throw new Error(`You must provide 'clientID' option.`);
    }

    if (!azureadSettings.redirectUrl) {
      throw new Error(`You must provide 'redirectUrl' option.`);
    }

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, azureadSettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a azuread passport verify callback.`);
      }

      // Register 'azuread' strategy with passport
      debug('Registering azuread authentication strategy with options:', azureadSettings);
      app.passport.use(azureadSettings.name, new passportAzureAD.OIDCStrategy(azureadSettings, verifier.verify.bind(verifier)));
      app.passport.options(azureadSettings.name, azureadSettings);

      return result;
    };
  };
}

module.exports = init;

// Exposed Modules
Object.assign(module.exports, {
  default: init,
  defaults,
  hooks,
  Verifier: DefaultVerifier
});
