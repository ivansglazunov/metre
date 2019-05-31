import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as  _ from 'lodash';

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { onPageLoad } from 'meteor/server-render';
import { StaticRouter } from 'react-router';

import { Helmet } from 'react-helmet';  

import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles';

import { Routes } from '../imports/react/routes';
import theme from '../imports/react/theme';

import { Users, Nodes } from '../imports/api/collections';
import { wrapCollection } from '../imports/api/collection';

Nodes; Users; wrapCollection;

global.metreServerSubs = [];
global.metreServerCalls = {};

const subscribePlaceholderStop = () => {};
const subscribePlaceholderReady = () => true;

Meteor.subscribe = (name?, query?, options?, callback?) => {
  return {
    stop: subscribePlaceholderStop,
    ready: subscribePlaceholderReady,
    subscriptionId: Random.id(),
  };
};

if (_.get(Meteor, 'settings.public.server', true) !== false) onPageLoad((sink: any) => {
  const sheets = new ServerStyleSheets();

  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());

  global.metreServerSubs = [];
  global.metreServerCalls = {};

  sink.renderIntoElementById('app', renderToString(
    sheets.collect(
      <StaticRouter location={sink.request.url} context={{}}>
        <ThemeProvider theme={theme}>
          <Routes/>
        </ThemeProvider>
      </StaticRouter>,
    ),
  ));
  
  // @ts-ignore
  InjectData.pushData(sink.request, 'metreServerSubs', { subs: global.metreServerSubs, calls: global.metreServerCalls });
  global.metreServerSubs = undefined;
  global.metreServerCalls = undefined;

  sink.appendToHead(`<style>${sheets.toString()}</style>`);
});
