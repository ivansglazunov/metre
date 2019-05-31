import { Grid, IconButton, Button, Popover } from '@material-ui/core';
import { Clear, CloudOff, CloudQueue, Cloud } from '@material-ui/icons';

import * as React from 'react';
import { useState } from 'react';

import { Field } from '../field';
import { PathSortIconButton } from './sort-icon-button';
import * as  _ from 'lodash';

const FilterCloudToggler = ({ context, filter }) => {
  return <IconButton
    style={{ padding: 0 }}
    onClick={e => context.storage.setFilter({ ...filter, deny: _.isUndefined(filter.deny) ? 'server' : filter.deny === 'server' ? 'client' : undefined })}
  >
  {!filter.deny && <Cloud/>}
  {filter.deny === 'client' && <CloudQueue/>}
  {filter.deny === 'server' && <CloudOff/>}
  </IconButton>;
};

const FilterDel = ({ context, filter }) => {
  return <IconButton
    style={{ padding: 0 }}
    onClick={e => context.storage.delFilter(filter)}
  >
    <Clear />
  </IconButton>;
};

const positionsType = (context, filter) => {
  const column = context.storage.getColumn(filter.columnId);
  return <Grid
    container
    spacing={1}
    justify="space-between"
    key={filter._id}
  >
    <Grid item xs={1} style={{ textAlign: 'center' }}>
      <FilterCloudToggler context={context} filter={filter}/>
    </Grid>
    <Grid item xs={2}>
      <Field
        label={'left'}
        value={filter && filter.value && filter.value.left || ''}
        type="string"
        onValidate={e => /^[0-9]*$/.test(e.target.value)}
        onChange={
          e => context.storage.setFilter({ ...filter, value: { ...filter.value, left: e.target.value, } })
        }
      />
    </Grid>
    <Grid item xs={2}>
      <Field
        label={'right'}
        value={filter && filter.value && filter.value.right || ''}
        type="string"
        onValidate={e => /^[0-9]*$/.test(e.target.value)}
        onChange={
          e => context.storage.setFilter({ ...filter, value: { ...filter.value, right: e.target.value, } })
        }
      />
    </Grid>
    <Grid item xs={2}>
      <Field
        label={'space'}
        value={filter && filter.value && filter.value.space || ''}
        onChange={
          e => context.storage.setFilter({ ...filter, value: { ...filter.value, space: e.target.value, } })
        }
      />
    </Grid>
    <Grid item xs={2}>
      <Field
        label={'tree'}
        value={filter && filter.value && filter.value.tree || ''}
        onChange={
          e => context.storage.setFilter({ ...filter, value: { ...filter.value, tree: e.target.value, } })
        }
      />
    </Grid>
    <Grid item xs={1} style={{ textAlign: 'center' }}>
      <FilterDel context={context} filter={filter}/>
    </Grid>
  </Grid>;
};

export const types = {
  string: (context, filter) => {
    return <Grid
      container
      spacing={1}
      justify="space-between"
      key={filter._id}
    >
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <FilterCloudToggler context={context} filter={filter}/>
      </Grid>
      <Grid item xs={10}>
        <Field
          label={'regex'}
          value={filter && filter.value || ''}
          onChange={
            e => context.storage.setFilter({ ...filter, value: e.target.value, })
          }
        />
      </Grid>
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <FilterDel context={context} filter={filter}/>
      </Grid>
    </Grid>;
  },
  formula: (context, filter) => {
    const column = context.storage.getColumn(filter.columnId);
    return <Grid
      container
      spacing={1}
      justify="space-between"
      key={filter._id}
    >
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <FilterCloudToggler context={context} filter={filter}/>
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
        <FilterDel context={context} filter={filter}/>
      </Grid>
    </Grid>;
  },
  tree: positionsType,
  ns: positionsType,
};

export const FilterType = ({ context, column, filter, filterIndex }) => {
  return <Grid container style={{ maxWidth: 400, padding: 6 }}>
    {types[filter.type]
    ? types[filter.type](context, filter)
    : <Grid key={filter._id} item xs={12}>?types[{filter.type}]</Grid>}
  </Grid>;
};
