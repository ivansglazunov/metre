import { Meteor } from 'meteor/meteor';

// @ts-ignore
import { setup, setupHttpEndpoint } from 'meteor/swydo:ddp-apollo';

import { schema } from './index';

const context = async (currentContext) => ({
  ...currentContext,
  user: Meteor.user(),
  userId: Meteor.userId(),
});

setup({
  schema,
  context,
});

setupHttpEndpoint({
  schema,
});
