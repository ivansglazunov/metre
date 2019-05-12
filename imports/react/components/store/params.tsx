import { Random } from 'meteor/random';

import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import queryString from 'query-string';
import * as jsonpack from 'jsonpack/main';
import { withRouter } from "react-router";

import ReactTable from 'react-table';
import {Load, IProps as ILProps} from '../../load';

import { toQuery } from './to-query';
import { IProps as _IProps, IValue as _IValue } from './';
import { Storage as BaseStorage } from './storage';

export const Context = React.createContext<any>({});

export interface IProps extends _IProps {
  name: string;

  match: any;
  location: any;
  history: any;
}

export class Component extends React.Component<IProps, any, any> {
  componentDidMount() {
    const value = this.value();

    this.set({ ...this.props.default, ...value });
  }
  static propTypes = {
    name: PropTypes.string,
  };
  set = (merge) => {
    const { history, name } = this.props;
    const search = queryString.parse(_.get(history, 'location.search'));
    const _packed = _.get(search, name);
    const value = _packed ? jsonpack.unpack(_packed) : {};
    const newSearch = queryString.stringify({
      ...search,
      [name]: jsonpack.pack(_.defaults(merge, value)),
    });
    this.props.history.push({
      search: '?'+newSearch,
    });
  };
  value() {
    const { history, name } = this.props;
    const search = queryString.parse(_.get(history, 'location.search'));
    const _packed = _.get(search, name);
    const value = _packed ? jsonpack.unpack(_packed) : {};
    return value;
  }
  render() {
    const { children } = this.props;

    return <Context.Provider value={{ value: this.value(), set: this.set }}>
      {children}
    </Context.Provider>
  }
}

export const Provider = withRouter(Component);
