import { Button, Paper, Grid, List, ListItem, ListItemText, Tabs, Tab, Divider, TextField, LinearProgress, Checkbox, FormControlLabel, ButtonGroup, ListItemSecondaryAction } from '@material-ui/core';
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
import { Field } from '../field';
import TriesMenu from '../tries';
import ProjectsMenu from '../projects';
import { ChevronLeft, AllInclusive, Work, Keyboard } from '@material-ui/icons';
import { isInRole, setRoles } from '../../../api/collections/users';

export default withTracker<any, any>(({
  userId,
}) => {
  const us = Users.find({ _id: userId });
  return {
    userId,
    loading: !us.ready(),
    user: us.fetch()[0],
  };
})(({
  userId,
  user,
  loading,
}) => {
  const [tab, setTab] = useState('projects');

  if (loading) return <LinearProgress/>;
  if (!user) return <div>User {userId} not founded.</div>;

  return <>
    <List dense>
      <ListItem divider>
        <ListItemText primary={user.username} secondary={user._id}/>
      </ListItem>
      {isInRole(user, 'admin')
      ? <>
        <ListItem button divider
          disabled={isInRole(user, 'admin')}
          onClick={() => setRoles(userId, ['admin'])}
        >
          Admin
          <ListItemSecondaryAction>
            <AllInclusive/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button divider
          disabled={isInRole(user, 'owner')}
          onClick={() => setRoles(userId, ['owner'])}
        >
          Owner
          <ListItemSecondaryAction>
            <Work/>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button divider
          disabled={isInRole(user, 'developer')}
          onClick={() => setRoles(userId, ['developer'])}
        >
          Developer
          <ListItemSecondaryAction>
            <Keyboard/>
          </ListItemSecondaryAction>
        </ListItem>
      </>
      : <>
        {isInRole(user, 'owner') && <ListItem divider disabled>
          Owner
          <ListItemSecondaryAction>
            <Work/>
          </ListItemSecondaryAction>
        </ListItem>}
        {isInRole(user, 'developer') && <ListItem divider disabled>
          Developer
          <ListItemSecondaryAction>
            <Keyboard/>
          </ListItemSecondaryAction>
        </ListItem>}
      </>}
    </List>
    <Tabs value={tab} centered onChange={(event, tab) => setTab(tab)}>
      <Tab value='projects' label='Projects' style={{ minWidth: 0 }}/>
      <Tab value='tries' label='Tries' style={{ minWidth: 0 }}/>
    </Tabs>
    {tab === 'projects' && <ProjectsMenu userId={userId} defaultTab='owned' hideTabs query={{ ownerUserId: userId }}/>}
    {tab === 'tries' && <TriesMenu query={{ userId }}/>}
  </>;
});
