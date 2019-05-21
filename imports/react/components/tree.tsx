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
              return <TableCell key={column._id} style={{ padding: 0 }}>
                <context.Views.Column context={context} column={column}/>
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
                <context.Views.Value context={context} data={document} column={column}/>
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
