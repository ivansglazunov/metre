import { Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Projects, Tries } from '../../../api/collections';
import Menu from '../../components/menu';

export default withTracker<any, any>(({ metre, match,userId }) => {
  return {
    match,
    projects: Projects.find().fetch(),
  };
})(({
  match,
  projects,
}) => {
  return <Grid
    container
    direction="row"
    justify="center"
    alignItems="center"
    style={{ height: '100%', width: '100%', textAlign: 'center' }}
  >
    <Grid item xs={12} sm={8} md={6} lg={4} style={{ overflowX: 'hidden', overflowY: 'scroll', height: '100%' }}>
      <Menu tab={''}/>
    </Grid>
  </Grid>;
});
