import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import * as  _ from 'lodash';
import * as Debug from 'debug';

const debug = Debug('metre:collection');

export const defaultCursorReady = () => true;

/**
 * Adds subscription and method ready to cursor. Add support for metre ssr.
 */
export const wrapCursor = (collection, cursor) => {
  debug(`${collection._name} wrapCursor`, cursor);
  const { forEach, map, fetch, count } = cursor;
  cursor.ready = (cursor.sub && cursor.sub.ready.bind(cursor.sub)) || defaultCursorReady;
  if (Meteor.isServer) {
    cursor.forEach = function() {
      debug(`${collection._name} cursor.forEach`);
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: fetch.call(cursor) });
      }
      return forEach.apply(cursor, arguments);
    }
    cursor.map = function() {
      debug(`${collection._name} cursor.map`);
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: fetch.call(cursor) });
      }
      return map.apply(cursor, arguments);
    }
    cursor.fetch = () => {
      debug(`${collection._name} cursor.fetch`);
      const results = fetch.call(cursor);
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: results });
      }
      return results;
    }
    cursor.count = function() {
      debug(`${collection._name} cursor.count`);
      if (global.metreServerSubs) {
        global.metreServerSubs.push.call(global.metreServerSubs, { name: cursor._getCollectionName(), docs: fetch.call(cursor) });
      }
      return count.apply(cursor, arguments);
    }
  }
  return cursor;
};

export const isCursor = ({ fetch, forEach, map, count }: any) => !!(fetch && forEach && map && count);

/**
 * Add subscription to each fechable methods. Wrap each cursor. Provide autopublish for results, count and ids by query.
 */
export const wrapCollection = (collection) => {
  debug(`wrapCollection ${collection._name}`, collection);
  const { find, findOne, update } = collection;
  collection.find = function(query: any = {}, options: any = {}) {
    debug(`${collection._name}.find`);
    const cursor = find.call(collection, query, options);
    if (Meteor.subscribe && (!options || !options.subscribe) && this._name) {
      cursor.sub = Meteor.subscribe(this._name, query, options);
    }
    return wrapCursor(collection, cursor);
  }
  collection.findOne = function(query: any = {}, options: any = {}) {
    debug(`${collection._name}.findOne`);
    const result = findOne.call(collection, query, options);
    if (Meteor.subscribe && (!options || !options.subscribe) && this._name) {
      Meteor.subscribe(this._name, query, { ...options, limit: 1 });
    }
    return result;
  }
  collection.publish = (method) => {
    Meteor.publish(collection._name, function(query, options) {
      debug(`${collection._name}.publish`);
      this.autorun(function() {
        debug(`${collection._name}.publish autorun`);
        return method.call(this, query, options);
      });
    });
    Meteor.methods({
      [`${collection._name}.count`](query, options) {
        debug(`${collection._name}.count start`);
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
        debug(`${collection._name}.fetch start`);
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
      [`${collection._name}.ids`](query, options) {
        debug(`${collection._name}.ids start`);
        const result = method.call(this, query, { ...options, fields: { _id: 1 } });
        if (_.isArray(result)) return result.map(d => d._id);
        else if (_.isObject(result)) {
          if (isCursor(result)) {
            // @ts-ignore
            return result.map(d => d._id);
          } else {
            // @ts-ignore
            return [result._id];
          }
        }
      },
    });
  };
  return collection;
};
