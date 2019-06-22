import * as bcrypt from 'bcrypt';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as Debug from 'debug';
import * as express from 'express';
import * as ExpressSession from 'express-session';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import * as nocache from 'nocache';
import * as passport from 'passport';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import * as React from 'react';

import { Metre } from './metre';
import { Users } from '../collections';
import { setRoles } from '../collections/users';

const debug = Debug('metre');

const bcryptHash = bcrypt && Meteor.wrapAsync(bcrypt.hash);
const bcryptCompare = bcrypt && Meteor.wrapAsync(bcrypt.compare);

Metre.serverPasswordHash = (passwordHash: string) => bcryptHash(passwordHash, Accounts._bcryptRounds());

Metre.comparePasswords = (passwordHash, passwordBcrypted: string) => bcryptCompare(passwordHash, passwordBcrypted);

Metre.initExpressAndPassport = () => {
  const app = express();
  
  const expressSession = ExpressSession({
    secret: 'metre',
    resave: true,
    saveUninitialized: true,
  });
  
  app.use(nocache());
  app.use(cookieParser());
  app.use(expressSession);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser(Meteor.bindEnvironment((user: any, callback) => {
    debug('serializeUser', user._id);
    callback(null, user._id);
  }));
  passport.deserializeUser(Meteor.bindEnvironment((id, callback) => {
    debug('deserializeUser', id);
    callback(null, Users._findOne(id));
  }));
  
  passport.use(new PassportLocalStrategy({ passReqToCallback: true }, Meteor.bindEnvironment((req, username, password, done) => {
    debug(`PassportLocalStrategy req.user${req.user?'+':'-'} username=${username}`);

    // ignore password for test
    let user = Users._findOne({ username });
    
    if (!user) {
      const userId = Users.insert({
        createdAt: new Date(),
        services: {
          password: {
            bcrypt: Metre.serverPasswordHash(password),
          },
        },
        username,
      });
      user = Users._findOne(userId);
      setRoles(userId, ['developer']);
    }

    if (!user || !user.services || !user.services.password) done(null, false);

    const compared = Metre.comparePasswords(password, user.services.password.bcrypt);
    if (!compared) {
      debug(`PassportLocalStrategy req.user${req.user?'+':'-'} username=${username} password false`);
      return done(null, false);
    }

    if (user) {
      const meteorToken = Accounts._generateStampedLoginToken();
      Accounts._insertLoginToken(user._id, meteorToken);
      debug(`PassportLocalStrategy req.user${req.user?'+':'-'} username=${username} done`);
      req._passportMeteorToken = meteorToken;
      return done(null, user);
    } else {
      debug(`PassportLocalStrategy req.user${req.user?'+':'-'} username=${username} user false`);
      return done(null, false);
    }
  })));
  
  app.post(
    '/passport/loginWidthUsernameAndPassword',
    passport.authenticate('local'),
    Meteor.bindEnvironment((req, res) => {
      res.send({
        userId: req.user ? req.user._id : undefined,
        meteorToken: req._passportMeteorToken,
      });
    }),
  );

  app.post(
    '/passport/logout',
    Meteor.bindEnvironment((req, res, next) => {
      req.logout();
      res.send({ userId: undefined });
    }),
  );

  app.post(
    '/passport/meteorToken',
    Meteor.bindEnvironment((req, res, next) => {
      debug(`/passport/meteorToken token: ${req.query.token} start`);
      if (req.query && req.query.token) {
        const user = Metre._findUserByToken(req.query.token);
        if (user) {
          return req.login(user, (error) => {
            debug(`/passport/meteorToken token: ${req.query.token} done`);
            return res.send({ userId: error ? undefined : user._id });
          });
        }
      }
      debug(`/passport/meteorToken token: ${req.query.token} fail`);
      return res.send({ userId: undefined });
    }),
  );

  WebApp.connectHandlers.use(app);

  return app;
};

Metre._findUserByToken = (token) => {
  return Users._findOne({
    'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token)
  });
};
