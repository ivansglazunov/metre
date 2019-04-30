import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ReactTable from 'react-table';
import { Load, IProps as ILPProps } from '../load';

export const Context = React.createContext({});

export interface IConfig {
  page: number,
  pageSize: number,
}

export interface IMethods {
  value(): IConfig;

  setPage(page: number);
  setPageSize(pageSize: number);
}

export interface IProps extends ILPProps {
  Storage?: IMethods;
}

export const Storage = (provider) => {
  provider.state = {
    page: 0,
    pageSize: 5,
  };
  return {
    value: () => provider.state,

    setPage: (page) => provider.setState({ page: page >= 0 ? page : 0 }),
    setPageSize: (pageSize) => provider.setState({ pageSize: pageSize >= 1 ? pageSize : 1 }),
  };
};

export class Provider extends React.Component<IProps, any, any> {
  static propTypes = {
    Storage: PropTypes.func,
  };
  static defaultProps = {
    Storage,
  };

  public storage: IMethods;
  constructor(props) {
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
