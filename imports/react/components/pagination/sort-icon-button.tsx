import { IconButton } from '@material-ui/core';
import { ExpandLess, ExpandMore, UnfoldMore } from '@material-ui/icons';
import * as _ from 'lodash';
import * as React from 'react';

import { IColumn, ISort, IStorage } from '.';

export const SortIconButton = ({
  sort: _sort,
  column,
  storage,
  ...props
}: {
  sort?: ISort;
  column?: IColumn;
  storage: IStorage;
  [key: string]: any;
}) => {
  let sort = _sort;
  if (!sort) {
    const sorts = storage.getSorts(column._id);
    const sort = _.find(sorts, sort => sort.path == column.value);
  }

  if (sort) {
    return <IconButton
      {...props}
      onClick={() => storage.setSort({ ...sort, desc: ~sort.desc ? -1 : 1 })}
    >
      {~sort.desc ? <ExpandMore/> : <ExpandLess/>}
    </IconButton>
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
