import { Button, Paper, Grid, List, ListItem, ListItemText, Tabs, Tab, Divider, LinearProgress, ListItemSecondaryAction } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Users, Projects, Tries } from '../../../api/collections';
import Menu from '../menu';
import { Load } from '../load';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { isInRole } from '../../../api/collections/users';
import { AllInclusive, Work, Keyboard } from '@material-ui/icons';

const methods = (props, prevResults, call) => {
  return {};
};

const tracker = ({
  tab,
  methodsResults: {},
}) => {
  const uc = Users.find({}, { sort: { createdAt: 1 } });
  const users = uc.fetch();
  const loading = !uc.ready();
  return {
    loading,
    users,
  };
};

const Component = ({
  userId,
  trackerResults: {
    loading,
    users,
  },
}) => {
  return <List dense>
    {loading && <LinearProgress/>}
    {users.map((user) => {
      return <ListItem
        key={user._id}
        button
        divider
        selected={userId === user._id}
        component={Link} to={`/user/${user._id}`}
      >
        <ListItemText primary={user.username}/>
        <ListItemSecondaryAction>
          {
            isInRole(user, 'admin')
            ? <AllInclusive/>
            : isInRole(user, 'owner')
            ? <Work/>
            : isInRole(user, 'developer')
            ? <Keyboard/>
            : null
          }
        </ListItemSecondaryAction>
      </ListItem>;
    })}
  </List>;
};

export default ({
  userId = null,
}) => {
  return <>
    <Load
      userId={userId}
      methods={methods}
      tracker={tracker}
      Component={Component}
    />
  </>;
};
