import { Meteor } from 'meteor/meteor';

export const defaultCursorReady = () => true;

export const wrapCursor = (cursor) => {
  cursor.ready = (cursor.sub && cursor.sub.ready.bind(cursor.sub)) || defaultCursorReady;
  return cursor;
};

export const wrapCollection = (collection) => {
  const { find, findOne, update } = collection;
  collection.find = function(query: any = {}, options: any = {}) {
    const cursor = find.call(collection, query, options);
    if (Meteor.isClient && (!options || !options.subscribe) && this._name) {
      cursor.sub = Meteor.subscribe(this._name, query, options);
    }
    return wrapCursor(cursor);
  }
  collection.findOne = function(query: any = {}, options: any = {}) {
    const cursor = findOne.call(collection, query, options);
    if (Meteor.isClient && (!options || !options.subscribe) && this._name) {
      cursor.sub = Meteor.subscribe(this._name, query, { ...options, limit: 1 });
    }
    return wrapCursor(cursor);
  }
  return collection;
};
