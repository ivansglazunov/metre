import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from '../components/pagination';
import { Table } from '../components/table';
import { mathEval } from '../../api/math';

import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton } from '@material-ui/core';

export const Field = (props) => <TextField
  value={props.value || ''}
  style={{ margin: 0, ...props.style }}
  margin="normal"
  variant="outlined"
  InputLabelProps={{
    shrink: true,
  }}
  inputProps={{
    style: {
      padding: 3,
    },
  }}
  SelectProps={{
    SelectDisplayProps: {
      style: {
        padding: 3,
      },
    },
  }}
  fullWidth
  {...props}
/>

export default class MathPage extends React.Component<any, any, any> {
  state = {
    nums: {
      a: _.random(1, 9999),
      b: _.random(1, 9999),
      c: _.random(1, 9999),
      d: _.random(1, 9999),
      e: _.random(1, 9999),
      f: {
        g: _.random(1, 9999),
        h: _.random(1, 9999),
        i: _.random(1, 9999),
        j: _.random(1, 9999),
        k: _.random(1, 9999),
      },
      get x() { return 543; },
      get z() { return { get y() { return 777; } } },
    },
    formula: '',
  };
  onChangeFormula = e => this.setState({ formula: e.target.value });
  render() {
    const { nums, formula } = this.state;

    const { value } = mathEval(formula, nums);

    return <Grid container>
      <Grid item sm={6}>
        <pre><code>{JSON.stringify(nums, null, 1)}</code></pre>
      </Grid>
      <Grid item sm={6}>
        <Field
          value={formula}
          onChange={this.onChangeFormula}
        />
        <div>
          <h4>{value}</h4>
        </div>
      </Grid>
    </Grid>;
  }
}
