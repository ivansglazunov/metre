

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

import { nsInit, nsHelpers, nsMethods } from './ns';
import {
  IFormulaTypes,
  Schema as FormulasSchema,
  formulasHelpers,
  formulasMethods,
} from './formulas';

// Interface
export interface INode {
  _id?: string;
  nesting?: TPositions;
  formulas?: IFormulaTypes;
  ___nsUsedPosition?: IPosition;
  ___nsRootUserPosition?: IPosition;
}

// Collection
export const Nodes = wrapCollection(new Mongo.Collection<INode>('nodes'));
export default Nodes;
// @ts-ignore
Meteor.nodes = Nodes;

const { ns: nsNesting } = nsInit({ collection: Nodes, field: 'nesting' });

export const Schema = new SimpleSchema({
  ...nsNesting.SimpleSchemaRules(),
  ...FormulasSchema,
});
Nodes.attachSchema(Schema);

nsHelpers({ collection: Nodes, ns: nsNesting });
formulasHelpers({ collection: Nodes });

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
  
  nsMethods({ collection: Nodes, ns: nsNesting });
  formulasMethods({ collection: Nodes });
}
