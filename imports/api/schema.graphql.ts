import gql from "graphql-tag";

export default gql`
  type Role {
    name: String!
    group: String!
  }

  type Email {
    address: String
    verified: Boolean
  }
  
  type Profile {
    firstname: String
    lastname: String
    secondname: String
  }

  type User {
    _id: String!
    emails: [Email]
    username: String
    profile: Profile
    phone: String
    region: String
    roles: [Role]!
    inRole(name: String!, group: String!): Boolean
    posts: [Post]
  }

  type Post {
    _id: String!
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
