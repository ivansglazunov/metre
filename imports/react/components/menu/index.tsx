import * as React from 'react';
import { useState, useContext } from 'react';
import { List, ListItem, ListItemText, Paper, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useMetre } from '../../../api/metre/react';
import { Field } from '../field/index';
import { Metre } from '../../../api/metre/metre';
import { withTracker } from 'meteor/react-meteor-data';
import { Users } from '../../../api/collections';
import { isInRole } from '../../../api/collections/users';

export const LoginForm = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const onLogin = async () => {
    setError(false);
    try {
      await Metre.loginWidthUsernameAndPassword(login, password);
    } catch(error) {
      setError(true);
    }
  };

  return <div style={{ padding: 16 }}>
    <Field
      label="login"
      value={login}
      error={error}
      onChange={e => setLogin(e.target.value)}
      onKeyPress={e => {
        if (e.key === "Enter") onLogin();
      }}
    />
    <Field
      label="password"
      value={password}
      error={error}
      onChange={e => setPassword(e.target.value)}
      onKeyPress={e => {
        if (e.key === "Enter") onLogin();
      }}
    />
    <Button
      fullWidth
      onClick={() => onLogin()}
    >
      Login OR Create
    </Button>
  </div>;
};

export const Page = withTracker<any, any>(({
  userId,
  tab,
}) => {
  return {
    userId,
    tab,
    user: Users.findOne(userId),
  };
})(({
  userId,
  tab,
  user
}) => {
  return <>
    {!userId
      ? <LoginForm/>
      : <List dense>
        <ListItem divider button onClick={() => Metre.logout()}>
          <ListItemText primary="Logout"/>
        </ListItem>
        <ListItem divider component={Link} to={`/profile`} selected={tab === "profile"}>
          <ListItemText primary="Profile"/>
        </ListItem>
        {(isInRole(user, 'admin') || isInRole(user, 'manager')) &&
          <ListItem divider component={Link} to="/users" selected={tab === "users"}>
            <ListItemText primary="Users"/>
          </ListItem>
        }
        <ListItem divider component={Link} to="/projects" selected={tab === "projects"}>
          <ListItemText primary="Projects"/>
        </ListItem>
        <ListItem divider component={Link} to="/tries" selected={tab === "tries"}>
          <ListItemText primary="Tries"/>
        </ListItem>
      </List>
    }
  </>;
});

export default ({
  tab,
}) => {
  const { userId } = useMetre();
  return <Page userId={userId} tab={tab}/>
};
