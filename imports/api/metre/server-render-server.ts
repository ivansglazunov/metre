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
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles';
import * as _ from 'lodash';
import { Random } from 'meteor/random';
import { onPageLoad as _onPageLoad } from 'meteor/server-render';
import { renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';
import { StaticRouter } from 'react-router';

import { Metre } from './metre';
import { Users } from '../collections';

const debug = Debug('metre');

Metre._clearSSR = () => {
  Metre._SSRSubs = [];
  Metre._SSRCalls = {};
};

Metre._subscribePlaceholderStop = () => {};
Metre._subscribePlaceholderReady = () => true;

Metre.initSSR = () => {
  Metre._clearSSR();

  const _oldWebAppCategorizeRequest = WebApp.categorizeRequest;
  WebApp.categorizeRequest = function(req) {
    const request = _oldWebAppCategorizeRequest.call(this, req);
    request._req = req;
    return request;
  };

  Meteor.subscribe = (name?, query?, options?, callback?) => {
    return {
      stop: Metre._subscribePlaceholderStop,
      ready: Metre._subscribePlaceholderReady,
      subscriptionId: Random.id(),
    };
  };
};

Metre.onPageLoad = (callback: (sink: any, req: any, userId?: string) => void) => {
  _onPageLoad((sink: any) => {
    Metre._clearSSR();

    const user = sink.request._req.user;
    const userId = user ? user._id : undefined;

    Metre.__serverRender = true;
    Metre.userId = userId;
    
    callback(sink, sink.request._req, userId);
    
    // @ts-ignore
    InjectData.pushData(sink.request, 'metreServerSubs', {
      subs: global.metreServerSubs,
      calls: global.metreServerCalls,
      userId,
    });

    Metre.userId = undefined;
    delete Metre.__serverRender;
  });
};