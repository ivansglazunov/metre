

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../collection';

// Interface
export interface ITry {
  _id?: string;
  projectId: string;
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

// Server
if (Meteor.isServer) {

  // Publish
  Tries.publish(function(query, options) {
    return Tries.find(query, options);
  });

  // Access
  Tries.allow({
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
