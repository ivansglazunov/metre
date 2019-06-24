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
import { GridContainer } from '../../components/grid-container';

export default ({
  match: {
    params: {
      userId,
    },
  },
}) => {
  const { userId: _userId } = useMetre();

  const c0 = <Grid item md={3} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
    <Menu tab={'users'}/>
  </Grid>;

  const c1 = <Grid item sm={5} md={3} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
    <Hidden implementation="css" only={['md', 'lg']}><List dense><ListItem button component={Link} to="/"><ChevronLeft/></ListItem></List></Hidden>
    <UsersMenu userId={userId}/>
  </Grid>;

  const c2 = <Grid item xs={12} sm={7} md={6} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
    <Hidden implementation="css" only={['sm', 'md', 'lg']}><List dense><ListItem button component={Link} to="/users"><ChevronLeft/></ListItem></List></Hidden>
    <UserMenu currentUserId={_userId} userId={userId}/>
  </Grid>;

  return <>
    <Hidden implementation="css" only={['sm','md','lg']}>
      <GridContainer>
        {c2}
      </GridContainer>
    </Hidden>
    <Hidden implementation="css" only={['xs','md','lg']}>
      <GridContainer>
        {c1}
        {c2}
      </GridContainer>
    </Hidden>
    <Hidden implementation="css" only={['xs','sm']}>
      <GridContainer>
        {c0}
        {c1}
        {c2}
      </GridContainer>
    </Hidden>
  </>;
};
