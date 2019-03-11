import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider, createGenerateClassName } from '@material-ui/core/styles';

import { Routes } from '../imports/react/routes';
import theme from '../imports/react/theme';
import { client } from '../imports/api/client';

Meteor.startup(() => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <Routes/>
      </MuiThemeProvider>
    </BrowserRouter>,
    document.getElementById('app'),
  );
});
