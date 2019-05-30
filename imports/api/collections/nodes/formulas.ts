

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

// TODO rename to scripts
// TODO add script format and dependencies

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

export const formulasHelpers = ({
  collection,
}) => {
  collection.helpers({
    f(key) {
      return this.formulaEval(_.get(this, `formulas.${key}.values.0.value`)).value;
    },
    formulaEval(exp) {
      return mathEval(exp, { n: generateEnv({ doc: this }) });
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

const getter = (obj, key, fun) => {
  Object.defineProperty(obj, key, { get: fun });
};

export const generateEnv = ({
  doc,
}) => {
  const env = {};
  getter(env, 'p', () => {
    const results = {};
    const parents = doc.__nsParents();
    for (let p = 0; p < parents.length; p++) {
      const par = parents[p];
      const _pos = par.___nsUsedFromChildPosition;
      if (par.nesting) for (let o = 0; o < par.nesting.length; o++) {
        const pos = par.nesting[o];
        if (pos.space === _pos.space && pos.left < _pos.left && pos.right > _pos.right && pos.name) {
          results[pos.name] = generateEnv({ doc: parents[p] });
        }
      }
    }
    return results;
  });
  getter(env, 'formula', () => {
    const results = {};
    const fs = doc.formulas;
    const fsk = Object.keys(fs);
    for (let k = 0; k < fsk.length; k++) {
      const f = fs[fsk[k]];
      if (f.values[0]) results[fsk[k]] = doc.formulaEval(f.values[0].value).value;
    }
    return results;
  });
  getter(env, 'formulas', () => {
    const results = {};
    const fs = doc.formulas;
    const fsk = Object.keys(fs);
    for (let k = 0; k < fsk.length; k++) {
      const f = fs[fsk[k]];
      results[fsk[k]] = [];
      for (let v = 0; v < f.values.length; v++) {
        results[fsk[k]].push(doc.formulaEval(f.values[v].value).value);
      }
    }
    return results;
  });
  return env;
};
