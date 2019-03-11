import gql from "graphql-tag";

export default gql`
  type Role {
    name: String!
    group: String!
  }

  type User {
    id: String!
    email: String
    username: String
    firstname: String
    lastname: String
    secondname: String
    phone: String
    region: String
    roles: [Role]!
    inRole(name: String!, group: String!): Boolean
    posts: [Post]
  }

  type Post {
    id: String!
    userId: String!
    content: String
  }

  type Query {
    authorizedUsers: User
  }

  type Mutation {
    random: User
  }
`;
