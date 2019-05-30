import { Grid, IconButton } from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { find } from 'mingo';
import * as React from 'react';
import { useState } from 'react';

import { IConfig } from '.';
import { Field } from '../../../field';
import { toQuery } from '../../to-query';

export const ViewValueFormula = ({ value, v, data, column }) => {
  const result = data.formulaEval(value.value);

  return <Grid container justify="space-between" spacing={8}>
    <Grid item xs={8}>
      <Field
        value={value.value}
        onChange={e => Meteor.call('nodes.formulas.set', data._id, column.value.split('.')[1], { _id: value._id, value: e.target.value })}
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
        onClick={e => Meteor.call('nodes.formulas.pull', data._id, column.value.split('.')[1], value._id)}
      >
        <Clear />
      </IconButton>
    </Grid>
  </Grid>
};

export default ({ value, data, column, context }: IConfig) => {
  const filters = context.storage.getFilters(column._id);
  const collection = value && _.isArray(value.values) ? value.values : [];
  const q = toQuery('value', filters);
  const values = find(collection, q).all();

  return <div>
    {values.map((value, n) => {
      return <div key={value._id}>
        <ViewValueFormula data={data} value={value} v={n} column={column}/>
      </div>;
    })}
    <Grid item xs={12} style={{ textAlign: 'center' }}>
      <IconButton
        style={{ padding: 0 }}
        onClick={e => Meteor.call('nodes.formulas.push', data._id, column.value.split('.')[1], { value: '' })}
      >
        <Add />
      </IconButton>
    </Grid>
  </div>;
};
