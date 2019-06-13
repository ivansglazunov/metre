import * as _ from "lodash";
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

export interface IValuesTypes<Type extends any> {
  [type: string]: IValueType<Type>;
}

export interface IValueType<Type extends any> {
  _id: string;
  values: Type[];
}

export const SchemaRules = {
  type: Object,
  blackbox: true,
  optional: true,
};

export const valuesMethods = ({
  collection,
  field,
}) => {
  // value
  Meteor.methods({
    [`${collection._name}.values.${field}.set`](docId, type, value) {
      if (!(typeof(value) === 'object' && typeof(value._id) === 'string')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = collection.findOne(docId);
      if (!node) throw new Error(`Doc ${docId} not founded.`);
      if (!_.get(node, `${field}.${type}.values`)) throw new Error(`Doc ${docId} not includes values type [type].`);
      let index = -1;
      for (let i = 0; i < node[field][type].values.length; i++) {
        if (node[field][type].values[i]._id === value._id) index = i;
      }
      if (!~index) throw new Error(`Doc ${docId} not includes valueId ${value._id} in type ${type}.`);
      const $set = {};
      const keys = _.keys(value);
      for (let k = 0; k < keys.length; k++) {
        $set[`${field}.${type}.values.${index}.${keys[k]}`] = value[keys[k]];
      }
      collection.update(docId, { $set });
    },
    [`${collection._name}.values.${field}.push`](docId, type, value) {
      if (!(typeof(value) === 'object')) {
        throw new Error(`Invalid value object ${JSON.stringify(value)}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = collection.findOne(docId);
      if (!node) throw new Error(`Doc ${docId} not founded.`);
      collection.update(docId, { $push: {
        [`${field}.${type}.values`]: { ...value, _id: Random.id() },
      } });
    },
    [`${collection._name}.values.${field}.pull`](docId, type, valueId) {
      if (!(typeof(valueId) === 'string')) {
        throw new Error(`Invalid valueId ${valueId}`);
      }
      if (!(typeof(type) === 'string')) {
        throw new Error(`Invalid type ${type}`);
      }
      const node = collection.findOne(docId);
      if (!node) throw new Error(`Doc ${docId} not founded.`);
      collection.update(docId, { $pull: {
        [`${field}.${type}.values`]: { _id: valueId },
      } });
    },
  });
};