import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import {Users, Nodes} from '../../api/collections/index';
import { Context as PaginationContext, Provider as PaginationProvider } from '../components/pagination/index';
import { Context as StoreContext, Provider as StoreProvider } from '../components/store/params';
import {Table, Columns, Sorts} from '../components/table';
import { Field } from '../components/field';
import { Views } from '../components/pagination/views';

import options from '../../api/collections/index/options/index';

import ReactTable from 'react-table';
import {TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Tabs, Tab, LinearProgress} from '@material-ui/core';
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
        <Tab value='columns' label='columns' style={{ minWidth: 0 }} />
        <Tab value='sorts' label='sorts' style={{ minWidth: 0 }} />
      </Tabs>
      {tab === 'columns' && <Columns />}
      {tab === 'sorts' && <Sorts />}
    </React.Fragment>
  }
}

const methods = ({ config: { page, pageSize, query, sort } }, prevResults, call) => {
  const _pages = call('pages', 'nodes.count', query, { sort });
  const pages = Math.ceil((_pages.result || 0) / pageSize);
  const _ids = call('data', 'nodes.ids', query, {
    skip: pageSize * page,
    limit: pageSize,
    sort,
  });
  const ids = _ids.result || [];
  return { pages, ids, loading: _pages.loading || _ids.loading };
};

const tracker = ({ config: { sort }, methodsResults: { loading, ids, pages } }) => {
  const c = Nodes.find({ _id: { $in: ids } });
  const d = c.fetch();
  const data = (ids && ids.map(id => Nodes.findOne(id, { subscribe: false }))) || [];
  return { data, pages, loading: loading || !c.ready() };
};

export default () => (
  <StoreProvider
    name="store"
    default={{
      filters: [],
      sorts: [
        { _id: 'a', path: 'values.value', desc: -1 },
      ],
      columns: [
        { _id: 'a', getter: 'path', value: '_id', type: 'string' },
        { _id: 'b', getter: 'path', value: 'values', type: 'values' },
      ],
    }}
  >
    <StoreContext.Consumer>
      {({ value, set }) => (
        <PaginationProvider
          methods={methods}
          tracker={tracker}

          Views={Views}

          value={value}
          set={set}
        >
          <Grid container>
            <Grid item sm={4}><LeftMenu /></Grid>
            <Grid item sm={8}><Table /></Grid>
            <PaginationContext.Consumer>
              {({ storage, config, methodsResults, trackerResults }: any) => (
                trackerResults.loading
                  ? <LinearProgress />
                  : <Grid container>
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
            </PaginationContext.Consumer>
          </Grid>
        </PaginationProvider>
      )}
    </StoreContext.Consumer>
  </StoreProvider>
);