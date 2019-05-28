import { Grid, List, ListItem } from '@material-ui/core';
import { DragIndicator } from '@material-ui/icons';
import arrayMove from 'array-move';
import * as React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import { Context } from '../';

export class Filters extends React.Component<any, any, any> {
  onSortEnd = (context) => ({ oldIndex, newIndex }) => {
    context.storage.setFilters(arrayMove(context.config.filters, oldIndex, newIndex));
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
        <Grid item xs={11}><context.Views.Filter context={context} filter={value}/></Grid>
      </Grid>
    </ListItem>
  ));
  DragHandle = SortableHandle(() => <DragIndicator style={{ cursor: 'move' }}/>);
  consumerRender = (context: any) => {
    const {storage, config, methodsResults, trackerResults, Views} = context;

    return <this.SortableList onSortEnd={this.onSortEnd(context)} useDragHandle>
      {config.filters.map((filter,i) => <this.SortableItem key={filter._id} index={i} value={filter} context={context}/>)}
    </this.SortableList>;
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
