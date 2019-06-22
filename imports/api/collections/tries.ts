

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import * as  _ from 'lodash';

import { wrapCollection } from '../metre/collection';
import { isInRole } from './users';

// Interface
export interface ITry {
  _id?: string;
  projectId: string;
  userId: string;
  createdTime?: number;
  completedTime?: number;
  speed?: number;
  errors?: any;
  schemaError?: any;
}

// Collection
export const Tries = wrapCollection(new Mongo.Collection<ITry>('tries'));
export default Tries;
// @ts-ignore
Meteor.tries = Tries;

// Schema
export const Schema: any = {};

Schema.Try = new SimpleSchema({
  _id: {
    type: String,
  },
  projectId: {
    type: String,
  },
  userId: {
    type: String,
  },
  createdTime: {
    type: Number,
    optional: true,
    autoValue() {
      if (!this.value) return new Date().valueOf();
    },
  },
  completedTime: {
    type: Number,
    optional: true,
  },
  speed: {
    type: Number,
    optional: true,
  },
  'errors': {
    type: Array,
    optional: true,
  },
  'errors.$': {
    type: Object,
    blackbox: true,
  },
  'schemaError': {
    type: Object,
    optional: true,
    blackbox: true,
  },
});

Tries.attachSchema(Schema.Try);

// Publish
Tries.publish(function(query = {}, options = {}) {
  // @ts-ignore
  const user = Meteor.users._findOne(this.userId);

  if (!isInRole(user, 'developer') && !isInRole(user, 'owner') && !isInRole(user, 'admin')) return Tries._find({ _id: null });

  const $and: any[] = [];
  if (!_.isEmpty(query)) $and.push(query);
  if (isInRole(user, 'developer')) $and.push({ userId: this.userId });
  const q = _.isEmpty($and) ? query : { $and };
  return Tries._find(q, options);
});

// Server
if (Meteor.isServer) {

  // Access
  Tries.allow({
    insert(userId, doc) {
      return false;
    },
    update(userId, doc, fieldNames, modifier) {
      return false;
    },
    remove(userId, doc) {
      return false;
    },
  });
}
