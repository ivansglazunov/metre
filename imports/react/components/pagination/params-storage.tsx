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
import { Storage as BaseStorage } from './storage';

/**
 * @description
 * Props parsed only for getting search query params from history, for store config.
 */
export const Storage = (provider) => {
  const parsePromProps = items => items.map(i => ({ _id: Random.id(), ...i,  }));

  const storage: IStorage = {
    ...BaseStorage(provider),
    get: () => {
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
    set: (merge) => {
      provider.props.history.push({
        search: queryString.stringify({
          storage: jsonpack.pack({
            ...storage.get(), ...merge,
          }),
        }),
      });
    },
  };

  const store = storage.get();
  // storage.set({
  //   page: provider.props.page || store.page || 0,
  //   pageSize: provider.props.pageSize || store.pageSize || 5,

  //   query: provider.props.query || store.query || {},
  //   sort: provider.props.sort || store.sort || {},

  //   filters: parsePromProps(provider.props.filters) || store.filters || [],
  //   sorts: parsePromProps(provider.props.sorts) || store.sorts || [],
  //   columns: parsePromProps(provider.props.columns) || store.columns || [],
  // });

  return storage;
};
