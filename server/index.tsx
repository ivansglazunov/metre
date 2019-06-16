import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { WebApp } from 'meteor/webapp';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';
import { StaticRouter } from 'react-router';

import { wrapCollection } from '../imports/api/metre/collection';
import { Nodes, Users } from '../imports/api/collections';
import Metre from '../imports/api/metre/server';
import { Routes } from '../imports/react/routes';

Nodes; Users; wrapCollection;

const app = Metre.initExpressAndPassport();
Metre.initSSR();
Metre.onPageLoad((sink: any, req, userId) => {
  const sheets = new ServerStyleSheets();

  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());

  sink.renderIntoElementById('app', renderToString(
    sheets.collect(
      <StaticRouter location={sink.request.url} context={{}}>
        <Routes userId={userId}/>
      </StaticRouter>,
    ),
  ));

  sink.appendToHead(`<style>${sheets.toString()}</style>`);
});
