

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
import { valuesMethods, IValuesTypes, SchemaRules as ValuesSchemaRules } from '../values';

// TODO rename to scripts
// TODO add script format and dependencies

export interface IFormulaTypes extends IValuesTypes<string> {}

export interface IFormula {
  _id?: string;
  value: string;
  [key: string]: any;
}

export interface IDocFormulas {
  formulas?: IFormulaTypes;
}

export const SchemaRules = {
  'formulas': ValuesSchemaRules,
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
  valuesMethods({ collection, field: 'formulas' });
};

const getter = (obj, key, fun) => {
  Object.defineProperty(obj, key, { get: fun });
};

export const generateEnv = ({
  doc,
}) => {
  const env: any = {};
  env.doc = doc;
  env.ns = (config: any, byField = '___nsFoundedTrace.positions.0.used.name') => {
    const ct = typeof(config);
    const docs = doc.__nsFind({ doc, sort: true, trace: true, field: 'nesting', ...(ct === 'number' ? { limitDepth: config } : config) });
    const results = {};
    for (let p = 0; p < docs.length; p++) {
      const name = _.get(docs[p], byField, '');
      if (name) results[name] = generateEnv({ doc: docs[p] });
    }
    return results;
  };
  env.nsBy = (config: any, byField = 'strings.title.values.0.value') =>
    env.ns(config, byField);
  env.v = (field) => {
    const results = {};
    const fs = doc[field];
    const fsk = Object.keys(fs);
    for (let k = 0; k < fsk.length; k++) {
      const f = fs[fsk[k]];
      if (f.values[0]) getter(results, fsk[k], () => {
        return f.values[0].value;
      });
    }
    return results;
  };
  env.vs = (field) => {
    const results = {};
    const fs = doc[field];
    const fsk = Object.keys(fs);
    for (let k = 0; k < fsk.length; k++) {
      const f = fs[fsk[k]];
      results[fsk[k]] = [];
      for (let v = 0; v < f.values.length; v++) {
        results[fsk[k]].push(f.values[v].value);
      }
    }
    return results;
  };
  getter(env, 'formula', () => {
    const results = {};
    const fs = doc.formulas;
    const fsk = Object.keys(fs);
    for (let k = 0; k < fsk.length; k++) {
      const f = fs[fsk[k]];
      if (f.values[0]) getter(results, fsk[k], () => {
        return doc.formulaEval(f.values[0].value).value;
      });
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
