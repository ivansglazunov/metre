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
import TriesMenu from '../../components/tries';
import { useMetre } from '../../../api/metre/react';
import { ChevronLeft } from '@material-ui/icons';
import { GridContainer } from '../../components/grid-container';

export default ({
}) => {
  const { userId } = useMetre();

  const c0 = <Grid item xs={12} sm={6} md={3} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
    <Menu tab={'tries'}/>
  </Grid>;

  const c1 = <Grid item xs={12} sm={6} md={3} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
    <Hidden implementation="css" only={['sm', 'md', 'lg']}><List dense><ListItem button component={Link} to="/"><ChevronLeft/></ListItem></List></Hidden>
    <TriesMenu/>
  </Grid>;

  return <>
    <Hidden implementation="css" only={['sm','md','lg']}>
      <GridContainer>
        {c1}
      </GridContainer>
    </Hidden>
    <Hidden implementation="css" only={['xs']}>
      <GridContainer>
        {c0}
        {c1}
      </GridContainer>
    </Hidden>
  </>;
};
