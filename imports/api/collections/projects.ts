

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import * as  _ from 'lodash';

import { wrapCollection } from '../collection';

// Interface
export interface IProject {
  _id?: string;
  input: any;
  schema: any;
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
});

Projects.attachSchema(Schema.Project);

// Server
if (Meteor.isServer) {

  // Publish
  Projects.publish(function(query, options) {
    return Projects.find(query, options);
  });

  // Access
  Projects.allow({
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
