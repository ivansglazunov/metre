import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import {Users, Nodes} from '../../api/collections/index';
import {Context, Provider} from '../components/pagination/index';
import {Table, Columns, Sorts} from '../components/table';
import { Field } from '../components/field';
import { Views } from '../components/pagination/views';

import options from '../../api/collections/nodes/options/index';

import ReactTable from 'react-table';
import {TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Tabs, Tab} from '@material-ui/core';
import {Add, Clear, ArrowDropDown} from '@material-ui/icons';

export class LeftMenu extends React.Component<any, any, any> {
  state = {
    tab: 'columns',
  }
  onChange = (event, value) => this.setState({ tab: value });
  render() {
    const { tab } = this.state;

    return <React.Fragment>
      <Tabs value={tab} onChange={this.onChange}>
        <Tab value='columns' label='columns' style={{ minWidth: 0 }}/>
        <Tab value='sorts' label='sorts' style={{ minWidth: 0 }}/>
      </Tabs>
      {tab === 'columns' && <Columns />}
      {tab === 'sorts' && <Sorts />}
    </React.Fragment>
  }
}

const methods = ({config: {page, pageSize, query, sort}}, prevResults, call) => ({
  pages: Math.ceil((call('pages', 'nodes.count', query, {sort}) || 0) / pageSize),
  ids: call('data', 'nodes.ids', query, {
    skip: pageSize * page,
    limit: pageSize,
    sort,
  }) || [],
});

const tracker = ({config: {sort}, methodsResults: {ids}}) => {
  const _data = Nodes.find({_id: {$in: ids}}).fetch();
  const data = (ids && ids.map(id => Nodes.findOne(id, { subscribe: false }))) || [];
  return { data };
};

export default () => <Provider
  methods={methods}
  tracker={tracker}

  value={{ pageSize: 10 }}

  filters={[]}
  sorts={[
    { path: 'nums.value', desc: -1 },
  ]}
  columns={[
    { getter: 'path', value: '_id', type: 'string' },
    { getter: 'path', value: 'nums', type: 'nums' },
  ]}
  Views={Views}
>
  <Grid container>
    <Grid item sm={4}><LeftMenu/></Grid>
    <Grid item sm={8}><Table /></Grid>
    <Context.Consumer>
      {({storage, config, methodsResults, trackerResults}: any) => (
        <Grid container>
          <Grid item sm={4}>
            <pre><code>{JSON.stringify(config, null, 1)}</code></pre>
          </Grid>
          <Grid item sm={4}>
            <pre><code>{JSON.stringify(methodsResults, null, 1)}</code></pre>
          </Grid>
          <Grid item sm={4}>
            <pre><code>{JSON.stringify(trackerResults, null, 1)}</code></pre>
          </Grid>
        </Grid>
      )}
    </Context.Consumer>
  </Grid>
</Provider>;