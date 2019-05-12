import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from '../components/pagination/index';

import options from '../../api/collections/index/options/index';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment } from '@material-ui/core';
import { Add, Clear, DragIndicator } from '@material-ui/icons';
import { Field } from './field';
import { SortIconButton } from './pagination/sort-icon-button';
import treeTableHOC from "react-table/lib/hoc/treeTable";
import arrayMove from 'array-move';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

const ReactTreeTreeHOC = treeTableHOC(ReactTable);

export class Table extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return <ReactTreeTreeHOC
      {...this.props}
      pages={context.trackerResults.pages}
      data={this.data(context)}
      page={context.config.page}
      onPageChange={this.onPageChange(context)}
      pageSize={context.config.pageSize}
      onPageSizeChange={this.onPageSizeChange(context)}
      columns={this.columns(context)}
      manual
      filterable
      loading={!!context.trackerResults.loading}
    />;
  };
  onPageChange = (context) => (pageIndex) => context.storage.setPage(pageIndex);
  onPageSizeChange = (context) => (pageSize, pageIndex) => context.storage.setPageSize(pageIndex, pageSize);
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
  onSortEnd = (context) => ({ oldIndex, newIndex }) => {
    context.storage.setColumns(arrayMove(context.config.columns, oldIndex, newIndex));
  };
  SortableList = SortableContainer(({ children }) => {
    return <List dense>{children}</List>;
  });
  SortableItem = SortableElement(({ value, context }) => (
    <ListItem key={value._id} divider>
      <Grid container justify="space-between" spacing={8}>
        <Grid item xs={1}>
          <this.DragHandle/>
        </Grid>
        <Grid item xs={11}>
          <Grid container justify="space-between" spacing={8}>
            <Grid item xs={12}>{context.Views.Column(context, value)}</Grid>
            <Grid item xs={12}>{context.Views.Filters(context, value)}</Grid>
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  ));
  DragHandle = SortableHandle(() => <DragIndicator style={{ cursor: 'move' }}/>);
  consumerRender = (context: any) => {
    const {storage, config, methodsResults, trackerResults, Views} = context;

    return <this.SortableList onSortEnd={this.onSortEnd(context)} useDragHandle>
      {config.columns.map((c,i) => <this.SortableItem key={c._id} index={i} value={c} context={context}/>)}
      <ListItem button onClick={() => storage.addColumn({ 
        getter: 'path', value: '_id', type: 'string',
      })}>
        <Add/>
      </ListItem>
    </this.SortableList>;
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}

export class Sorts extends React.Component<any, any, any> {
  onSortEnd = (context) => ({ oldIndex, newIndex }) => {
    context.storage.setSorts(arrayMove(context.config.sorts, oldIndex, newIndex));
  };
  SortableList = SortableContainer(({ children }) => {
    return <List dense>{children}</List>;
  });
  SortableItem = SortableElement(({ value, context }) => (
    <ListItem key={value._id} divider>
      <Grid container justify="space-between" spacing={8}>
        <Grid item xs={1}>
          <this.DragHandle/>
        </Grid>
        <Grid item xs={1}>
          <SortIconButton sort={value} storage={context.storage} style={{ padding: 0 }}/>
        </Grid>
        <Grid item xs={9}>
          <Field
            value={value.path}
            onChange={
              e => context.storage.setSort({ ...value, path: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={1}>
          <IconButton style={{ padding: 0 }} onClick={
            e => context.storage.delSort(value)
          }>
            <Clear/>
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  ));
  DragHandle = SortableHandle(() => <DragIndicator style={{ cursor: 'move' }}/>);
  consumerRender = (context: any) => {
    const {storage, config, methodsResults, trackerResults, Views} = context;

    return <this.SortableList onSortEnd={this.onSortEnd(context)} useDragHandle>
      {config.sorts.map((sort, i) => <this.SortableItem key={sort._id} index={i} value={sort} context={context}/>)}
      <ListItem button onClick={() => storage.addSort({ 
        path: '_id', desc: -1
      })}>
        <Add/>
      </ListItem>
    </this.SortableList>;
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
