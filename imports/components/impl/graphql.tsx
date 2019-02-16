import _ from 'lodash';
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { graphql, schema } from '../../../api/index';

export interface IProps {
  query: any;
  onChange?: (state: IState) => void;
  render?: (state: IState) => any;
};

export interface IState {
  loading: boolean;
  result: any;
}

export class Graphql extends React.Component
<IProps, IState> {
  state = {
    loading: true,
    result: null,
  };
  public stream;
  public subscription;
  public subscribe = result => {
    const { onChange } = this.props;
    if (onChange) onChange(this.state);
    this.setState({
      loading: false,
      result,
    });
  };
  public _isMounted = false;
  restream = () => {
    const { query } = this.props;
    if (this.subscription) this.subscription.unsubscribe();
    this.setState({
      loading: true,
      result: null,
    });
    if (this._isMounted) {
      this.stream = graphql(schema, query);
      this.subscription = this.stream.subscribe(this.subscribe);
    }
  }
  componentDidMount() {
    const { query } = this.props;
    this._isMounted = true;
    Meteor.startup(() => { console.log('startup'); this.restream(); });
    Accounts.onLogin(() => { console.log('onLogin'); this.restream(); });
    Accounts.onLogout(() => { console.log('onLogout'); setTimeout(() => {
      this.restream();
    }, 1000); });
  }
  componentWillUnmount() {
    this._isMounted = false;
    this.restream();
    for (let i = 0; i < Accounts._hooksLogin.length; i++) {
      Accounts._hooksLogin.splice(i, 1);
    }
    for (let i = 0; i < Accounts._hooksLogout.length; i++) {
      Accounts._hooksLogout.splice(i, 1);
    }
  }
  render() {
    const { render } = this.props;
    return render ? render(this.state) : null;
  }
}
