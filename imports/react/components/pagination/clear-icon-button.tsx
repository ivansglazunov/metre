import { IconButton } from '@material-ui/core';
import { Add, ArrowDropDown, ArrowDropUp, ArrowRight, ChevronLeft, ChevronRight, Clear } from '@material-ui/icons';
import * as _ from 'lodash';
import * as React from 'react';

import { IColumn, ISort, IStorage } from '.';

export const ClearIconButton = ({
  column,
  context,
  ...props
}) => {
  return <IconButton
    style={{ padding: 0 }}
    onClick={() => context.storage.delColumn(column)}
    {...props}
  >
    <Clear />
  </IconButton>;
};
