import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Observable } from 'rxjs';
import { MongoObservable } from 'meteor-rxjs';
import { debounce, map, first, merge, concatAll } from 'rxjs/operators';

import { Users } from './collections';
import { parseUser } from './parsers.graphql';

export const resolvers = {
  Query: {
    user: () => Users.find({ _id: Meteor.userId() })
    .pipe(map(users => _.map(users, parseUser)))
    .pipe(concatAll())
    .pipe(first())
  }
};
