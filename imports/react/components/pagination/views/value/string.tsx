import * as React from 'react';
import { IConfig } from './index';

export default ({ value, data, column, context }: IConfig) => {
  if (typeof (value) === 'object') return <>{JSON.stringify(value)}</>;
  else return <>{String(value)}</>;
};
