import { Grid, LinearProgress, Tab, Tabs, Button } from '@material-ui/core';

import * as React from 'react';
import { useState } from 'react';

import { Nodes } from '../../../api/collections';

import { Context as PaginationContext } from '../../components/pagination';

import { Columns } from '../../components/pagination/viewers/columns';
import { Filters } from '../../components/pagination/viewers/filters';
import { Sorts } from '../../components/pagination/viewers/sorts';

import { Table } from '../../components/pagination/viewers/table';
import { Graph } from '../../components/pagination/viewers/graph';
import { List } from '../../components/pagination/viewers/list';

import * as  _ from 'lodash';

export const defaultStore = {
  filters: [],
  sorts: [
    { _id: 'a', path: 'nesting', desc: -1 },
  ],
  columns: [
    { _id: 'ns', getter: 'path', value: 'nesting', type: 'ns' },
    { _id: 'a', getter: 'path', value: 'strings.title', type: 'strings' },
    { _id: 'b', getter: 'path', value: 'formulas.width', type: 'formula' },
    { _id: 'c', getter: 'path', value: 'formulas.height', type: 'formula' },
    { _id: 'd', getter: 'path', value: '_id', type: 'string' },
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

export const tracker = ({ config: { sort, nests }, methodsResults: { loading, ids, pages } }) => {
  const c = Nodes.find({ _id: { $in: ids } });
  const data = [];
  if (ids) for (let i = 0; i < ids.length; i++) {
    const doc = Nodes.findOne(ids[i], { subscribe: false });
    if (doc) {
      data.push(doc);
      if (nests[ids[i]]) {
        const pIds = _.keys(nests[ids[i]]);
        for (let p = 0; p < pIds.length; p++) {
          const nest = nests[ids[i]][pIds[p]] && doc && doc.nesting ? _.find(doc.nesting, pos => pos._id === pIds[p]) : null;
          const results = doc.__nsFind({ sort: true, trace: true, limitDepth: 999, position: nest, field: 'nesting' });
          if (nest) data.push(...results);
        }
      }
    }
  }
  return { data, pages, loading: loading || !c.ready() };
};

const configs = [
  'columns',
  'filters',
  'sorts',
];

const views = [
  'table',
  'graph',
  'list',
];

export default () => {
  const [config, setConfig] = useState('columns');
  const [view, setView] = useState('table');

  return <Grid container>
    {config !== 'closed' && <Grid item sm={4}>
      <Tabs value={config} onChange={(event, value) => setConfig(value)}>
        {configs.map(t => <Tab key={t} value={t} label={t} style={{ minWidth: 0 }}/>)}
        <Tab value="closed" label="close" style={{ minWidth: 0 }}/>
      </Tabs>
      {config === 'columns' && <Columns />}
      {config === 'filters' && <Filters />}
      {config === 'sorts' && <Sorts />}
    </Grid>}
    {config === 'closed' && <Grid item sm={1}>
      {configs.map(t => <Button key={t} fullWidth onClick={() => setConfig(t)}>{t}</Button>)}
    </Grid>}
    <Grid item sm={config !== 'closed' ? 8 : 11}>
      <Tabs value={view} onChange={(event, value) => setView(value)}>
        {views.map(t => <Tab key={t} value={t} label={t} style={{ minWidth: 0 }}/>)}
      </Tabs>
      {view === 'table' && <Table />}
      {view === 'graph' && <Graph />}
      {view === 'list' && <List />}
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
  </Grid>;
};

