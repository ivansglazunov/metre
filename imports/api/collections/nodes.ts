

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import * as _ from 'lodash';

import { wrapCollection } from '../collection';
import { TPositions, NestedSets } from '../nested-sets';
import { IPosition } from '../nested-sets/index';
import { mathEval } from '../math';

/**
 * Numeric options in formula format.
 * Can't be used as native numbers! Only used math.js evaluations.
 */

// Interface
export interface INode {
  _id?: string;
  positions?: TPositions;
  formulas?: IValueTypes;
  ___nsUsedPosition?: IPosition;
  ___nsRootUserPosition?: IPosition;
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

SchemaRules.Formulas = {
  'formulas': {
    type: Object,
    blackbox: true,
    optional: true,
  },
};

// Schemas

export const Schema: any = {};

Schema.Formulas = new SimpleSchema(SchemaRules.Formulas);

Schema.Node = new SimpleSchema({
  ...ns.SimpleSchemaRules(),
  ...SchemaRules.Formulas,
});

Nodes.attachSchema(Schema.Node);

// Helpers

// ns

Nodes.helpers({
  p(name?: string) {
    let pos;
    if (this.___nsUsedPosition) pos = this.___nsUsedPosition;
    if (name && this.positions) {
      for (let p = 0; p < this.positions.length; p++) {
        const position = this.positions[p];
        if (position.name === name) {
          pos = position;
          break;
        }
      }
    }
    return pos && Nodes.findOne(pos.parentId, { subscribe: false });
  },
  __nsChildren({ tree, space }: any = {}, options?: any): INode[] {
    const $or = [];
    if (this.positions) for (let p = 0; p < this.positions.length; p++) {
      const pos = this.positions[p];
      if (
        (typeof(tree) === 'string' && tree === pos.tree) || (typeof(tree) !== 'string')
        &&
        (typeof(space) === 'string' && space === pos.space) || (typeof(space) !== 'string')
      ) {
        const $elemMatch: any = {};
        if ((typeof(tree) === 'string' && tree === pos.tree)) {
          $elemMatch.tree = tree;
        }
        if ((typeof(space) === 'string' && space === pos.space)) {
          $elemMatch.space = space;
        }
        $elemMatch.left = { $gt: pos.left };
        $elemMatch.right = { $lt: pos.right };
        $or.push({ 'positions': { $elemMatch } });
      }
    }
    return Nodes.find($or.length ? { $or } : { _id: { $exists: false } }).fetch();
  },
  __nsPositions({ tree, space, root }: any = {}, options?: any): INode[] {
    const nodes = this.__nsChildren({ tree, space }, options);
    let results = [];
    for (let n = 0; n < nodes.length; n++) {
      const node = nodes[n];
      for (let p = 0; p < node.positions.length; p++) {
        const doc = Nodes.findOne(node._id, { subscribe: false });
        const position = doc.positions[p];
        if (
          (typeof(tree) === 'string' && tree === position.tree) || (typeof(tree) !== 'string')
          &&
          (typeof(space) === 'string' && space === position.space) || (typeof(space) !== 'string')
        ) {
          doc.___nsUsedPosition = position;
          if (root) doc.___nsRootUserPosition = root;
          results.push(doc);
        }
      }
    }
    results = _.sortBy(results, n => n.___nsUsedPosition.left);
    return results;
  },
});

// formulas

Nodes.helpers({
  f(key) {
    return this.formulaEval(_.get(this, `formulas.${key}.values.0.value`)).value;
  },
  formulaEval(exp) {
    return mathEval(exp, { n: this });
  },
});

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

