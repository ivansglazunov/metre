import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { onPageLoad } from 'meteor/server-render';
import { StaticRouter } from 'react-router';

import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { MuiThemeProvider, createGenerateClassName } from '@material-ui/core/styles';

import { Routes } from '../imports/components/routes';
import theme from '../imports/theme';

onPageLoad((sink: any) => {

  const sheetsRegistry = new SheetsRegistry();

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
