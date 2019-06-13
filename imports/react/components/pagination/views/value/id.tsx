import * as React from 'react';
import { IConfig } from './index';
import { IconButton } from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import { Nodes } from '../../../../../api/collections';

export default ({ value, data, column, context }: IConfig) => {
  if (typeof(value) !== 'string') return null;

  return <>
    {String(value)}
    <IconButton
      style={{ padding: 0 }}
      onClick={e => Nodes.remove(value)}
    >
      <Clear />
    </IconButton>
  </>;
};
