import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { MongoObservable, ObservableCursor } from 'meteor-rxjs';

//@ts-ignore
export class Collection<Type> extends MongoObservable.Collection<Type> {
  _name: string;
  public _collection;
  constructor(a?, b?) {
    super(a);
    if (typeof(a) === 'object') this._name = a._name;
    if (typeof(a) === 'string') this._name = a;
  }
  reactive(selector = {}, options = {}) {
    const observable = this.find(selector, options);
    const subscription = Meteor.subscribe ? Meteor.subscribe(this._name, selector, options) : null;
    return { observable, subscription };
  }
  reactiveOne(selector = {}, options = {}) {
    const result = this.findOne(selector, options);
    const subscription = Meteor.subscribe ? Meteor.subscribe(this._name, selector, { ...options, limit: 1 }) : null;
    return { result, subscription };
  }
}
