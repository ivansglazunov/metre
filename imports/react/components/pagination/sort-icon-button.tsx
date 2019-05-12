import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';

import { Users, Nodes } from '../../../api/collections/index';
import { Context, Provider, IColumn, IStorage, ISort } from './index';
import { Field } from '../field';
import { mathEval } from '../../../api/math';

import options from '../../../api/collections/index/options/index';
import { types as filterTypes } from './filters';

import ReactTable from 'react-table';
import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment, FormControl, InputLabel, Select, OutlinedInput, MenuItem } from '@material-ui/core';
import { Add, Clear, ExpandLess, ExpandMore, UnfoldMore } from '@material-ui/icons';

import { find } from 'mingo';
import { toQuery } from './to-query';

export const SortIconButton = ({
  sort,
  storage,
  ...props
}: {
  sort: ISort,
  storage: IStorage,
  [key: string]: any;
}) => {
  return <IconButton
    {...props}
    onClick={() => storage.setSort({ ...sort, desc: ~sort.desc ? -1 : 1 })}
  >
    {~sort.desc ? <ExpandLess/> : <ExpandMore/>}
  </IconButton>;
};

export const ColumnSortIconButton = ({
  column,
  storage,
  ...props
}: {
  column: IColumn;
  storage: IStorage;
  [key: string]: any;
}) => {
  const sorts = storage.getSorts(column._id);
  const sort = _.find(sorts, sort => sort.path == column.value);

  if (sort) {
    return <SortIconButton sort={sort} storage={storage} {...props}/>
  } else {
    return <IconButton
      {...props}
      onClick={() => storage.addSort({ columnId: column._id, path: column.value, desc: -1 })}
    >
      <UnfoldMore/>
    </IconButton>
  }
};

export const PathSortIconButton = ({
  path,
  sorts,
  storage,
  ...props
}: {
  path: string;
  sorts: ISort[];
  storage: IStorage;
  [key: string]: any;
}) => {
  const sort = _.find(sorts, sort => sort.path == path);

  if (sort) {
    return <SortIconButton sort={sort} storage={storage} {...props}/>
  } else {
    return <IconButton
      {...props}
      onClick={() => storage.addSort({ path: path, desc: -1 })}
    >
      <UnfoldMore/>
    </IconButton>
  }
};
