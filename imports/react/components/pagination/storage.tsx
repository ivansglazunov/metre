import { Random } from 'meteor/random';

import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ReactTable from 'react-table';
import {Load, IProps as ILProps} from '../../load';

import { toQuery } from './to-query';
import { IStorage } from './';

export const Storage = (provider) => {
  const parsePromProps = items => items.map(i => ({ _id: Random.id(), ...i,  }));

  provider.state = {
    page: provider.props.page || 0,
    pageSize: provider.props.pageSize || 5,

    query: provider.props.query || {},
    sort: provider.props.sort || {},

    filters: parsePromProps(provider.props.filters) || [],
    sorts: parsePromProps(provider.props.sorts) || [],
    columns: parsePromProps(provider.props.columns) || [],
  };

  const storage: IStorage = {
    value: () => ({
      // others...
      ...provider.state,

      // builded query and sort
      query: storage.query(),
      sort: storage.sort(),

      // just once provided data
      filters: provider.state.filters,
      sorts: provider.state.sorts,
      columns: provider.state.columns,
    }),

    setPage: (page) => provider.setState({page: page >= 0 ? page : 0}),
    setPageSize: (pageSize) => provider.setState({pageSize: pageSize >= 1 ? pageSize : 1}),


    addFilter: (filter) => {
      filter._id = Random.id();
      provider.setState({
        filters: [...provider.state.filters, filter],
      });
      return filter._id;
    },
    setFilter: (filter) => {
      provider.setState({
        filters: _.map(provider.state.filters, f => f._id === filter._id ? filter : f),
      });
    },
    delFilter: (filter) => {
      provider.setState({
        filters: _.filter(provider.state.filters, f => f._id !== filter._id),
      });
    },
    getFilters: (columnId) => _.filter(provider.state.filters, f => f.columnId === columnId),

    addSort: (sort) => {
      sort._id = Random.id();
      provider.setState({
        sorts: [...provider.state.sorts, sort],
      });
      return sort._id;
    },
    setSort: (sort) => {
      provider.setState({
        sorts: _.map(provider.state.sorts, s => s._id === sort._id ? sort : s),
      });
    },
    delSort: (sort) => {
      provider.setState({
        sorts: _.filter(provider.state.sorts, s => s._id !== sort._id),
      });
    },
    getSorts: (columnId) => _.filter(provider.state.sorts, s => s.columnId === columnId),

    addColumn: (column) => {
      column._id = Random.id();
      provider.setState({
        columns: [...provider.state.columns, column],
      });
      return column._id;
    },
    setColumn: (column) => {
      provider.setState({
        columns: _.map(provider.state.columns, c => c._id === column._id ? column : c),
      });
    },
    delColumn: (column) => {
      provider.setState({
        columns: _.filter(provider.state.columns, c => c._id !== column._id),
      });
    },
    getColumn: (columnId) => _.find(provider.state.columns, c => c._id === columnId),

    query: () => {
      const $and = [];
      if (!_.isEmpty(provider.state.query)) $and.push(provider.state.query);
      const filters = provider.state.filters;
      for (let f = 0; f < filters.length; f++) {
        const filter = filters[f];
        const column = storage.getColumn(filter.columnId);
        if (!column) continue;
        const query = toQuery(column.value, [filter]);
        if (_.isEmpty(query)) continue;
        $and.push(query);
      }
      return $and.length ? {$and} : {};
    },  

    sort: () => {
      const sort = { ...provider.state.sort };
      const sorts = provider.state.sorts;
      for (let s = 0; s < sorts.length; s++) {
        sort[sorts[s].path] = sorts[s].desc;
      }
      return sort;
    },
  };
  return storage;
};
