import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from '../components/pagination/index';
import { Table, Filtrator } from '../components/table';
import { Field } from '../field';
import { mathEval } from '../../api/math';

import options from '../../api/collections/index/options/index';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, FormControl, InputLabel, Select, OutlinedInput, MenuItem } from '@material-ui/core';
import { Add, Clear, ArrowDropDown, ArrowDropUp, CloudQueue, CloudOff } from '@material-ui/icons';
import { ColumnSortIconButton, PathSortIconButton } from './sort-icon-button';

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
  values: (context, filter) => {
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
        <PathSortIconButton path="values.name" sorts={context.config.sorts} storage={context.storage} style={{ padding: 0 }}/>
      </Grid>
      <Grid item xs={4}>
        <Field
          label={'name regex'}
          value={filter && filter.value && filter.value.name || ''}
          onChange={
            e => context.storage.setFilter({ ...filter, value: { ..._.get(filter, 'value'), name: e.target.value }, })
          }
        />
      </Grid>
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <PathSortIconButton path="values.value" sorts={context.config.sorts} storage={context.storage} style={{ padding: 0 }}/>
      </Grid>
      <Grid item xs={4}>
        <Field
          label={'value regex'}
          value={filter && filter.value && filter.value.value || ''}
          onChange={
            e => context.storage.setFilter({ ...filter, value: { ..._.get(filter, 'value'), value: e.target.value }, })
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