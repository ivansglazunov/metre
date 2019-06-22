

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import * as  _ from 'lodash';

import { wrapCollection } from '../metre/collection';

// Interface
export interface IProject {
  _id?: string;
  input: any;
  schema: any;
  title?: string;
  description?: string;
  status?: boolean;
  ownerUserId?: string;
  createdTime?: number;
}

// Collection
export const Projects = wrapCollection(new Mongo.Collection<IProject>('projects'));
export default Projects;
// @ts-ignore
Meteor.projects = Projects;

// Schema
export const Schema: any = {};

Schema.Project = new SimpleSchema({
  _id: {
    type: String,
  },
  input: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  schema: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  title: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  status: {
    type: Boolean,
    optional: true,
  },
  ownerUserId: {
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) return this.userId;
      else this.unset();
    }
  },
  createdTime: {
    type: Number,
    optional: true,
    autoValue() {
      if (!this.value) return new Date().valueOf();
    },
  },
});

Projects.attachSchema(Schema.Project);

// Publish
Projects.publish(function(query = {}, options = {}) {
  const $and: any[] = [{
    $or: [
      { ownerUserId: this.userId },
      { status: true },
    ],
  }];
  const q = { $and, };
  if (!_.isEmpty(query)) $and.push(query);
  return Projects._find(q, options);
});

// Server
if (Meteor.isServer) {

  // Access
  Projects.allow({
    insert(userId, doc) {
      return true;
    },
    update(userId, doc, fieldNames, modifier) {
      return doc.ownerUserId === userId;
    },
    remove(userId, doc) {
      return doc.ownerUserId === userId;
    },
  });
}
