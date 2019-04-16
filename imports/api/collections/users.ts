import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import SimpleSchema from 'simpl-schema';

import { wrapCollection } from '../collection';

export interface IUser extends Meteor.User {}

export const Users = wrapCollection(Meteor.users);
export default Users;

export const Schema: any = {};

Schema.UserProfile = new SimpleSchema({
  firstname: {
    type: String,
    optional: true
  },
  lastname: {
    type: String,
    optional: true
  },
  secondname: {
    type: String,
    optional: true
  },
});

Schema.User = new SimpleSchema({
  username: {
    type: String,
    optional: true
  },
  emails: {
    type: Array,
    optional: true
  },
  'emails.$': {
    type: Object
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
  'emails.$.verified': {
    type: Boolean
  },
  registered_emails: {
    type: Array,
    optional: true
  },
  'registered_emails.$': {
    type: Object,
    blackbox: true
  },
  createdAt: {
    type: Date
  },
  profile: {
    type: Schema.UserProfile,
    optional: true,
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  roles: {
    type: Object,
    optional: true,
    blackbox: true
  },
  heartbeat: {
    type: Date,
    optional: true
  },
});

Users.attachSchema(Schema.User);

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
