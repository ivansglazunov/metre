import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider, createGenerateClassName } from '@material-ui/core/styles';

import { Routes } from '../imports/react/routes';
import theme from '../imports/react/theme';
import { client } from '../imports/api/client';
import * as Collections from '../imports/api/collections';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

import 'normalize.css';

Meteor.startup(() => {
  var originalSend = Meteor.connection._send;
  Meteor.connection._send = () => {};
  // @ts-ignore
  InjectData.getData('metreServerSubs', function(data) {
    for (let i = 0; i < data.length; i++) {
      const name = data[i].name;
      const collection = Collections[capitalizeFirstLetter(name)];
      if (collection) {
        for (let d = 0; d < data[i].docs.length; d++) {
          const doc = data[i].docs[d];
          collection._collection.insert(doc);
        }
        const originBeginUpdate = Meteor.connection._stores[name].beginUpdate;
        Meteor.connection._stores[name].beginUpdate = () => {};
        const originUpdate = Meteor.connection._stores[name].update;
        Meteor.connection._stores[name].update = (msg) => {
          // @ts-ignore
          var doc = collection._collection.findOne(msg.id);
          if (!(msg.msg === 'added' && doc)) return originUpdate(msg);
        };
      }
    }
  
    ReactDOM.hydrate(
      <BrowserRouter>
        <MuiThemeProvider theme={theme}>
          <Routes/>
        </MuiThemeProvider>
      </BrowserRouter>,
      document.getElementById('app'),
    );

    Meteor.connection._send = originalSend;
  });
});
