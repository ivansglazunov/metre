import { Meteor } from 'meteor/meteor';

export const wrapCollection = (collection) => {
  const { find, findOne, update } = collection;
  collection.find = function(query: any = {}, options: any = {}) {
    if (Meteor.isClient && (!options || !options.subscribe) && this._name) {
      Meteor.subscribe(this._name, query, options);
    }
    return find.call(collection, query, options);
  }
  collection.findOne = function(query: any = {}, options: any = {}) {
    if (Meteor.isClient && (!options || !options.subscribe) && this._name) {
      Meteor.subscribe(this._name, query, { ...options, limit: 1 });
    }
    return findOne.call(collection, query, options);
  }
  // collection.update = function(selector?, modifier?, options?, callback?,) {
  //   console.log('update', selector, modifier);
  //   if (callback) return callback();
  //   if (options) return options();
  //   // return update.call(this, selector, modifier, options, callback);
  // }
  return collection;
};
