import { Meteor } from 'meteor/meteor';
import { LocalCollection } from 'meteor/minimongo';

import { Metre } from './metre';

Metre.initSSR = () => {
  Metre._SSRCalls = {};
};

Metre.onPageLoad = (callback: (userId: string) => void) => {
  var originalSend = Meteor.connection._send;
  Meteor.connection._send = () => {};
  Meteor.startup(() => {
    // @ts-ignore
    InjectData.getData('metreServerSubs', function(metreArgs) {
      if (metreArgs) {
        const calls = metreArgs.calls || [];
        const subs = metreArgs.subs || [];

        Metre.initClient(metreArgs.userId);

        Metre._SSRCalls = calls;
        
        for (let i = 0; i < subs.length; i++) {
          const name = subs[i].name;
          let collection: any;
          // @ts-ignore
          collection =-Mongo.Collection.get(name);
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
      } else Meteor.connection._send = originalSend;

      callback(Metre.userId);

      if (metreArgs) Meteor.connection._send = originalSend;
    });
  });
};
