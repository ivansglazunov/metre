

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../../collection';
import { TPositions, NestedSets } from '../../nested-sets';

/**
 * Numeric options in formula format.
 * Can't be used as native numbers! Only used math.js evaluations.
 */

// Interface
export interface INode {
  _id?: string;
  positions?: TPositions;
  values?: INum[];
  abc?: String;
}

export interface INum {
  _id?: string;
  value: string;
  name: string;
}

// Collection
export const Nodes = wrapCollection(new Mongo.Collection<INode>('nodes'));
export default Nodes;
// @ts-ignore
Meteor.nodes = Nodes;

// NestedSets
const ns = new NestedSets();
ns.init({
  collection: Nodes,
  field: 'positions',
});

// SchemaRules
export const SchemaRules: any = {};

SchemaRules.Values = {
  'values': {
    type: Array,
    optional: true,
  },
  'values.$': Object,
  'values.$._id': String,
  'values.$.value': String,
  'values.$.name': String,
};

// Schema
export const Schema: any = {};

Schema.Values = new SimpleSchema(SchemaRules.Values);

Schema.Node = new SimpleSchema({
  ...ns.SimpleSchemaRules(),
  ...SchemaRules.Values,
  abc: {
    type: String,
    optional: true,
  },
});

// Nodes.attachSchema(Schema.Node);

// Server
if (Meteor.isServer) {
  // Publish
  Nodes.publish(function(query, options) {
    return Nodes.find(query, options);
  });

  // Access
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

  // Methods
  Schema.NestedSets = {};
  
  Schema.NestedSets.Put = new SimpleSchema({
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
  });

  Schema.NestedSets.Pull = new SimpleSchema({
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
  });
  
  Schema.NestedSets.Move = new SimpleSchema({
    put: Schema.NestedSets.Put,
    pull: Schema.NestedSets.Pull,
  });

  Meteor.methods({
    'nodes.reset'(){
      Nodes.remove({});
      for (let i = 0; i < 100; i++) {
        const values = [];
        for (let n = 0; n < _.random(0, 4); n++) {
          values.push({
            _id: Random.id(),
            value: `${_.random(0, 99999)}`,
            name: _.random(0,1) ? 'width' : 'height',
          });
        }
        Nodes.insert({
          values,
        });
      }
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
