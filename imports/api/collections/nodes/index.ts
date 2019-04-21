

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
};

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
    'nodes.put'(options) {
      Schema.NestedSets.Put.validate(options);
      ns.put(options);
    },
  });
}
