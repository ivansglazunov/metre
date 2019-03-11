import { Meteor } from 'meteor/meteor';
import { makeExecutableSchema } from "graphql-tools";
import gql from "graphql-tag";
import { graphql as reactiveGraphql } from "reactive-graphql";

import typeDefs from './schema.graphql';
import { resolvers } from './resolvers.graphql'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const graphql = (query) => reactiveGraphql(schema, query);

export { typeDefs, resolvers, schema, graphql, gql };
