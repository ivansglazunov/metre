import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Observable } from 'rxjs';
import { MongoObservable } from 'meteor-rxjs';
import { debounce, map, first, merge, concatAll } from 'rxjs/operators';

import Users from './collections/users';
import Posts from './collections/posts';
import { parseDoc, parseUser } from './parsers.graphql';

export const resolvers = {
  Query: {
    authorizedUsers: () => {
      return Users.reactive({ _id: Meteor.userId() }).observable
      .pipe(map(docs => _.map(docs, parseUser)))
    },
  },
  User: {
    posts: (user) => {
      return Posts.reactive({ userId: Meteor.userId() }).observable
      .pipe(map(docs => _.map(docs, parseDoc)))
    },
  },
  Mutation: {
    random: (e, options) => {
      Meteor.users.update(Meteor.userId(), { $set: { 'profile.firstname': Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5) } })
      return parseUser(Meteor.user());
    },
  },
};
