import _ from 'lodash';
import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import classNames from 'classnames';
import moment from 'moment';
import gql from "graphql-tag";

import { withStyles } from '@material-ui/core/styles';

import { Graphql } from '../impl/graphql';

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
        <button onClick={() => this.setState({ open: !open })}>{open ? 'hide' : 'show'}</button>
        {open && <Graphql query={gql`{ authorizedUsers { id username firstname } }`} render={(state) => <React.Fragment>
          {!_.isEmpty(_.get(state, 'result.data.authorizedUsers')) ? <React.Fragment>
            <button onClick={() => Accounts.logout()}>logout</button>
          </React.Fragment> : <React.Fragment>
            <button onClick={() => Accounts.createUser({ username: 'test', password: 'test' })}>create</button>
            <button onClick={() => Meteor.loginWithPassword('test', 'test')}>login</button>
          </React.Fragment>}
          <div>
            {JSON.stringify(state)}
          </div>
        </React.Fragment>}/>}
      </div>;
    }
  },
);
