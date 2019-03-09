import _ from 'lodash';
import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import classNames from 'classnames';
import moment from 'moment';
import gql from "graphql-tag";

import { withStyles } from '@material-ui/core/styles';

import { Graphql } from '../impl/graphql';
import { Test } from '../components/test';

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

    render() {
      const { open } = this.state;
      return <div>
        {
          open
          ? <Graphql query={gql`{ authorizedUsers { id username firstname } }`} render={(state) => {
            const user = _.get(state, 'result.data.authorizedUsers.0');
            return <Test
              open={open}
              toggle={() => this.setState({ open: !open })}
              user={user}
              create={() => Accounts.createUser({ username: 'test', password: 'test' })}
              login={() => Meteor.loginWithPassword('test', 'test')}
              logout={() => Accounts.logout()}
              random={() => Meteor.users.update(user.id, { $set: { 'profile.firstname': Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5) } })}
            />;
          }}/>
          : <Test
            open={open}
            toggle={() => this.setState({ open: !open })}
            user={null}
            create={null}
            login={null}
            logout={null}
            random={null}
          />
        }
      </div>;
    }
  },
);
