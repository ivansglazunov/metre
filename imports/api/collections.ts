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
  find(selector: any = {}, options: any = {}): any {
    const type = options.type || 'observable';
    let result;
    if (type === 'observable') {
      result = super.find(selector, options);
    } else if (type === 'cursor') {
      result = this._collection.find(selector, options);
    } else if (type === 'data') {
      result = this._collection.find(selector, options).fetch();
    } else {
      throw new Error(`unexpected type ${type}`);
    }
    let subscription;
    if (options.subscription !== false) {
      subscription = Meteor.subscribe ? Meteor.subscribe(this._name, selector, options) : null;
    }
    return { result, subscription };
  }
  findOne(selector: any = {}, options: any = {}): any {
    const type = options.type || 'observable';
    let result;
    if (type === 'observable') {
      result = super.findOne(selector, options);
    } else if (type === 'cursor') {
      result = this._collection.find(selector, { ...options, limit: 1 });
    } else if (type === 'data') {
      result = this._collection.findOne(selector, options);
    } else {
      throw new Error(`unexpected type ${type}`);
    }
    let subscription;
    if (options.subscription !== false) {
      subscription = Meteor.subscribe ? Meteor.subscribe(this._name, selector, { ...options, limit: 1 }) : null;
    }
    return { result, subscription };
  }
}
