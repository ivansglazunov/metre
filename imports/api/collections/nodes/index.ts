import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import _ from 'lodash';

import { wrapCollection } from '../../collection';

export interface INodeText {
  format: string;
  body: string;
}

export interface INode {
  _id?: string;
  text?: { [title: string]: INodeText[] };
}

export const Nodes = wrapCollection(new Mongo.Collection<INode>('nodes'));
export default Nodes;
// @ts-ignore
Meteor.nodes = Nodes;

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
