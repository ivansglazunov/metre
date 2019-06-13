import { IColumn, IContext } from '../../index';

export interface IConfig {
  value: any;
  data: any;
  column: IColumn;
  context: IContext;
  encode?: (data: string) => any;
  decode?: (data: any) => string;
};

import string from './string';
import ns from './ns';
import formula from './formula';
import values from './values';
import strings from './strings';
import id from './id';

export {
  string,
  ns,
  formula,
  values,
  strings,
  id,
};