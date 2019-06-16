declare module '*';

declare var global: any;
declare var require: any;
declare var Picker: any;

declare module NodeJS {
  interface Global {
    metreServerSubs: any;
    metreServerCalls: any;
    Metre: any;
  }
}

declare module "meteor/meteor" {
  module Meteor {
    var connection: any;
    var users: Mongo.Collection<User>;
  }
  interface Subscription {
    autorun: any;
  }
}

declare module "meteor/webapp" {
  module WebApp {
    export var categorizeRequest: any;
  }
}

declare module "mingo" {
  export var find: any;
}

declare module "meteor/mongo" {
  module Mongo {
    interface Cursor<T> {
      sub: any;
      ready(): boolean;
    }
  }
}

declare module "meteor/accounts-base" {
  module Accounts {
    export var _hooksLogin: any[];
    export var _hooksLogout: any[];
    export var _generateStampedLoginToken: () => any;
    export var _insertLoginToken: (userId, token) => any;
    export var _bcryptRounds: () => any;
    export var _hashLoginToken: (token) => any;
  }
}
