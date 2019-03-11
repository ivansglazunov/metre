import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { MongoObservable, ObservableCursor } from 'meteor-rxjs';

import { Collection } from '../collections';

export interface IPost {
  _id?: string;
  userId?: string;
  content?: string;
}

export const Posts = new Collection<IPost>('posts');
export default Posts;

if (Meteor.isServer) {
  Meteor.publish('posts', function(query, options) {
    this.autorun(function() {
      return Posts._collection.find(query, options);
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
