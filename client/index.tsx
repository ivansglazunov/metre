import { Meteor } from 'meteor/meteor';
import { LocalCollection } from 'meteor/minimongo';
import _ from 'lodash';
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

global.metreClientCalls = {};

Meteor.startup(() => {
  var originalSend = Meteor.connection._send;
  Meteor.connection._send = () => {};
  // @ts-ignore
  InjectData.getData('metreServerSubs', function(metreArgs) {
    if (metreArgs) {
      const { calls, subs } = metreArgs;

      global.metreClientCalls = calls;
      
      for (let i = 0; i < subs.length; i++) {
        const name = subs[i].name;
        const collection = Collections[capitalizeFirstLetter(name)];
        if (collection) {
          for (let d = 0; d < subs[i].docs.length; d++) {
            const doc = subs[i].docs[d];
            collection._collection.insert(doc);
          }
          const originLocalInsert = LocalCollection.prototype.insert;
          LocalCollection.prototype.insert = function(doc, callback) {
            if (this._docs.has(doc._id)) return doc._id;
            return originLocalInsert.call(this, doc, callback);
          };
          const originBeginUpdate = Meteor.connection._stores[name].beginUpdate;
          Meteor.connection._stores[name].beginUpdate = () => {};
          const originUpdate = Meteor.connection._stores[name].update;
          Meteor.connection._stores[name].update = function(msg) {
            // @ts-ignore
            var doc = collection._collection.findOne(msg.id);
            if (!(msg.msg === 'added' && doc)) return originUpdate.call(this, msg);
          };
        }
      }
    }
  
    ReactDOM[_.get(Meteor, 'settings.public.server', true) !== false ? 'hydrate' : 'render'](
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
