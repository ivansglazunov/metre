import { Grid, List, ListItem } from '@material-ui/core';
import { Add, DragIndicator } from '@material-ui/icons';
import arrayMove from 'array-move';
import * as React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import { Context } from '../';

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
