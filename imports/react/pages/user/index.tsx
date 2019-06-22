import { Button, Paper, Grid, List, ListItem, ListItemText, Hidden } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Projects, Tries } from '../../../api/collections';
import Menu from '../../components/menu';
import { Load } from '../../components/load';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import UsersMenu from '../../components/users';
import UserMenu from '../../components/user';
import Tri from '../../components/try';
import { useMetre } from '../../../api/metre/react';
import { ChevronLeft } from '@material-ui/icons';

export default ({
  match: {
    params: {
      userId,
    },
  },
}) => {
  const { userId: _userId } = useMetre();

  return <Grid
    container
    direction="row"
    justify="center"
    alignItems="flex-start"
    style={{ height: '100%', width: '100%', textAlign: 'center' }}
  >
    <Hidden xsUp>
      <Grid item xs={3} style={{ overflow: 'auto', height: '100%' }}>
        <Menu tab={'users'}/>
      </Grid>
      <Grid item xs={3} style={{ overflow: 'auto', height: '100%' }}>
        <UsersMenu userId={userId}/>
      </Grid>
    </Hidden>
    <Grid item xs={12} sm={6} style={{ overflow: 'auto', height: '100%' }}>
      <Hidden xsDown><List dense><ListItem button component={Link} to="/users"><ChevronLeft/></ListItem></List></Hidden>
      <UserMenu userId={userId}/>
    </Grid>
  </Grid>;
};
