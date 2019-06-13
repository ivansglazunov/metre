import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import * as React from 'react';
import { useState } from 'react';
import * as _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';

import { HotKeys } from "react-hotkeys";

import { withStyles } from '@material-ui/core/styles';

import { Users, Nodes } from '../../api/collections/index';
import { Button } from '@material-ui/core';

export const User = ({
  users,
  user,
  subjects,
}) => {
  const [registerError, setRegisterError] = useState(false);
  const [loginError, setLoginError] = useState(false);

  return <>
    <div>users</div>
    <div>{JSON.stringify(users, null, 1)}</div>
    <div>user</div>
    <div>{JSON.stringify(user, null, 1)}</div>
    <div>user operations</div>
    <div>
      <Button
        disabled={!!user}
        color={registerError ? 'secondary' : 'default'}
        variant="outlined"
        size="small"
        onClick={() => Accounts.createUser({ username: 'test', password: 'test' }, (error) => setRegisterError(!!error))}
      >register</Button>
      <Button
        disabled={!!user}
        color={loginError ? 'secondary' : 'default'}
        variant="outlined"
        size="small"
        onClick={() => Meteor.loginWithPassword('test', 'test', (error) => setLoginError(!!error))}
      >login</Button>
      <Button
        disabled={!user}
        variant="outlined"
        size="small"
        onClick={() => Accounts.logout()}
      >logout</Button>
    </div>
    <div>subjects</div>
    <div>
      {subjects.map(subject => <div>
        {JSON.stringify(subject, null, 1)}
        <Button
          variant="outlined"
          size="small"
          onClick={() => Nodes.update(subject._id, { $pull: { users: { type: 'users', value: user._id } } })}
        >detach</Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => Nodes.remove(subject._id)}
        >del</Button>
      </div>)}
    </div>
    <div>subjects operations</div>
    <div>
      <Button
        variant="outlined"
        size="small"
        onClick={() => Nodes.insert({ users: [{ type: 'users', value: user._id }] })}
      >new</Button>
    </div>
  </>;
};

const tracked = withTracker((props) => {
  const users = Users.find({}).fetch();
  const user = Meteor.user();
  const subjects = user ? Nodes.find({ users: { $elemMatch: { type: 'users', value: user._id } } }).fetch() : [];
  return {
    users,
    user,
    subjects,
  };
})((props: any) => <User {...props} />);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
