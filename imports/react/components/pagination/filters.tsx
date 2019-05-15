import { Grid, IconButton } from '@material-ui/core';
import { Clear, CloudOff, CloudQueue } from '@material-ui/icons';
import * as React from 'react';

import { Field } from '../field';
import { PathSortIconButton } from './sort-icon-button';

export const types = {
  string: (context, filter) => {
    return <Grid
      container
      spacing={8}
      justify="space-between"
      key={filter._id}
    >
      <Grid item xs={11}>
        <Field
          label={'regex'}
          value={filter && filter.value || ''}
          onChange={
            e => context.storage.setFilter({ ...filter, value: e.target.value, })
          }
        />
      </Grid>
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <IconButton
          style={{ padding: 0 }}
          onClick={e => context.storage.delFilter(filter)}
        >
          <Clear />
        </IconButton>
      </Grid>
    </Grid>;
  },
  formula: (context, filter) => {
    const column = context.storage.getColumn(filter.columnId);

    return <Grid
      container
      spacing={8}
      justify="space-between"
      key={filter._id}
    >
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <IconButton
          style={{ padding: 0 }}
          onClick={e => context.storage.setFilter({ ...filter, onlyValues: !filter.onlyValues })}
        >
          {filter.onlyValues ? <CloudOff /> : <CloudQueue/>}
        </IconButton>
      </Grid>
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        {column && <PathSortIconButton path={`${column.value}.values.value`} sorts={context.config.sorts} storage={context.storage} style={{ padding: 0 }}/>}
      </Grid>
      <Grid item xs={9}>
        <Field
          label={'value regex'}
          value={filter && filter.value && filter.value.value || ''}
          onChange={
            e => context.storage.setFilter({ ...filter, value: e.target.value, })
          }
        />
      </Grid>
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <IconButton
          style={{ padding: 0 }}
          onClick={e => context.storage.delFilter(filter)}
        >
          <Clear />
        </IconButton>
      </Grid>
    </Grid>;
  },
};