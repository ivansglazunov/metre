import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import _ from 'lodash';

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

export const isCursor = ({ fetch, forEach, map, count }: any) => !!(fetch && forEach && map && count);

export const wrapCollection = (collection) => {
  const { find, findOne, update } = collection;
  collection.find = function(query: any = {}, options: any = {}) {
    const cursor = find.call(collection, query, options);
    if (Meteor.subscribe && (!options || !options.subscribe) && this._name) {
      cursor.sub = Meteor.subscribe(this._name, query, options);
    }
    return wrapCursor(cursor);
  }
  collection.findOne = function(query: any = {}, options: any = {}) {
    const result = findOne.call(collection, query, options);
    if (Meteor.subscribe && (!options || !options.subscribe) && this._name) {
      Meteor.subscribe(this._name, query, { ...options, limit: 1 });
    }
    return result;
  }
  collection.publish = (method) => {
    Meteor.publish(collection._name, function(query, options) {
      this.autorun(function() {
        return method.call(this, query, options);
      });
    });
    Meteor.methods({
      [`${collection._name}.count`](query, options) {
        const result = method.call(this, query, options);
        if (_.isArray(result)) return result.length;
        else if (_.isObject(result)) {
          if (isCursor(result)) {
            // @ts-ignore
            return result.count();
          } else {
            return 1;
          }
        }
      },
      [`${collection._name}.fetch`](query, options) {
        const result = method.call(this, query, options);
        if (_.isArray(result)) return result;
        else if (_.isObject(result)) {
          if (isCursor(result)) {
            // @ts-ignore
            return result.fetch();
          } else {
            return [result];
          }
        }
      },
    });
  };
  return collection;
};
