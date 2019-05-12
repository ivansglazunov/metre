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

export const Storage = (provider) => {
  const storage: IStorage = {
    get() {
      return provider.props.value || {};
    },
    set(merge) {
      provider.props.set(merge);
    },
    value() {
      const value = this.get();
      return {
        // others...
        ...value,
        page: value.page || 0,
        pageSize: value.pageSize >= 0 ? value.pageSize : 5,

        // builded query and sort
        query: this.query() || {},
        sort: this.sort() || {},

        // just once provided data
        filters: value.filters || [],
        sorts: value.sorts || [],
        columns: value.columns || [],
      };
    },

    setPage(page) { this.set({page: page >= 0 ? page : 0}); },
    setPageSize(page, pageSize) {
      this.set({ page: page >= 0 ? page : 0, pageSize: pageSize >= 1 ? pageSize : 1});
    },

    addFilter(filter) {
      filter._id = Random.id();
      this.set({
        filters: [...this.get().filters || [], filter],
      });
      return filter._id;
    },
    setFilters(filters) {
      this.set({ filters });
    },
    setFilter(filter) {
      this.set({
        filters: _.map(this.get().filters || [], f => f._id === filter._id ? filter : f),
      });
    },
    delFilter(filter) {
      this.set({
        filters: _.filter(this.get().filters || [], f => f._id !== filter._id),
      });
    },
    getFilters(columnId) {
      return _.filter(this.get().filters || [], f => f.columnId === columnId);
    },

    addSort(sort) {
      sort._id = Random.id();
      this.set({
        sorts: [...this.get().sorts || [], sort],
      });
      return sort._id;
    },
    setSorts(sorts) {
      this.set({ sorts });
    },
    setSort(sort) {
      this.set({
        sorts: _.map(this.get().sorts || [], s => s._id === sort._id ? sort : s),
      });
    },
    delSort(sort) {
      this.set({
        sorts: _.filter(this.get().sorts || [], s => s._id !== sort._id),
      });
    },
    getSorts(columnId) {
      return _.filter(this.get().sorts || [], s => s.columnId === columnId);
    },

    addColumn(column) {
      column._id = Random.id();
      this.set({
        columns: [...this.get().columns || [], column],
      });
      return column._id;
    },
    setColumns(columns) {
      this.set({ columns });
    },
    setColumn(column) {
      this.set({
        columns: _.map(this.get().columns || [], c => c._id === column._id ? column : c),
      });
    },
    delColumn(column) {
      this.set({
        columns: _.filter(this.get().columns || [], c => c._id !== column._id),
      });
    },
    getColumn(columnId) {
      return _.find(this.get().columns || [], c => c._id === columnId);
    },

    query() {
      const $and = [];
      if (!_.isEmpty(this.get().query)) $and.push(this.get().query);
      const filters = this.get().filters || [];
      if (filters) {
        for (let f = 0; f < filters.length; f++) {
          const filter = filters[f];
          const column = this.getColumn(filter.columnId);
          if (!column) continue;
          const query = !filter.onlyValues ? toQuery(column.value, [filter]) : null;
          if (_.isEmpty(query)) continue;
          $and.push(query);
        }
      }
      return $and.length ? {$and} : {};
    },  

    sort() {
      const sort = { ...this.get().sort || {} };
      const sorts = this.get().sorts || [];
      if (sorts) {
        for (let s = 0; s < sorts.length; s++) {
          sort[sorts[s].path] = sorts[s].desc;
        }
      }
      return sort;
    },
  };
  return storage;
};
