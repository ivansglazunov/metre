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
import { Nodes } from '../../../../../api/collections';

const defaultParse = (data) => data;

export const ViewValue = ({
  value, v, data, column,
  encode=defaultParse, decode=defaultParse,
}) => {
  const [field, type] = column.value.split('.');
  return <Grid container justify="space-between" spacing={1}>
    <Grid item xs={10}>
      <Field
        value={decode(value.value)}
        onChange={e => Meteor.call(`${Nodes._name}.values.${field}.set`, data._id, type, { _id: value._id, value: encode(e.target.value) })}
      />
    </Grid>
    <Grid item xs={2} style={{ textAlign: 'center' }}>
      <IconButton
        style={{ padding: 0 }}
        onClick={e => Meteor.call(`${Nodes._name}.values.${field}.pull`, data._id, type, value._id)}
      >
        <Clear />
      </IconButton>
    </Grid>
  </Grid>
};

export default ({
  value, data, column, context,
  encode=defaultParse, decode=defaultParse,
}: IConfig) => {
  const filters = context.storage.getFilters(column._id);
  const collection = value && _.isArray(value.values) ? value.values : [];
  const q = toQuery('value', filters);
  const values = find(collection, q).all();

  return <div>
    {values.map((value, n) => {
      return <div key={value._id}>
        <ViewValue data={data} value={value} v={n} column={column} encode={encode} decode={decode}/>
      </div>;
    })}
    <Grid item xs={12} style={{ textAlign: 'center' }}>
      <IconButton
        style={{ padding: 0 }}
        onClick={e => Meteor.call(`${Nodes._name}.values.strings.push`, data._id, column.value.split('.')[1], { value: '' })}
      >
        <Add />
      </IconButton>
    </Grid>
  </div>;
};
