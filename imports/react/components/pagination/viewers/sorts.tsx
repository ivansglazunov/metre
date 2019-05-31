import { Grid, IconButton, List, ListItem } from '@material-ui/core';
import { Add, Clear, DragIndicator } from '@material-ui/icons';
import arrayMove from 'array-move';
import * as React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import { Field } from '../../field';
import { Context, IContext, ISort } from '../';
import { SortIconButton } from '../sort-icon-button';

export class Sorts extends React.Component<any, any, any> {
  onSortEnd = (context) => ({ oldIndex, newIndex }) => {
    context.storage.setSorts(arrayMove(context.config.sorts, oldIndex, newIndex));
  };
  SortableList = SortableContainer(({ children }) => {
    return <List dense>{children}</List>;
  });
  SortableItem = SortableElement(({ value, context }: { value: ISort, context: IContext }) => (
    <ListItem key={value._id} divider>
      <Grid container justify="space-between" spacing={1}>
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
