import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from './pagination/index';

import options from '../../api/collections/index/options/index';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
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

export class Tree extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return <Table>
      <TableHead>
        <TableRow>
          {context.config.columns.map(
            column => {
              const viewColumn = context.Views.Column(context, column);
              return <TableCell key={column._id} style={{ padding: 0, minWidth: viewColumn.minWidth || 0, maxWidth: viewColumn.maxWidth || 0 }}>
                {viewColumn.element}
              </TableCell>;
            }
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {context.trackerResults.data.map(
          document => <TableRow key={document._id}>
            {context.config.columns.map(
              column => <TableCell key={column._id} style={{ padding: 0 }}>
                {context.Views.Value({ ...context, data: document }, column)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
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
    ...this.columnWidths(_context, c._id),
  }));
  data = (context) => {
    return _.map(context.trackerResults.data, data => ({ data, ...context }));
  };

  columnWidths = (context, id) => {
    const { minWidth, maxWidth } = context.Views.Column(context, context.storage.getColumn(id));
    return { minWidth, maxWidth };
  };

  Cell = ({ original, column: { id } }) => original.Views.Value(original, original.storage.getColumn(id));
  Header = ({ column: { id, _context } }) => <div style={{ paddingTop: 5 }}>{_context.Views.Column(_context, _context.storage.getColumn(id)).element}</div>
  Filter = ({ column: { id, _context } }) => _context.Views.Filters(_context, _context.storage.getColumn(id));

  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
