declare module '*';

declare var global: any;
declare var require: any;

declare module NodeJS {
  interface Global {
    metreServerSubs: any;
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
    var _hooksLogin: any[];
    var _hooksLogout: any[];
  }
}
