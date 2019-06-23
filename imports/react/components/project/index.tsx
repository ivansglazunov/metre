import { Button, Paper, List, ListItem, ListItemText, Tabs, Tab, Divider, TextField, LinearProgress, Checkbox, FormControlLabel } from '@material-ui/core';
import { ChevronLeft, Clear } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Users, Projects, Tries } from '../../../api/collections';
import Menu from '../menu';
import { Load } from '../load';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { Field } from '../field';
import TriesMenu from '../tries';
import Test from '../test';
import { isInRole } from '../../../api/collections/users';
import Chart from './chart';

export default withTracker<any, any>(({
  projectId,
  userId,
}) => {
  const uc = Users.find({ _id: userId });
  const pc = Projects.find({ _id: projectId });
  return {
    projectId,
    loading: !pc.ready() || !uc.ready(),
    project: pc.fetch()[0],
    user: uc.fetch()[0],
  };
})(({
  projectId,
  project,
  user,
  loading,
}) => {
  const [tab, setTab] = useState('project');

  if (loading) return <LinearProgress/>;
  if (!project) return <div>Project {projectId} not founded.</div>;

  return <>
    <Tabs value={tab} centered onChange={(event, tab) => setTab(tab)}>
      <Tab value='project' label='Project' style={{ minWidth: 0 }}/>
      <Tab value='tries' label='Tries' style={{ minWidth: 0 }}/>
      <Tab value='chart' label='Chart' style={{ minWidth: 0 }}/>
      <Tab value='try' label='Try' style={{ minWidth: 0 }}/>
    </Tabs>
    {tab === 'project' && <div
      style={{ padding: 16, textAlign: 'left' }}
    >
      <div>
        <List dense>
          <ListItem button divider disabled={!project.ownerUserId} component={Link} to={`/user/${project.ownerUserId}`}>
            {project.ownerUserId ? <ChevronLeft/> : <Clear/>} user
          </ListItem>
        </List>
      </div>
      <div>
        <Field
          label="title"
          variant="outlined"
          value={project.title}
          disabled={!(isInRole(user, 'admin') || isInRole(user, 'owner'))}
          onChange={e => Projects.update(project._id, { $set: { title: e.target.value } })}
        />
      </div>
      <div>
        <Field
          label="description"
          variant="outlined"
          multiline
          value={project.description}
          disabled={!(isInRole(user, 'admin') || isInRole(user, 'owner'))}
          onChange={e => Projects.update(project._id, { $set: { description: e.target.value } })}
        />
      </div>
      <div>
        Validation schema in standart of <a href="http://json-schema.org">json-schema</a>.
      </div>
      <div>
        <Field
          label="schema"
          variant="outlined"
          multiline
          value={JSON.stringify(project.schema, null, 2)}
          disabled={!(isInRole(user, 'admin') || isInRole(user, 'owner'))}
          allowInvalidValue={true}
          onValidate={e => {
            try {
              const obj = JSON.parse(e.target.value);
              return typeof(obj) === 'object';
            } catch(error) {
              return false;
            }
          }}
          onChange={e => {
            try {
              Projects.update(project._id, { $set: { schema: JSON.parse(e.target.value) } })
            } catch(error) {}
          }}
        />
      </div>
      <div>
        <Field
          label="input"
          variant="outlined"
          multiline
          value={JSON.stringify(project.input, null, 2)}
          disabled={!(isInRole(user, 'admin') || isInRole(user, 'owner'))}
          allowInvalidValue={true}
          onValidate={e => {
            try {
              const obj = JSON.parse(e.target.value);
              return typeof(obj) === 'object';
            } catch(error) {
              return false;
            }
          }}
          onChange={e => {
            try {
              Projects.update(project._id, { $set: { input: JSON.parse(e.target.value) } })
            } catch(error) {}
          }}
        />
      </div>
      <div>
        <FormControlLabel
          control={
            <Checkbox
              checked={project.status}
              disabled={!(isInRole(user, 'admin') || isInRole(user, 'owner'))}
              onChange={e => Projects.update(project._id, { $set: { status: !project.status } })}
            />
          }
          label={`Status: ${project.status ? 'active' : 'deactive'}`}
        />
      </div>
      <div>
        <pre><code>
          {JSON.stringify(project, null, 2)}
        </code></pre>
      </div>
    </div>}
    {tab === 'tries' && <TriesMenu query={{ projectId: project._id }}/>}
    {tab === 'chart' && <Chart projectId={projectId}/>}
    {tab === 'try' && <Test projectId={projectId}/>}
  </>;
});
