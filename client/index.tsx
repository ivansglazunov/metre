import { Meteor } from 'meteor/meteor';
import { LocalCollection } from 'meteor/minimongo';
import * as  _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from '@material-ui/styles';

import { Routes } from '../imports/react/routes';

import Metre from '../imports/api/metre/client';
import MetreClientAccounts from '../imports/api/metre/client-accounts';

MetreClientAccounts();
Metre.initSSR();
Metre.onPageLoad((userId) => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <Routes userId={userId}/>
    </BrowserRouter>,
    document.getElementById('app'),
  );
});
