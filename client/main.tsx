import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { Routes } from '../components/routes';

Meteor.startup(() => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <Routes/>
    </BrowserRouter>,
    document.getElementById('app'),
  );
});
