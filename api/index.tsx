import { Meteor } from 'meteor/meteor';
import { makeExecutableSchema } from "graphql-tools";
import gql from "graphql-tag";
import { graphql } from "reactive-graphql";

import typeDefs from './types.graphql';
import { resolvers } from './resolvers.graphql.tsx'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export { typeDefs, resolvers, schema, graphql, gql };

// const stream = graphql(schema, query);
// stream is an Observable
// stream.subscribe(res => console.log(res));
