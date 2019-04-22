

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../../collection';
import { IPosition, NestedSets } from '../../nested-sets';

export interface INode {
  _id?: string;
  positions?: IPosition[];
}

export const Nodes = wrapCollection(new Mongo.Collection<INode>('nodes'));
export default Nodes;
// @ts-ignore
Meteor.nodes = Nodes;

export const Schema: any = {};

Schema.NestedSets = {
  Put: new SimpleSchema({
    tree: String,
    docId: String,
    parentId: {
      type: String,
      optional: true,
    },
    space: {
      type: String,
      optional: true,
    },
  }),
  Pull: new SimpleSchema({
    positionId: {
      type: String,
      optional: true,
    },
    docId: {
      type: String,
      optional: true,
    },
    parentId: {
      type: String,
      optional: true,
    },
  }),
};

Schema.NestedSets.Move = new SimpleSchema({
  put: Schema.NestedSets.Put,
  pull: Schema.NestedSets.Pull,
}),

Schema.Node = new SimpleSchema({
  'positions': {
    type: Array,
    optional: true
  },
  'positions.$': Object,
  'positions.$._id': String,
  'positions.$.parentId': {
    type: String,
    optional: true,
  },
  'positions.$.tree': String,
  'positions.$.space': String,
  'positions.$.left': String,
  'positions.$.right': String,
  'positions.$.depth': String,
});

Nodes.attachSchema(Schema.Node);

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

  const ns = new NestedSets();
  ns.init({
    collection: Nodes,
    field: 'positions',
  });

  Meteor.methods({
    'nodes.reset'(){
      Nodes.remove({});
    },
    async 'nodes.put'(options) {
      Schema.NestedSets.Put.validate(options);
      await ns.put(options);
    },
    async 'nodes.pull'(options) {
      Schema.NestedSets.Pull.validate(options);
      await ns.pull(options);
    },
    async 'nodes.move'(options) {
      Schema.NestedSets.Move.validate(options);
      await ns.put(options.put);
      await ns.pull(options.pull);
    },
  });
}
