import { Grid, LinearProgress, Tab, Tabs } from '@material-ui/core';
import * as React from 'react';

import { Nodes } from '../../../api/collections';
import { Columns } from '../../components/columns';
import { Filters } from '../../components/filters';
import { Context as PaginationContext } from '../../components/pagination';
import { Sorts } from '../../components/sorts';
import { Table } from '../../components/table';
import { Tree } from '../../components/tree';

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
        <Tab value='filters' label='filters' style={{ minWidth: 0 }} />
        <Tab value='sorts' label='sorts' style={{ minWidth: 0 }} />
      </Tabs>
      {tab === 'columns' && <Columns />}
      {tab === 'filters' && <Filters />}
      {tab === 'sorts' && <Sorts />}
    </React.Fragment>
  }
}

export const defaultStore = {
  filters: [],
  sorts: [
    { _id: 'a', path: 'values.width.values.value', desc: -1 },
  ],
  columns: [
    { _id: 'ns', getter: 'path', value: 'positions', type: 'ns' },
    { _id: 'a', getter: 'path', value: '_id', type: 'string' },
    { _id: 'b', getter: 'path', value: 'values.width', type: 'formula' },
    { _id: 'c', getter: 'path', value: 'values.height', type: 'formula' },
  ],
};

export const methods = ({ config: { page, pageSize, query, sort } }, prevResults, call) => {
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

export const tracker = ({ config: { sort }, methodsResults: { loading, ids, pages } }) => {
  const c = Nodes.find({ _id: { $in: ids } });
  const d = c.fetch();
  const data = (ids && ids.map(id => Nodes.findOne(id, { subscribe: false }))) || [];
  return { data, pages, loading: loading || !c.ready() };
};

export default class extends React.Component {
  state = {
    tab: 'table',
  }
  onChange = (event, value) => this.setState({ tab: value });

  render() {
    const { tab } = this.state;
    
    return <Grid container>
      <Grid item sm={4}><LeftMenu /></Grid>
      <Grid item sm={8}>
        <Tabs value={tab} onChange={this.onChange}>
          <Tab value='table' label='table' style={{ minWidth: 0 }} />
          <Tab value='tree' label='tree' style={{ minWidth: 0 }} />
        </Tabs>
        {tab === 'table' && <Table />}
        {tab === 'tree' && <Tree />}
      </Grid>
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
  }
}
