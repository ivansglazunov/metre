

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import * as _ from 'lodash';

import { wrapCollection } from '../../collection';
import { TPositions, NestedSets } from '../../nested-sets';
import { IPosition } from '../../nested-sets/index';
import { mathEval } from '../../math';

export interface IFormulaTypes {
  [type: string]: IFormulaType;
}

export interface IFormulaType {
  _id?: string;
  values: IFormula[];
}

export interface IFormula {
  _id?: string;
  value: string;
  [key: string]: any;
}

export const SchemaRules = {
  'formulas': {
    type: Object,
    blackbox: true,
    optional: true,
  },
};

export const Schema = new SimpleSchema(SchemaRules);

export const formulasHelpers = ({
  collection,
}) => {
  collection.helpers({
    f(key) {
      return this.formulaEval(_.get(this, `formulas.${key}.values.0.value`)).value;
    },
    formulaEval(exp) {
      return mathEval(exp, { n: this });
    },
  });
};

export const formulasMethods = ({
  collection,
}) => {
  // value
  Meteor.methods({
    [`${collection._name}.formulas.set`](docId, type, value) {
      if (!(typeof(value) === 'object' && typeof(value._id) === 'string')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = collection.findOne(docId);
      if (!node) throw new Error(`Doc ${docId} not founded.`);
      if (!_.get(node, `formulas.${type}.values`)) throw new Error(`Doc ${docId} not includes values type [type].`);
      let index = -1;
      for (let i = 0; i < node.formulas[type].values.length; i++) {
        if (node.formulas[type].values[i]._id === value._id) index = i;
      }
      if (!~index) throw new Error(`Doc ${docId} not includes valueId ${value._id} in type ${type}.`);
      const $set = {};
      const keys = _.keys(value);
      for (let k = 0; k < keys.length; k++) {
        $set[`formulas.${type}.values.${index}.${keys[k]}`] = value[keys[k]];
      }
      collection.update(docId, { $set });
    },
    [`${collection._name}.formulas.push`](docId, type, value) {
      if (!(typeof(value) === 'object')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = collection.findOne(docId);
      if (!node) throw new Error(`Doc ${docId} not founded.`);
      collection.update(docId, { $push: {
        [`formulas.${type}.values`]: { ...value, _id: Random.id() },
      } });
    },
    [`${collection._name}.formulas.pull`](docId, type, valueId) {
      if (!(typeof(valueId) === 'string')) {
        throw new Error(`Invalid valueId ${valueId}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = collection.findOne(docId);
      if (!node) throw new Error(`Doc ${docId} not founded.`);
      collection.update(docId, { $pull: {
        [`formulas.${type}.values`]: { _id: valueId },
      } });
    },
  });
};

export const generateEnv = ({}) => {
  const env = {};
};
