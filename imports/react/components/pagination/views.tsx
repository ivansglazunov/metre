import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../../api/collections/index';
import { Context, Provider } from '../../components/pagination/index';
import { Field } from '../field';
import { mathEval } from '../../../api/math';

import options from '../../../api/collections/index/options/index';
import { types as filterTypes } from './filters';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, FormControl, InputLabel, Select, OutlinedInput, MenuItem } from '@material-ui/core';
import { Add, Clear, ExpandLess, ExpandMore, UnfoldMore, Visibility, VisibilityOff, ChevronLeft, ChevronRight, ArrowRight, ArrowDropDown } from '@material-ui/icons';

import { find } from 'mingo';
import { toQuery } from './to-query';
import { ColumnSortIconButton } from './sort-icon-button';

export const getters = [
  'path',
  'formula',
];

export const types = [
  'ns',
  'string',
  'formula',
];

export const Views: any = {};

export class ViewValue extends React.Component<any, any, any> {
  state = {};
  render() {
    const { value, v, data, column } = this.props;
    const result = mathEval(value.value);

    return <Grid container justify="space-between" spacing={8}>
      <Grid item xs={8}>
        <Field
          value={value.value}
          onChange={e => Meteor.call('nodes.values.set', data._id, column.value.split('.')[1], { _id: value._id, value: e.target.value })}
        />
      </Grid>
      <Grid item xs={3}>
        <Field
          value={result.value}
          disabled
        />
      </Grid>
      <Grid item xs={1} style={{ textAlign: 'center' }}>
        <IconButton
          style={{ padding: 0 }}
          onClick={e => Meteor.call('nodes.values.pull', data._id, column.value.split('.')[1], value._id)}
        >
          <Clear />
        </IconButton>
      </Grid>
    </Grid>
  }
}

Views.Value = ({ storage, data }, column: any) => {
  let value;
  if (column.getter === 'path') value = _.get(data, column.value);
  else if (column.getter === 'formula') value = mathEval(column.value, data).result;
  else return null;

  if (column.type === 'ns' || !column.type) {
    if (_.isArray(value)) {
      return <div style={{ height: '100%' }}>
        {value.map(p => <div key={p._id}>
          <Button fullWidth style={{ textAlign: 'left' }}><ArrowRight/>{p.depth} {p.left}/{p.right}</Button>
        </div>)}
      </div>;
    }
    return null;
  }

  if (column.type === 'string' || !column.type) {
    if (typeof (value) === 'object') return JSON.stringify(value);
    else return String(value);
  }

  if (column.type === 'formula') {
    const filters = storage.getFilters(column._id);
    const collection = value && _.isArray(value.values) ? value.values : [];
    const q = toQuery(column.value, filters);
    const values = find(collection, q).all();

    return <div>
      {values.map((value, n) => {
        return <div key={value._id}>
          <ViewValue data={data} value={value} v={n} column={column}/>
        </div>;
      })}
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <IconButton
          style={{ padding: 0 }}
          onClick={e => Meteor.call('nodes.values.push', data._id, column.value.split('.')[1], { value: '' })}
        >
          <Add />
        </IconButton>
      </Grid>
    </div>;
  }
  return null;
};

Views.Column = (context, column: any) => {
  return <Grid
    container
    spacing={8}
    style={{ textAlign: 'left' }}
    justify="space-between"
  >
    <Grid item xs={1} style={{ textAlign: 'center' }}>
      <ColumnSortIconButton column={column} storage={context.storage} style={{ padding: 0 }}/>
    </Grid>
    <Grid item xs={5}>
      <Field
        select
        label={'getter'}
        value={column && column.getter || 'path'}
        onChange={e => context.storage.setColumn({
          ...column,
          getter: e.target.value,
        })}
      >
        {getters.map((g, i) => <option key={i} value={g}>{g}</option>)}
      </Field>
    </Grid>
    <Grid item xs={5}>
      <Field
        select
        label={'type'}
        value={column && column.type || 'string'}
        onChange={e => context.storage.setColumn({
          ...column,
          type: e.target.value,
        })}
      >
        {types.map((t, i) => <option key={i} value={t}>{t}</option>)}
      </Field>
    </Grid>
    <Grid item xs={1} style={{ textAlign: 'center' }}>
      <IconButton
        style={{ padding: 0 }}
        onClick={() => context.storage.delColumn(column)}
      >
        <Clear />
      </IconButton>
    </Grid>
    <Grid item xs={12}>
      <Field
        label={column.getter}
        value={column && column.value || ''}
        onChange={e => context.storage.setColumn({
          ...column,
          value: e.target.value,
        })}
      />
    </Grid>
  </Grid>;
};

Views.Filter = (context, filter: any) => {
  return filterTypes[filter.type]
  ? filterTypes[filter.type](context, filter)
  : <Grid key={filter._id} item xs={12}>unexpected filter type {filter.type}</Grid>
};

Views.Filters = (context, column: any) => {
  const filters = context.storage.getFilters(column._id);
  
  return <Grid container>
    {filters.map(filter => Views.Filter(context, filter))}
    <Grid item xs={12} style={{ textAlign: 'center' }}>
      <IconButton style={{ padding: 0 }} onClick={
        e => context.storage.addFilter({ _id: Random.id(), columnId: column._id, type: column.type })
      }><Add/></IconButton>
    </Grid>
  </Grid>;
};

Views.Pagination = (context) => {
  const page = context.config.page || 0;
  const { pages } = context.methodsResults;
  const df = page > 5 ? 5 : page;
  const ps = _.times(pages, p => p).splice(
    (page - 5) < 0 ? 0 : (page - 5),
    df + 5,
  );

  return <Grid
    container
    spacing={8}
    justify="center"
  >
    <Grid item style={{ textAlign: 'center' }}>
      <IconButton style={{ padding: 0 }} onClick={
        () => context.storage.setPage(context.config.page - 1)
      }>
        <ChevronLeft/>
      </IconButton>
      {ps.map(p => (
        p === page
        ? <Field
          value={`${page}`}
          type="number"
          max={pages - 1}
          min={0}
          onChange={e => context.storage.setPage(+e.target.value)}
          style={{ width: 50 }}
          inputProps={{
            style: {
              padding: 5, textAlign: 'center',
            },
          }}
        />
        : <Button
          disabled={p === page}
          size="small" style={{ minWidth: 0 }}
          onClick={
            () => context.storage.setPage(p)
          }
        >{p}</Button>
      ))}
      <IconButton style={{ padding: 0 }} onClick={
        () => context.storage.setPage(context.config.page + 1)
      }>
        <ChevronRight/>
      </IconButton>
    </Grid>
  </Grid>;
};
