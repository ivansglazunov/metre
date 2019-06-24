import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import SimpleSchema from 'simpl-schema';

import { wrapCollection } from '../metre/collection';

// Interface
export interface IUser extends Meteor.User {}

// Collection
export const Users = wrapCollection(Meteor.users);
export default Users;

// Schema
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

export const isInRole = (user, role, group = Roles.GLOBAL_GROUP) => {
  return !!(user && user.roles && user.roles[group] && ~user.roles[group].indexOf(role));
};

export const setRoles = (userId, roles: any[], group = Roles.GLOBAL_GROUP) => {
  return Roles.setUserRoles(userId, roles, group);
};

// Publish
Users.publish(function(query, options) {
  // @ts-ignore
  const user = Meteor.users._findOne(this.userId);

  if (isInRole(user, 'admin') || isInRole(user, 'owner')) {
    return Users._find(typeof(query) === 'string' ? { _id: query } : query, { fields: {
      username: 1, roles: 1,
    } });
  } else {
    return Users._find({ _id: this.userId || null }, { fields: {
      username: 1, roles: 1,
    } });
  }
});

// Server
if (Meteor.isServer) {
  // Access
  Users.allow({
    insert(userId, doc) {
      return true;
    },
    update(userId, doc, fieldNames, modifier) {
      return isInRole(Users._findOne(userId), 'admin') || userId === doc._id;
    },
    remove(userId, doc) {
      return true;
    },
  });

  // Access
  // @ts-ignore
  Meteor.roles.allow({
    insert(userId, doc) {
      return isInRole(Users._findOne(userId), 'admin');
    },
    update(userId, doc, fieldNames, modifier) {
      return isInRole(Users._findOne(userId), 'admin');
    },
    remove(userId, doc) {
      return isInRole(Users._findOne(userId), 'admin');
    },
  });
}
