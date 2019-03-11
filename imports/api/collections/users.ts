import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { MongoObservable, ObservableCursor } from 'meteor-rxjs';

import { Collection } from '../collections';

export interface IUser extends Meteor.User {
}

export const Users = new Collection<IUser>(Meteor.users);
export default Users;

if (Meteor.isServer) {
  Meteor.publish('users', function(query, options) {
    this.autorun(function() {
      return Users._collection.find(query, options);
    });
  });
}
