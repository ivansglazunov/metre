import { Meteor } from 'meteor/meteor';

export const wrapCollection = (collection) => {
  const { find, findOne } = collection;
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
  return collection;
};
