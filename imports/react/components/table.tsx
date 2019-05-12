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
