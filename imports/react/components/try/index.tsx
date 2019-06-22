import { Button, Paper, Grid, List, ListItem, ListItemText, Tabs, Tab, Divider, TextField, LinearProgress, Checkbox, FormControlLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Projects, Tries } from '../../../api/collections';
import Menu from '../menu';
import { Load } from '../load';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { Field } from '../field';
import TriesMenu from '../tries';
import { ChevronLeft } from '@material-ui/icons';

export default withTracker<any, any>(({
  tryId,
}) => {
  const tc = Tries.find({ _id: tryId });
  return {
    tryId,
    tri: tc.fetch()[0],
    loading: !tc.ready()
  };
})(({
  tryId,
  tri,
  loading,
}) => {
  const [tab, setTab] = useState('project');

  if (loading) return <LinearProgress/>;
  if (!tri) return <div>Try {tryId} not founded.</div>;

  return <div style={{ textAlign: 'left' }}>
    <div>
      <List dense>
        <ListItem button divider component={Link} to={`/project/${tri.projectId}`}>
          <ChevronLeft/> project
        </ListItem>
        <ListItem button divider component={Link} to={`/user/${tri.userId}`}>
          <ChevronLeft/> user
        </ListItem>
      </List>
    </div>
    <pre><code>
      {JSON.stringify(tri, null, 2)}
    </code></pre>
  </div>;
});
