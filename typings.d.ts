import { Observable } from 'rxjs';

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
  interface Subscription {
    autorun: any;
  }
}

declare module "meteor/accounts-base" {
  module Accounts {
    var _hooksLogin: any[];
    var _hooksLogout: any[];
  }
}

declare module "meteor/swydo:ddp-apollo" {
  var setup: any;
  var setupHttpEndpoint: any;
}
