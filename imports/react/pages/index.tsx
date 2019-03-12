import _ from 'lodash';
import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import classNames from 'classnames';
import moment from 'moment';
import gql from "graphql-tag";

import { withStyles } from '@material-ui/core/styles';

import { Graphql } from '../impl/graphql';
import { graphql } from '../../api/index';

import { Firstname } from '@bit/ivansglazunov.metre.firstname';
import { UserPosts } from '@bit/ivansglazunov.metre.userposts';

import Posts from '../../api/collections/posts';

export default withStyles(
  theme => ({
  }),
)(
  class Page extends React.Component <any, any, any>{
    static defaultProps = {
    };

    state = {
      open: true
    };

    queryUser = gql`{
      user: authorizedUsers {
        id username firstname
      }
    }`;

    queryPosts = gql`{
      user: authorizedUsers {
        id username firstname posts { id content }
      }
    }`;

    mutationRandom = gql`mutation { random { id } }`;

    render() {
      const { open } = this.state;
      return <div>
        {
          open
          ? <Graphql query={this.queryUser} render={(state) => {
            const user = _.get(state, 'result.data.user.0');
            return <Firstname
              open={open}
              toggle={() => this.setState({ open: !open })}
              user={user}
              create={() => Accounts.createUser({ username: 'test', password: 'test' })}
              login={() => Meteor.loginWithPassword('test', 'test')}
              logout={() => Accounts.logout()}
              random={() => graphql(this.mutationRandom)}
            />;
          }}/>
          : <Firstname
            open={open}
            toggle={() => this.setState({ open: !open })}
            user={null}
            create={null}
            login={null}
            logout={null}
            random={null}
          />
        }
        <hr/>
        <Graphql query={this.queryPosts} render={(state) => {
          return <UserPosts
            user={_.get(state, 'result.data.user.0')}
            posts={_.get(state, 'result.data.user.0.posts')}
            remove={(id) => Posts.remove(id)}
            createRandom={() => Posts.insert({ userId: _.get(state, 'result.data.user.0.id'), content: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5) })}
          />;
        }}/>
      </div>;
    }
  },
);
