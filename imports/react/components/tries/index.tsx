import { Button, Paper, Grid, List, ListItem, ListItemText, Tabs, Tab, LinearProgress } from '@material-ui/core';
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

const methods = (props, prevResults, call) => {
  return {};
};

const tracker = ({
  query,
  methodsResults: {},
}) => {
  const tc = Tries.find(query, { sort: { createdTime: 1 } });
  const tries = tc.fetch();
  const loading = !tc.ready();
  return {
    loading,
    tries,
  };
};

const Component = ({
  tryId,
  trackerResults: {
    loading,
    tries,
  },
}) => {
  return <List dense>
    {loading && <LinearProgress/>}
    {tries.map((tr) => {
      return <ListItem
        key={tr._id}
        button
        divider
        selected={tryId === tr._id}
        component={Link} to={`/try/${tr._id}`}
        style={{
          color: tr.errors ? tr.errors.length ? 'red' : 'green' : 'black',
        }}
      >
        <ListItemText primary={tr._id}/>
      </ListItem>;
    })}
  </List>
};

export default ({
  tryId = null,
  query = {},
}: {
  tryId?: string;
  query?: any;
}) => {
  const [tab, setTab] = useState('all');

  return <>
    <Tabs value={tab} centered onChange={(event, tab) => setTab(tab)}>
      <Tab value='all' label='All' style={{ minWidth: 0 }}/>
      <Tab value='success' label='Success' style={{ minWidth: 0 }}/>
      <Tab value='fail' label='Fail' style={{ minWidth: 0 }}/>
      <Tab value='wait' label='Wait' style={{ minWidth: 0 }}/>
    </Tabs>
    <Load
      query={{ ...query, ...(
        tab === 'success'
        ? { errors: { $exists: true, $size: 0 } }
        : tab === 'fail'
        ? { errors: { $exists: true, $not: {$size: 0} } }
        : tab === 'wait'
        ? { errors: { $exists: false } }
        : {}
      ) }}
      tryId={tryId}
      methods={methods}
      tracker={tracker}
      Component={Component}
    />
  </>;
};
