import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { onPageLoad } from 'meteor/server-render';
import { StaticRouter } from 'react-router';

import { Helmet } from 'react-helmet';  

import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { MuiThemeProvider, createGenerateClassName } from '@material-ui/core/styles';

import { Routes } from '../imports/react/routes';
import theme from '../imports/react/theme';

global.metreServerSubs = undefined;

const subscribePlaceholderStop = () => {};
const subscribePlaceholderReady = () => true;

Meteor.subscribe = (name?, query?, options?, callback?) => {
  return {
    stop: subscribePlaceholderStop,
    ready: subscribePlaceholderReady,
    subscriptionId: Random.id(),
  };
};

onPageLoad((sink: any) => {

  const sheetsRegistry = new SheetsRegistry();

  const generateClassName = createGenerateClassName();

  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());

  global.metreServerSubs = [];

  sink.renderIntoElementById('app', renderToString(
    <StaticRouter location={sink.request.url} context={{}}>
      <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
          <Routes/>
        </MuiThemeProvider>
      </JssProvider>
    </StaticRouter>,
  ));
  
  // @ts-ignore
  InjectData.pushData(sink.request, 'metreServerSubs', global.metreServerSubs);
  global.metreServerSubs = undefined;

  sink.appendToHead(`<style>${sheetsRegistry.toString()}</style>`);
});
