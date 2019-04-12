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

onPageLoad((sink: any) => {

  const sheetsRegistry = new SheetsRegistry();

  const generateClassName = createGenerateClassName();

  const helmet = Helmet.renderStatic();
  sink.appendToHead(helmet.meta.toString());
  sink.appendToHead(helmet.title.toString());

  sink.renderIntoElementById('app', renderToString(
    <StaticRouter location={sink.request.url} context={{}}>
      <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
          <Routes/>
        </MuiThemeProvider>
      </JssProvider>
    </StaticRouter>,
  ));

  sink.appendToHead(`<style>${sheetsRegistry.toString()}</style>`);
});
