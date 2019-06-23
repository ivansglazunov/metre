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
import ProjectsMenu from '../../components/projects';
import Project from '../../components/project';
import { useMetre } from '../../../api/metre/react';
import { ChevronLeft } from '@material-ui/icons';

export default ({
  match: {
    params: {
      projectId,
    },
  },
}) => {
  const { userId } = useMetre();

  return <Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="flex-start"
    style={{ height: '100%', width: '100%', textAlign: 'center' }}
  >
    <Hidden only={['xs','sm']}>
      <Grid item md={3} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
        <Menu tab={'projects'}/>
      </Grid>
    </Hidden>
    <Hidden only={['xs']}>
      <Grid item sm={5} md={3} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
        <Hidden only={['md', 'lg']}><List dense><ListItem button component={Link} to="/"><ChevronLeft/></ListItem></List></Hidden>
        <ProjectsMenu userId={userId} projectId={projectId}/>
      </Grid>
    </Hidden>
    <Grid item xs={12} sm={7} md={6} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
      <Hidden only={['sm', 'md', 'lg']}><List dense><ListItem button component={Link} to="/projects"><ChevronLeft/></ListItem></List></Hidden>
      <Project projectId={projectId} userId={userId}/>
    </Grid>
  </Grid>;
};
