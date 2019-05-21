import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from './pagination/index';

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

export class Columns extends React.Component<any, any, any> {
  onSortEnd = (context) => ({ oldIndex, newIndex }) => {
    context.storage.setColumns(arrayMove(context.config.columns, oldIndex, newIndex));
  };
  SortableList = SortableContainer(({ children }) => {
    return <List dense>{children}</List>;
  });
  SortableItem = SortableElement(({ value: column, context }) => (
    <ListItem key={column._id} divider>
      <Grid container justify="space-between" spacing={8}>
        <Grid item xs={1}>
          <this.DragHandle/>
        </Grid>
        <Grid item xs={11}>
          <Grid container justify="space-between" spacing={8}>
            <Grid item xs={12}><context.Views.Column context={context} column={{ ...column, variant: 'full' }}/></Grid>
            <Grid item xs={12}><context.Views.FiltersList context={context} column={column} filters={context.storage.getFilters(column._id)}/></Grid>
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
