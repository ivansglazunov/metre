declare module '*';

declare module "meteor/meteor" {
  module Meteor {
    var users: Mongo.Collection<User>;
  }
  interface Subscription {
    autorun: any;
  }
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
