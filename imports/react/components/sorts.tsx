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
