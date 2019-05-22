import { Grid, LinearProgress, Tab, Tabs, Button } from '@material-ui/core';

import * as React from 'react';
import { useState } from 'react';

import { Nodes } from '../../../api/collections';
import { Columns } from '../../components/columns';
import { Filters } from '../../components/filters';
import { Context as PaginationContext } from '../../components/pagination';
import { Sorts } from '../../components/sorts';
import { Table } from '../../components/table';
import * as  _ from 'lodash';

export const defaultStore = {
  filters: [],
  sorts: [
    { _id: 'a', path: 'values.width.values.value', desc: -1 },
  ],
  columns: [
    { _id: 'tree', getter: 'path', value: 'positions', type: 'tree', variant: 'short' },
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

export const tracker = ({ config: { sort, nests }, methodsResults: { loading, ids, pages } }) => {
  const c = Nodes.find({ _id: { $in: ids } });
  const d = c.fetch();
  const data = [];
  if (ids) for (let i = 0; i < ids.length; i++) {
    const doc = Nodes.findOne(ids[i], { subscribe: false });
    data.push(doc);
    if (nests[ids[i]]) {
      const pIds = _.keys(nests[ids[i]]);
      for (let p = 0; p < pIds.length; p++) {
        const _nest = nests[ids[i]][pIds[p]];
        const nest = _nest && doc && doc.positions ? _.find(doc.positions, p => p._id === _nest._id) : null;
        if (nest) {
          const nodes = Nodes.find({ 'positions': { $elemMatch: { tree: nest.tree, space: nest.space, left: { $gt: nest.left }, right: { $lt: nest.right } } } }).fetch();
          let children = [];
          for (let n = 0; n < nodes.length; n++) {
            const node = nodes[n];
            for (let p = 0; p < node.positions.length; p++) {
              const pos = node.positions[p];
              if (pos.tree === nest.tree && pos.space === nest.space && pos.left > nest.left && pos.right < nest.right) {
                children.push({
                  ...node,
                  ___nestPosition: pos,
                  ___parentNestPosition: nest,
                });
              }
            }
          }
          children = _.sortBy(children, n => n.___nestPosition.left);
          data.push(...children);
        }
      }
    }
  }
  console.log(data);
  return { data, pages, loading: loading || !c.ready() };
};

const tabs = [
  'columns',
  'filters',
  'sorts',
];

export default () => {
  const [tab, setTab] = useState('columns');

  return <Grid container>
    {tab !== 'closed' && <Grid item sm={4}>
      <Tabs value={tab} onChange={(event, value) => setTab(value)}>
        {tabs.map(t => <Tab value={t} label={t} style={{ minWidth: 0 }}/>)}
        <Tab value="closed" label="close" style={{ minWidth: 0 }}/>
      </Tabs>
      {tab === 'columns' && <Columns />}
      {tab === 'filters' && <Filters />}
      {tab === 'sorts' && <Sorts />}
    </Grid>}
    {tab === 'closed' && <Grid item sm={1}>
      {tabs.map(t => <Button key={t} fullWidth onClick={() => setTab(t)}>{t}</Button>)}
    </Grid>}
    <Grid item sm={tab !== 'closed' ? 8 : 11}>
      <Table />
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

