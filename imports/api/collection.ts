import { Meteor } from 'meteor/meteor';

export const defaultCursorReady = () => true;

export const wrapCursor = (cursor) => {
  const { forEach, map, fetch, count } = cursor;
  cursor.ready = (cursor.sub && cursor.sub.ready.bind(cursor.sub)) || defaultCursorReady;
  if (Meteor.isServer) {
    cursor.forEach = function() {
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: fetch.call(cursor) });
      }
      return forEach.apply(cursor, arguments);
    }
    cursor.map = function() {
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: fetch.call(cursor) });
      }
      return map.apply(cursor, arguments);
    }
    cursor.fetch = () => {
      const results = fetch.call(cursor);
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: results });
      }
      return results;
    }
    cursor.count = function() {
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: fetch.call(cursor) });
      }
      return count.apply(cursor, arguments);
    }
  }
  return cursor;
};

export const wrapCollection = (collection) => {
  const { find, findOne, update } = collection;
  collection.find = function(query: any = {}, options: any = {}) {
    const cursor = find.call(collection, query, options);
    if ((!options || !options.subscribe) && this._name) {
      cursor.sub = Meteor.subscribe(this._name, query, options);
    }
    return wrapCursor(cursor);
  }
  collection.findOne = function(query: any = {}, options: any = {}) {
    const result = findOne.call(collection, query, options);
    if ((!options || !options.subscribe) && this._name) {
      Meteor.subscribe(this._name, query, { ...options, limit: 1 });
    }
    return result;
  }
  return collection;
};
