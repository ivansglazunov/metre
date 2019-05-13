

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../collection';
import { TPositions, NestedSets } from '../nested-sets';

/**
 * Numeric options in formula format.
 * Can't be used as native numbers! Only used math.js evaluations.
 */

// Interface
export interface INode {
  _id?: string;
  positions?: TPositions;
  values?: IValueTypes;
}

export interface IValueTypes {
  [type: string]: IValueType;
}

export interface IValueType {
  _id?: string;
  values: any[];
}

export interface IValue {
  _id?: string;
  [key: string]: any;
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
    type: Object,
    blackbox: true,
    optional: true,
  },
};

// Schema
export const Schema: any = {};

Schema.Values = new SimpleSchema(SchemaRules.Values);

Schema.Node = new SimpleSchema({
  ...ns.SimpleSchemaRules(),
  ...SchemaRules.Values,
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
        const values = {
          height: { _id: Random.id(), type: 'formula', values: [] },
          width: { _id: Random.id(), type: 'formula', values: [] },
        };
        for (let n = 0; n < _.random(0, 4); n++) {
          const type = _.random(0, 1) ? 'height' : 'width';
          values[type].values.push({
            _id: Random.id(),
            value: `${_.random(0, 99999)}`,
          });
        }
        Nodes.insert({
          values,
        });
      }
    },
    'nodes.values.set'(docId, type, value) {
      if (!(typeof(value) === 'object' && typeof(value._id) === 'string')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = Nodes.findOne(docId);
      if (!node) throw new Error(`Node ${docId} not founded.`);
      if (!_.get(node, `values.${type}.values`)) throw new Error(`Node ${docId} not includes values type [type].`);
      let index = -1;
      for (let i = 0; i < node.values[type].values.length; i++) {
        if (node.values[type].values[i]._id === value._id) index = i;
      }
      if (!~index) throw new Error(`Node ${docId} not includes valueId ${value._id} in type ${type}.`);
      const $set = {};
      const keys = _.keys(value);
      for (let k = 0; k < keys.length; k++) {
        $set[`values.${type}.values.${index}.${keys[k]}`] = value[keys[k]];
      }
      Nodes.update(docId, { $set });
    },
    'nodes.values.push'(docId, type, value) {
      if (!(typeof(value) === 'object')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = Nodes.findOne(docId);
      if (!node) throw new Error(`Node ${docId} not founded.`);
      Nodes.update(docId, { $push: {
        [`values.${type}.values`]: { ...value, _id: Random.id() },
      } });
    },
    'nodes.values.pull'(docId, type, valueId) {
      if (!(typeof(valueId) === 'string')) {
        throw new Error(`Invalid valueId ${valueId}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = Nodes.findOne(docId);
      if (!node) throw new Error(`Node ${docId} not founded.`);
      Nodes.update(docId, { $pull: {
        [`values.${type}.values`]: { _id: valueId },
      } });
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
