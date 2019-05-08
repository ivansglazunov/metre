import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from '../components/pagination';
import { Table, Filtrator } from '../components/table';
import { Field } from '../components/field';
import { mathEval } from '../../api/math';

import options from '../../api/collections/nodes/options/index';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, FormControl, InputLabel, Select, OutlinedInput, MenuItem } from '@material-ui/core';
import { Add, Clear, ArrowDropDown } from '@material-ui/icons';

export const getters = [
  'path',
  'formula',
];

export const types = [
  'string',
  'nums',
  'formula',
];

export const Views: any = {};

class A extends React.Component {
  state = {
    value: '',
  };
  render() {
    return <TextField
      value={this.state.value}
      onChange={e => this.setState({ value: e.target.value })}
    />;
  }
}

Views.Value = ({ data }, column: any) => {
  let value;
  if (column.getter === 'path') value = _.get(data, column.value);
  else if (column.getter === 'formula') value = mathEval(column.value, data).result;
  else return null;

  if (column.type === 'string' || !column.type) {
    if (typeof (value) === 'object') return JSON.stringify(value);
    else return String(value);
  }
  if (column.type === 'nums') {
    return <List>
      {_.isArray(value) && value.map((num, n) => {
        const result = mathEval(num.value);
        return <ListItem key={num._id}>
          <Grid container>
            <Grid item xs={6}>
              {num.name}
            </Grid>
            <Grid item xs={6}>
              {result.value}
            </Grid>
            <Grid item xs={12}>
              <Field
                value={num.value}
                onChange={e => Nodes.update(data._id, { $set: { [`nums.${n}.value`]: e.target.value } })}
              />
            </Grid>
          </Grid>
        </ListItem>;
      })}
    </List>;
  }
  if (column.type === 'formula') {
    // TODO formula value
    return 'formula';
  }
  return null;
};
Views.Column = (context, column: any) => <Grid
  container
  spacing={8}
  style={{ textAlign: 'left' }}
>
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
  <Grid item>
    <IconButton
      style={{ padding: 0 }}
      onClick={() => context.storage.delColumn(column)}
    >
      <Clear />
    </IconButton>
  </Grid>
</Grid>;

Views.Filters = (context, column: any) => {
  const filter = context.storage.getFilters(column._id)[0];
  const defFilter = (merge) => {
    if (filter) {
      context.storage.setFilter({
        ...filter,
        ...merge,
      });
    } else {
      context.storage.addFilter({
        _id: Random.id(),
        columnId: column._id,
        ...merge,
      });
    }
  };
  if (column.getter !== 'path') return null;

  if (column.type === 'string') {
    return <Field
      label={'regex'}
      value={filter && filter.value || ''}
      onChange={e => defFilter({
        ...filter,
        type: 'regex',
        value: e.target.value,
        query: e.target.value ? { [column.value]: { $regex: e.target.value }, } : {},
      })}
    />;
  }

  if (column.type === 'nums') {
    // TODO nums filter
    return 'nums';
  }

  if (column.type === 'formula') {
    return <Field
      label={'formula'}
      value={filter && filter.value || ''}
      onChange={e => defFilter({
        ...filter,
        type: 'formula',
        value: e.target.value,
        query: null,
      })}
    />;
  }

  return null;
};