  // Schemas NS

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
    tree: {
      type: String,
      optional: true,
    },
  });

  Schema.NestedSets.Name = new SimpleSchema({
    positionId: {
      type: String,
      optional: true,
    },
    parentId: {
      type: String,
      optional: true,
    },
    tree: {
      type: String,
      optional: true,
    },
    docId: {
      type: String,
    },
    name: {
      type: String,
    }
  });
  
  Schema.NestedSets.Move = new SimpleSchema({
    put: Schema.NestedSets.Put,
    pull: Schema.NestedSets.Pull,
    name: Schema.NestedSets.Name,
  });

  // methods

  // demo
  Meteor.methods({
    'nodes.reset'(){
      Nodes.remove({});
      for (let i = 0; i < 100; i++) {
        const formulas = {
          height: { _id: Random.id(), type: 'formula', values: [] },
          width: { _id: Random.id(), type: 'formula', values: [] },
        };
        for (let n = 0; n < _.random(0, 4); n++) {
          const type = _.random(0, 1) ? 'height' : 'width';
          formulas[type].values.push({
            _id: Random.id(),
            value: `${_.random(0, 99999)}`,
          });
        }
        Nodes.insert({
          formulas,
        });
      }
    },
  });
  
  // value
  Meteor.methods({
    'nodes.formulas.set'(docId, type, value) {
      if (!(typeof(value) === 'object' && typeof(value._id) === 'string')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = Nodes.findOne(docId);
      if (!node) throw new Error(`Node ${docId} not founded.`);
      if (!_.get(node, `formulas.${type}.values`)) throw new Error(`Node ${docId} not includes values type [type].`);
      let index = -1;
      for (let i = 0; i < node.formulas[type].values.length; i++) {
        if (node.formulas[type].values[i]._id === value._id) index = i;
      }
      if (!~index) throw new Error(`Node ${docId} not includes valueId ${value._id} in type ${type}.`);
      const $set = {};
      const keys = _.keys(value);
      for (let k = 0; k < keys.length; k++) {
        $set[`formulas.${type}.values.${index}.${keys[k]}`] = value[keys[k]];
      }
      Nodes.update(docId, { $set });
    },
    'nodes.formulas.push'(docId, type, value) {
      if (!(typeof(value) === 'object')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = Nodes.findOne(docId);
      if (!node) throw new Error(`Node ${docId} not founded.`);
      Nodes.update(docId, { $push: {
        [`formulas.${type}.values`]: { ...value, _id: Random.id() },
      } });
    },
    'nodes.formulas.pull'(docId, type, valueId) {
      if (!(typeof(valueId) === 'string')) {
        throw new Error(`Invalid valueId ${valueId}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = Nodes.findOne(docId);
      if (!node) throw new Error(`Node ${docId} not founded.`);
      Nodes.update(docId, { $pull: {
        [`formulas.${type}.values`]: { _id: valueId },
      } });
    },
  });

  // nested sets
  Meteor.methods({
    'nodes.ns.name'(options) {
      Schema.NestedSets.Name.validate(options);
      const { positionId, parentId, tree, docId, name } = options;

      const node = Nodes.findOne(docId);
      if (!node) throw new Error(`node ${docId} not founded`);

      let $set: any = {};
      if (positionId && !parentId && !tree) {
        for (let p = 0; p < node.positions.length; p++) {
          if (node.positions[p]._id === positionId) {
            $set[`positions.${p}.name`] = options.name;
          }
        }
      } else if (parentId && tree && !positionId) {
        for (let p = 0; p < node.positions.length; p++) {
          if (
            node.positions[p].parentId === parentId
            &&
            node.positions[p].tree === tree
          ) {
            $set[`positions.${p}.name`] = options.name;
          }
        }
      } else throw new Error(`Must be (positionId) or (parentId and tree), not both.`);

      if (!_.isEmpty($set)) Nodes.update(
        options.docId,
        { $set },
      );
    },
    async 'nodes.ns.put'(options) {
      Schema.NestedSets.Put.validate(options);
      await ns.put(options);
    },
    async 'nodes.ns.pull'(options) {
      Schema.NestedSets.Pull.validate(options);
      await ns.pull(options);
    },
    async 'nodes.ns.move'(options) {
      Schema.NestedSets.Move.validate(options);
      await ns.put(options.put);
      await ns.pull(options.pull);
    },
  });
}
