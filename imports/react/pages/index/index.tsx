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
    alignItems="flex-start"
    style={{ height: '100%', width: '100%', textAlign: 'center' }}
  >
    <Grid item xs={3} style={{ overflow: 'auto', height: '100%' }}>
      <Menu tab={''}/>
    </Grid>
    <Grid item xs={9} style={{ overflow: 'auto', height: '100%' }}>
    </Grid>
  </Grid>;
});
