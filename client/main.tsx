import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server';
import { onPageLoad } from 'meteor/server-render';
import { StaticRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { Routes } from '../components/routes';

Meteor.startup(() => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <Routes/>
    </BrowserRouter>,
    document.getElementById("app"),
  );
});