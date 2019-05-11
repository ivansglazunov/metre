import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from '../components/pagination/index';

import options from '../../api/collections/nodes/options/index';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment } from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';
import { Field } from './field';
import { SortIconButton } from './pagination/sort-icon-button';

export class Table extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return <ReactTable
      data={this.data(context)}
      columns={this.columns(context)}
      manual
      filterable
    />;
  };
  columns = (_context) => _context.config.columns.map(c => ({
    accessor: c._id,
    sortable: false,
    _context,
    Cell: this.Cell,
    Header: this.Header,
    Filter: this.Filter,
  }));
  data = (context) => {
    return _.map(context.trackerResults.data, data => ({ data, ...context }));
  }

  Cell = ({ original, column: { id } }) => original.Views.Value(original, original.storage.getColumn(id));
  Header = ({ column: { id, _context } }) => <div style={{ paddingTop: 5 }}>{_context.Views.Column(_context, _context.storage.getColumn(id))}</div>
  Filter = ({ column: { id, _context } }) => _context.Views.Filters(_context, _context.storage.getColumn(id));

  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}

export class Columns extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    const {storage, config, methodsResults, trackerResults, Views} = context;

    return <List dense>
      {config.columns.map(c => <ListItem key={c._id} divider>
        <Grid container justify="space-between" spacing={8}>
          <Grid item xs={12}>{Views.Column(context, c)}</Grid>
          <Grid item xs={12}>{Views.Filters(context, c)}</Grid>
        </Grid>
      </ListItem>)}
      <ListItem button onClick={() => storage.addColumn({ 
        getter: 'path', value: '_id', type: 'string',
      })}>
        <Add/>
      </ListItem>
    </List>;
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}

export class Sorts extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    const {storage, config, methodsResults, trackerResults, Views} = context;

    return <List dense>
      {config.sorts.map(sort => <ListItem key={sort._id} divider>
        <Grid container justify="space-between" spacing={8}>
          <Grid item xs={1}>
            <SortIconButton sort={sort} storage={storage} style={{ padding: 0 }}/>
          </Grid>
          <Grid item xs={10}>
            <Field
              value={sort.path}
              onChange={
                e => context.storage.setSort({ ...sort, path: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton style={{ padding: 0 }} onClick={
              e => context.storage.delSort(sort)
            }>
              <Clear/>
            </IconButton>
          </Grid>
        </Grid>
      </ListItem>)}
      <ListItem button onClick={() => storage.addSort({ 
        path: '_id', desc: -1
      })}>
        <Add/>
      </ListItem>
    </List>;
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
