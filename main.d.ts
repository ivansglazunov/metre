declare module '*';

declare namespace JSX {
  interface IntrinsicAttributes {
    [name: string]: any;
  }
}

declare module "meteor/meteor" {
  module Meteor {
    var users: Mongo.Collection<User>;
  }
}
declare module "meteor/accounts-base" {
  module Accounts {
    var _hooksLogin: any[];
    var _hooksLogout: any[];
  }
}