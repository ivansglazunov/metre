import { Button, Paper, Grid, List, ListItem, ListItemText } from '@material-ui/core';
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
import Tri from '../../components/try';
import { useMetre } from '../../../api/metre/react';

export default ({
  match: {
    params: {
      tryId,
    },
  },
}) => {
  const { userId } = useMetre();

  return <Grid
    container
    direction="row"
    justify="center"
    alignItems="flex-start"
    style={{ height: '100%', width: '100%', textAlign: 'center' }}
  >
    <Grid item xs={3} style={{ overflow: 'auto', height: '100%' }}>
      <Menu tab={'tries'}/>
    </Grid>
    <Grid item xs={3} style={{ overflow: 'auto', height: '100%' }}>
      <TriesMenu tryId={tryId}/>
    </Grid>
    <Grid item xs={6} style={{ overflow: 'auto', height: '100%' }}>
      <Tri tryId={tryId}/>
    </Grid>
    <Grid item xs={9}/>
  </Grid>;
};
