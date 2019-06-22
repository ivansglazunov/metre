import { Button, Paper, Grid, List, ListItem, ListItemText, Tabs, Tab, Divider, LinearProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Projects, Tries, Users } from '../../../api/collections';
import Menu from '../../components/menu';
import { Load } from '../../components/load';
import ReactTable from 'react-table';
import { Link, withRouter } from 'react-router-dom';
import { useMetre } from '../../../api/metre/react';
import { isInRole } from '../../../api/collections/users';

const methods = (props, prevResults, call) => {
  return {};
};

const tracker = ({
  userId,
  tab,
  query,
  methodsResults: {},
}) => {
  const rc = Projects.find({
    ...(
      tab === 'available'
      ? { status: true }
      : tab === 'owned'
      ? { ownerUserId: userId }
      : {}
    ),
    ...query,
  }, { sort: { createdTime: 1 } });
  const projects = rc.fetch();
  const loading = !rc.ready();
  return {
    loading,
    projects,
  };
};

const Component = ({
  projectId,
  trackerResults: {
    loading,
    projects,
  },
}) => {
  return <List dense>
    {loading && <LinearProgress/>}
    {projects.map((project) => {
      return <ListItem
        key={project._id}
        button
        divider
        selected={projectId === project._id}
        component={Link} to={`/project/${project._id}`}

      >
        <ListItemText primary={project.title}/>
      </ListItem>;
    })}
  </List>;
};

const ProjectsCore = withRouter<any>(({
  userId,
  user,
  projectId = null,
  query = {},
  history,
  defaultTab,
  hideTabs = false,
  loading = true,
}: {
  userId?: string;
  user?: any;
  projectId?: string;
  query?: any;
  history?: any;
  defaultTab?: string;
  hideTabs?: boolean;
  loading?: boolean;
}) => {
  const [tab, setTab] = useState(defaultTab || (
    isInRole(user, 'admin')
    ? 'all'
    : isInRole(user, 'owner')
    ? 'owned'
    : 'available'
  ));

  if (loading) return <LinearProgress/>;

  return <>
    {!hideTabs && <Tabs centered value={tab} onChange={(event, tab) => setTab(tab)}>
      {isInRole(user, 'admin') && <Tab value="all" label="All" style={{ minWidth: 0 }}/>}
      <Tab value="available" label="Available" style={{ minWidth: 0 }}/>
      {isInRole(user, 'owner') && <Tab value="owned" label="Owned" style={{ minWidth: 0 }}/>}
      {isInRole(user, 'owner') && <Tab label="+" style={{ minWidth: 0 }} onClick={() => {
        const projectId = Projects.insert({
          title: 'New project',
          schema: {
            "type": "object",
            "properties": {
              "data": {
                "type": "number",
              }
            },
            "input": {
              "data": 123
            }
          }
        });
        setTab('owned');
        history.push(`/project/${projectId}`);
      }}/>}
    </Tabs>}
    <Divider/>
    <Load
      userId={userId}
      projectId={projectId}
      tab={tab}
      methods={methods}
      tracker={tracker}
      Component={Component}
    />
  </>;
});

export default withTracker<any, any>((props) => {
  const uc = Users.find({ _id: props.userId });
  return {
    props,
    loading: !uc.ready(),
    user: uc.fetch()[0],
  };
})(ProjectsCore);