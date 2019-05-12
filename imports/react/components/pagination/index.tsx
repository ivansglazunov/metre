import { Random } from 'meteor/random';

import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ReactTable from 'react-table';
import {Load, IProps as ILProps} from '../../load';

import { toQuery } from './to-query';
import { Storage } from './storage';

export const Context = React.createContext({});

export interface IFilter {
  _id?: string;
  columnId?: string;
  
  type?: string;
  value?: any;

  collectionQuery?: (column: IColumn, filters: IFilter[]) => any;
  valueQuery?: (column: IColumn, filters: IFilter[]) => any;

  [key: string]: any;
}

export interface ISort {
  _id?: string;
  columnId?: string;
  path: string;
  desc: 1 | -1;

  [key: string]: any;
}

export interface IColumn {
  _id?: string;
  getter: 'path';
  value: any;
  type?: string;
  options?: any;
}

export interface IConfig {
  page: number,
  pageSize: number,
  query: any;
  sort: any;

  filters: IFilter[];
  sorts: ISort[];
  columns: IColumn[];

  [key: string]: any;
}

export interface IStorage {
  value(): IConfig;

  setPage(page: number);
  setPageSize(page: number, pageSize: number);

  addFilter(filter: IFilter): string;
  setFilter(filter: IFilter);
  delFilter(filter: IFilter);
  getFilters(columnId: string): IFilter[];

  addSort(sort: ISort): string;
  setSort(sort: ISort);
  delSort(sort: ISort);
  getSorts(columnId: string): ISort[];

  addColumn(column: IColumn): string;
  setColumn(column: IColumn);
  delColumn(column: IColumn);
  getColumn(columnId: string): IColumn;

  query(): any;
  sort(): any;
}

export interface IViews {
  Value: any;
  Column: any;
  Filters: any;
}

export interface IProps extends ILProps {
  Storage?: IStorage;
  Views?: IViews;

  query?: any;
  sort?: any;
  filters?: IFilter[];
  sorts?: ISort[];
  columns?: IColumn[];

  value?: any;
}

export class Provider extends React.Component<IProps, any, any> {
  static propTypes = {
    Storage: PropTypes.func,
    Views: PropTypes.object,

    query: PropTypes.object,
    sort: PropTypes.object,
    filters: PropTypes.arrayOf(PropTypes.object),
    columns: PropTypes.arrayOf(PropTypes.object),

    value: PropTypes.object,
  };
  static defaultProps = {
    Storage,

    query: {},
    sort: {},
    filters: [],
    columns: [],

    value: {},
  };

  public storage: IStorage;
  constructor (props) {
    super(props);
    this.storage = props.Storage(this);
  }

  Component = (data) => (<Context.Provider
    value={data}
  >
    {this.props.children}
  </Context.Provider>);

  render() {
    return <Load
      {...this.props}
      storage={this.storage}
      config={this.storage.value()}
      Component={this.Component}
    />
  }
}
