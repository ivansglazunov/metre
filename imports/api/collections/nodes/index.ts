import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../../collection';

export interface INodeText {
  name: string;
  format: string;
  body: string;
}

export interface INode {
  _id?: string;
  text?: INodeText[];
}

export const Nodes = wrapCollection(new Mongo.Collection<INode>('nodes'));
export default Nodes;
// @ts-ignore
Meteor.nodes = Nodes;

export const Schema: any = {};

Schema.Node = new SimpleSchema({
  'text': {
    type: Array,
    optional: true
  },
  'text.$': Object,
  'text.$.name': String,
  'text.$.format': String,
  'text.$.body': String,
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
}
