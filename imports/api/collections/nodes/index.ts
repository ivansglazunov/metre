

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../../collection';
import {
  nodesPut,
  nodesPull,
  nodesMove,
} from './methods';

export interface INodeText {
  format: string;
  body: string;
}

export interface INodeIn {
  parentId: string;
  space: string;
  left: number;
  right: number;
  depth: number;
}

export interface INodeSelect {
  left: number[];
  right: number[];
  minDepth: number[];
  maxDepth: number[];
}

export interface INode {
  _id?: string;
  text?: { [title: string]: INodeText[] };
  in?: { [tree: string]: INodeIn };
  select: { [tree: string]: INodeSelect[] };
}

export const Nodes = wrapCollection(new Mongo.Collection<INode>('nodes'));
export default Nodes;
// @ts-ignore
Meteor.nodes = Nodes;

export const Schema: any = {};

Schema.Node = new SimpleSchema({
  'text': {
    type: Array,
    optional: true
  },
  'text.$': Object,
  'text.$.name': String,
  'text.$.format': String,
  'text.$.body': String,
});

// Nodes.attachSchema(Schema.Node);

if (Meteor.isServer) {
  Meteor.publish('nodes', function(query, options) {
    this.autorun(function() {
      return Nodes.find(query, options);
    });
  });

  Nodes.allow({
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

  Meteor.methods({
    [`nodes.put`]: nodesPut,
    [`nodes.pull`]: nodesPull,
    [`nodes.move`]: nodesMove,
    [`nodes.reset`]: () => {
      Nodes.find().forEach(n => Nodes.remove(n._id))
      Nodes.insert({ in: { nesting: { space: Random.id(), left: 0, right: 1, depth: 0 } } });
    },
  });
}

Nodes.helpers({
  put(tree: string, nodeId: string) {
    Meteor.call('nodes.put', tree, this._id, nodeId);
  },
  pull(tree: string) {
    Meteor.call('nodes.pull', tree, this._id);
  },
  move(tree: string, parentId: string) {
    Meteor.call('nodes.move', tree, this._id, parentId);
  },
});
