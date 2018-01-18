/* eslint-disable no-unused-expressions */
const feathers = require('@feathersjs/feathers');
const expressify = require('@feathersjs/express');
const authentication = require('@feathersjs/authentication');
const memory = require('feathers-memory');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const passportAzureAD = require('passport-azure-ad');
const azuread = require('../lib');

const { Verifier } = azuread;
const { expect } = chai;

chai.use(sinonChai);

describe('@feathersjs/authentication-azuread', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof azuread).to.equal('function');
  });

  it('exposes default', () => {
    expect(azuread.default).to.equal(azuread);
  });

  it('exposes hooks', () => {
    expect(typeof azuread.hooks).to.equal('object');
  });

  it('exposes the Verifier class', () => {
    expect(typeof Verifier).to.equal('function');
    expect(typeof azuread.Verifier).to.equal('function');
  });

  describe('initialization', () => {
    let app;

    beforeEach(() => {
      app = expressify(feathers());
      app.use('/users', memory());
      app.configure(authentication({ secret: 'supersecret' }));
    });

    it('throws an error if passport has not been registered', () => {
      expect(() => {
        expressify(feathers()).configure(azuread());
      }).to.throw();
    });

    it('registers the azuread passport strategy', () => {
      sinon.spy(app.passport, 'use');
      sinon.spy(passportAzureAD, 'OIDCStrategy');
      app.configure(azuread());
      app.setup();

      expect(passportAzureAD.OIDCStrategy).to.have.been.calledOnce;
      expect(app.passport.use).to.have.been.calledWith('azuread-openidconnect');

      app.passport.use.restore();
      passportAzureAD.OIDCStrategy.restore();
    });

    it('registers the strategy options', () => {
      sinon.spy(app.passport, 'options');
      app.configure(azuread());
      app.setup();

      expect(app.passport.options).to.have.been.calledOnce;

      app.passport.options.restore();
    });

    describe('passport strategy options', () => {
      let authOptions;
      let args;

      beforeEach(() => {
        sinon.spy(passportAzureAD, 'OIDCStrategy');
        app.configure(azuread({ custom: true }));
        app.setup();
        authOptions = app.get('authentication');
        args = passportAzureAD.OIDCStrategy.getCall(0).args[0];
      });

      afterEach(() => {
        passportAzureAD.OIDCStrategy.restore();
      });

      it('sets usernameField', () => {
        expect(args.usernameField).to.equal('email');
      });

      it('sets passwordField', () => {
        expect(args.passwordField).to.equal('password');
      });

      it('sets entity', () => {
        expect(args.entity).to.equal(authOptions.entity);
      });

      it('sets service', () => {
        expect(args.service).to.equal(authOptions.service);
      });

      it('sets session', () => {
        expect(args.session).to.equal(authOptions.session);
      });

      it('sets passReqToCallback', () => {
        expect(args.passReqToCallback).to.equal(authOptions.passReqToCallback);
      });

      it('supports setting custom options', () => {
        expect(args.custom).to.equal(true);
      });
    });

    it('supports overriding default options', () => {
      sinon.spy(passportAzureAD, 'OIDCStrategy');
      app.configure(azuread({ usernameField: 'email' }));
      app.setup();

      expect(passportAzureAD.OIDCStrategy.getCall(0).args[0].usernameField).to.equal('email');

      passportAzureAD.OIDCStrategy.restore();
    });

    it('pulls options from global config', () => {
      sinon.spy(passportAzureAD, 'OIDCStrategy');
      let authOptions = app.get('authentication');
      authOptions.azuread = { usernameField: 'email' };
      app.set('authentication', authOptions);

      app.configure(azuread());
      app.setup();

      expect(passportAzureAD.OIDCStrategy.getCall(0).args[0].usernameField).to.equal('email');
      expect(passportAzureAD.OIDCStrategy.getCall(0).args[0].passwordField).to.equal('password');

      passportAzureAD.OIDCStrategy.restore();
    });

    it('pulls options from global config with custom name', () => {
      sinon.spy(passportAzureAD, 'OIDCStrategy');
      let authOptions = app.get('authentication');
      authOptions.custom = { usernameField: 'email' };
      app.set('authentication', authOptions);

      app.configure(azuread({ name: 'custom' }));
      app.setup();

      expect(passportAzureAD.OIDCStrategy.getCall(0).args[0].usernameField).to.equal('email');
      expect(passportAzureAD.OIDCStrategy.getCall(0).args[0].passwordField).to.equal('password');

      passportAzureAD.OIDCStrategy.restore();
    });

    describe('custom Verifier', () => {
      it('throws an error if a verify function is missing', () => {
        expect(() => {
          class CustomVerifier {
            constructor (app) {
              this.app = app;
            }
          }
          app.configure(azuread({ Verifier: CustomVerifier }));
          app.setup();
        }).to.throw();
      });

      //      it('verifies through custom verify function', () => {
      //        const User = {
      //          email: 'admin@feathersjs.com',
      //          password: 'password'
      //        };

      //        const req = {
      //          query: {},
      //          body: Object.assign({}, User),
      //          headers: {},
      //          cookies: {}
      //        };
      //        class CustomVerifier extends Verifier {
      //          verify (req, username, password, done) {
      //            expect(username).to.equal(User.email);
      //            expect(password).to.equal(User.password);
      //            done(null, User);
      //          }
      //        }

      //        app.configure(azuread({ Verifier: CustomVerifier }));
      //        app.setup();

      //        return app.authenticate('azuread-openidconnect')(req).then(result => {
      //          expect(result.data.user).to.deep.equal(User);
      //        });
      //      });
    });
  });
});
