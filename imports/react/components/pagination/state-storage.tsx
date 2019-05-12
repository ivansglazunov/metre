import { Random } from 'meteor/random';

import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ReactTable from 'react-table';
import {Load, IProps as ILProps} from '../../load';

import { toQuery } from './to-query';
import { IStorage } from './';
import { Storage as BaseStorage } from './storage';

/**
 * @description
 * Props parsed only once, store config in states.
 */
export const Storage = (provider) => {
  const parsePromProps = items => items.map(i => ({ _id: Random.id(), ...i,  }));

  provider.state = {
    // page: provider.props.page || 0,
    // pageSize: provider.props.pageSize || 5,

    // query: provider.props.query || {},
    // sort: provider.props.sort || {},

    // filters: parsePromProps(provider.props.filters) || [],
    // sorts: parsePromProps(provider.props.sorts) || [],
    // columns: parsePromProps(provider.props.columns) || [],
    page: 0,
    pageSize: 5,

    query: {},
    sort: {},

    filters: [],
    sorts: [],
    columns: [],
  };

  const storage: IStorage = {
    ...BaseStorage(provider),
    get: () => provider.state,
    set: (merge) => provider.setState(merge),
  };
  return storage;
};
