import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { onPageLoad } from 'meteor/server-render';
import { StaticRouter } from 'react-router';

import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { MuiThemeProvider, createMuiTheme, createGenerateClassName } from '@material-ui/core/styles';

import { Routes } from '../components/routes';

onPageLoad((sink) => {

  const sheetsRegistry = new SheetsRegistry();

  const theme = createMuiTheme({
  });

  const generateClassName = createGenerateClassName();

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
