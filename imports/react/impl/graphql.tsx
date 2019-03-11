import _ from "lodash";
import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { withTracker } from "meteor/react-meteor-data";
import { Observable } from "rxjs";

import { graphql, schema } from "../../api/index";

export interface IProps {
  query: any;
  stream?: Observable<any>;
  onChange?: (state: IState) => void;
  render?: (state: IState) => any;
};

export interface IState {
  loading: boolean;
  result: any;
}

export class GraphqlCore extends React.Component<IProps, IState> {
  state = {
    loading: true,
    result: null
  };
  public subscription;
  public subscribe = result => {
    const { onChange } = this.props;
    if (onChange) onChange(this.state);
    this.setState({
      loading: false,
      result
    });
  };
  public _isMounted = false;
  restream = () => {
    const { query, stream } = this.props;
    if (this.subscription) this.subscription.unsubscribe();
    this.setState({
      loading: true,
      result: null
    });
    if (this._isMounted) {
      this.subscription = stream.subscribe(this.subscribe);
    }
  };
  componentDidMount() {
    const { query } = this.props;
    this._isMounted = true;
    Meteor.startup(this.restream);
    Accounts.onLogin(this.restream);
    Accounts.onLogout(this.restream);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.stream != this.props.stream) this.restream();
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

export const Graphql = withTracker<any, any>(({ query }) => {
  return {
    stream: graphql(query),
  };
})(GraphqlCore);
