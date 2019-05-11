import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../../api/collections/index';
import { Context, Provider } from '../../components/pagination/index';
import { Table, Columns } from '../../components/table';
import { Field } from '../field';
import { mathEval } from '../../../api/math';

import options from '../../../api/collections/index/options/index';
import { types as filterTypes } from './filters';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, FormControl, InputLabel, Select, OutlinedInput, MenuItem } from '@material-ui/core';
import { Add, Clear, ExpandLess, ExpandMore, UnfoldMore, Visibility, VisibilityOff } from '@material-ui/icons';

import { find } from 'mingo';
import { toQuery } from './to-query';
import { ColumnSortIconButton } from './sort-icon-button';

export const getters = [
  'path',
  'formula',
];

export const types = [
  'string',
  'values',
  'formula',
];

export const Views: any = {};

export class ViewValue extends React.Component<any, any, any> {
  state = {};
  render() {
    const { value, v, data } = this.props;
    const result = mathEval(value.value);

    return <Grid container justify="space-between" spacing={8}>
      <Grid item xs={3}>
        <Field
          value={value.name}
          onChange={e => Nodes.update(data._id, { $set: { [`values.${v}.name`]: e.target.value } })}
        />
      </Grid>
      <Grid item xs={5}>
        <Field
          value={value.value}
          onChange={e => Nodes.update(data._id, { $set: { [`values.${v}.value`]: e.target.value } })}
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
          onClick={e => Nodes.update(data._id, { $pull: { values: { _id: value._id } } })}
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

  if (column.type === 'string' || !column.type) {
    if (typeof (value) === 'object') return JSON.stringify(value);
    else return String(value);
  }

  if (column.type === 'values') {
    const filters = storage.getFilters(column._id);
    const numValue = find(_.isArray(value) ? _.map(value, value => ({ value })) : [], toQuery('value', filters)).all();

    return <div>
      {numValue.map(({ value: value }, n) => {
        return <div key={value._id}>
          <ViewValue data={data} value={value} v={n}/>
        </div>;
      })}
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <IconButton
          style={{ padding: 0 }}
          onClick={e => Nodes.update(data._id, { $push: { values: { _id: Random.id(), value: '', name: '' } } })}
        >
          <Add />
        </IconButton>
      </Grid>
    </div>;
  }
  if (column.type === 'formula') {
    // TODO formula value
    return 'formula';
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
    <Grid item xs={2}>
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
    <Grid item xs={6}>
      <Field
        label={column.getter}
        value={column && column.value || ''}
        onChange={e => context.storage.setColumn({
          ...column,
          value: e.target.value,
        })}
      />
    </Grid>
    <Grid item xs={2}>
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
  </Grid>;
};

Views.Filters = (context, column: any) => {
  const filters = context.storage.getFilters(column._id);
  
  return <Grid container>
    {filters.map(filter => filterTypes[filter.type]
      ? filterTypes[filter.type](context, column, filter)
      : <Grid key={filter._id} item xs={12}>unexpected filter type {filter.type}</Grid>
    )}
    <Grid item xs={12} style={{ textAlign: 'center' }}>
      <IconButton style={{ padding: 0 }} onClick={
        e => context.storage.addFilter({ _id: Random.id(), columnId: column._id, type: column.type })
      }><Add/></IconButton>
    </Grid>
  </Grid>;
};
