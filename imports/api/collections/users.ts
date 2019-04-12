import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { wrapCollection } from '../collection';

export interface IUser extends Meteor.User {}

export const Users = wrapCollection(Meteor.users);
export default Users;

if (Meteor.isServer) {
  Meteor.publish('users', function(query, options) {
    this.autorun(function() {
      return Users.find(query, options);
    });
  });
  Users.allow({
    insert(userId, doc) {
      return true;
    },
    update(userId, doc, fieldNames, modifier) {
      return true;
    },
    remove(userId, doc) {
      return true;
    },
  });
}
