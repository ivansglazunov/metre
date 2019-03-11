import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { DDPLink } from 'apollo-link-ddp';
import { ReactiveSchemaLink } from 'apollo-link-reactive-schema';
// Choose any cache implementation, but we'll use InMemoryCache as an example
import { InMemoryCache } from 'apollo-cache-inmemory';

import { schema } from './index';

export const client = new ApolloClient ({
  link: ApolloLink.from([
    new DDPLink(),
    new ReactiveSchemaLink({ schema }),
  ]),
  cache: new InMemoryCache(),
  queryDeduplication: false,
});
