import { Random } from 'meteor/random';

import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import queryString from 'query-string';
import * as jsonpack from 'jsonpack/main';

import ReactTable from 'react-table';
import {Load, IProps as ILProps} from '../../load';

import { toQuery } from './to-query';
import { IStorage } from './';

/**
 * @description
 * Props parsed only for getting search query params from history, for store config.
 */
export const Storage = (provider) => {
  const storage: IStorage = {
    store: () => {
      const qs = queryString.parse(_.get(provider, 'props.history.location.search'));
      const store = qs && qs.storage && jsonpack.unpack(qs.storage) || {};
      return _.defaults(store, {
        page: 0,
        pageSize: 5,
    
        query: {},
        sort: {},

        filters: [],
        sorts: [],
        columns: [],
      });
    },
    setStore: (merge) => {
      console.log({
        search: ({
          ...storage.store(), ...merge,
        }),
      });
      provider.props.history.push({
        search: queryString.stringify({
          storage: jsonpack.pack({
            ...storage.store(), ...merge,
          }),
        }),
      });
    },

    value: () => ({
      // others...
      ...storage.store(),

      // builded query and sort
      query: storage.query(),
      sort: storage.sort(),

      // just once provided data
      filters: storage.store().filters,
      sorts: storage.store().sorts,
      columns: storage.store().columns,
    }),

    setPage: (page) => storage.setStore({page: page >= 0 ? page : 0}),
    setPageSize: (page, pageSize) => {
      storage.setStore({ page: page >= 0 ? page : 0, pageSize: pageSize >= 1 ? pageSize : 1});
    },

    addFilter: (filter) => {
      filter._id = Random.id();
      storage.setStore({
        filters: [...storage.store().filters, filter],
      });
      return filter._id;
    },
    setFilter: (filter) => {
      storage.setStore({
        filters: _.map(storage.store().filters, f => f._id === filter._id ? filter : f),
      });
    },
    delFilter: (filter) => {
      storage.setStore({
        filters: _.filter(storage.store().filters, f => f._id !== filter._id),
      });
    },
    getFilters: (columnId) => _.filter(storage.store().filters, f => f.columnId === columnId),

    addSort: (sort) => {
      sort._id = Random.id();
      storage.setStore({
        sorts: [...storage.store().sorts, sort],
      });
      return sort._id;
    },
    setSort: (sort) => {
      storage.setStore({
        sorts: _.map(storage.store().sorts, s => s._id === sort._id ? sort : s),
      });
    },
    delSort: (sort) => {
      storage.setStore({
        sorts: _.filter(storage.store().sorts, s => s._id !== sort._id),
      });
    },
    getSorts: (columnId) => _.filter(storage.store().sorts, s => s.columnId === columnId),

    addColumn: (column) => {
      column._id = Random.id();
      storage.setStore({
        columns: [...storage.store().columns, column],
      });
      return column._id;
    },
    setColumn: (column) => {
      storage.setStore({
        columns: _.map(storage.store().columns, c => c._id === column._id ? column : c),
      });
    },
    delColumn: (column) => {
      storage.setStore({
        columns: _.filter(storage.store().columns, c => c._id !== column._id),
      });
    },
    getColumn: (columnId) => _.find(storage.store().columns, c => c._id === columnId),

    query: () => {
      const $and = [];
      if (!_.isEmpty(storage.store().query)) $and.push(storage.store().query);
      const filters = storage.store().filters;
      for (let f = 0; f < filters.length; f++) {
        const filter = filters[f];
        const column = storage.getColumn(filter.columnId);
        if (!column) continue;
        const query = !filter.onlyValues ? toQuery(column.value, [filter]) : null;
        if (_.isEmpty(query)) continue;
        $and.push(query);
      }
      return $and.length ? {$and} : {};
    },  

    sort: () => {
      const sort = { ...storage.store().sort };
      const sorts = storage.store().sorts;
      for (let s = 0; s < sorts.length; s++) {
        sort[sorts[s].path] = sorts[s].desc;
      }
      return sort;
    },
  };
  return storage;
};
