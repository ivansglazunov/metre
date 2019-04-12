import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { MongoObservable, ObservableCursor } from 'meteor-rxjs';

import { wrapCollection } from '../collection';

export interface IPost {
  _id?: string;
  userId?: string;
  content?: string;
}

export const Posts = wrapCollection(new Mongo.Collection<IPost>('posts'));
export default Posts;

if (Meteor.isServer) {
  Meteor.publish('posts', function(query, options) {
    this.autorun(function() {
      return Posts.find(query, options);
    });
  });
  Posts.allow({
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
