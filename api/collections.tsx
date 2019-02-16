import { Meteor } from 'meteor/meteor';
import { MongoObservable } from 'meteor-rxjs';

import { User } from './types';

export const Users = new MongoObservable.Collection<User>(Meteor.users);