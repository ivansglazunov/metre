import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import _ from 'lodash';
import stringHash from 'string-hash';
import { withTracker } from 'meteor/react-meteor-data';

export interface ICall {
  (id: string, name: string, ...args: any[]): Promise<any>;
}

export interface IResults {
  [key: string]: any;
}

export interface IProps {
  methods(props: any, prevResults: IResults, call: ICall): IResults;
  tracker(props: any): IResults;
  Component?: any;
  [key: string]: any;
}

export const LoadCore = (props) => {
  return props.Component ? <props.Component {...props}/> : null;
};

export const LoadTracker = withTracker
((props: any) => ({ ...props, trackerResults: props.tracker(props) }))
(LoadCore); 

export class Load extends React.Component<IProps, any, any> {
  state: any = {};
  callsArgs: any = {};
  callsResults: any = {};
  rerender = false;
  _isMounted = false;
  constructor(props) {
    super(props);
    this.methods();
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  call = (id, name, ...args) => {
    const newCallArgs = {name, args};
    if (!_.isEqual(this.callsArgs[id], newCallArgs)) {
      this.callsArgs[id] = {name, args};
      this.callsResults[id] = { loading: true, result: null };
      const result = Meteor.call(name, ...args, Meteor.isClient ? (error, result) => {
        this.callsResults[id] = { loading: false, result };
        this.rerender = true;
        this.setState(this.state);
      } : null);
      const hash = stringHash(JSON.stringify(newCallArgs));
      if (Meteor.isServer) {
        global.metreServerCalls[hash] = result;
        this.callsResults[id] = { loading: false, result };
      } else if (global.metreClientCalls[hash]) {
        this.callsResults[id] = { loading: false, result: global.metreClientCalls[hash] };
      } else {
        this.callsResults[id] = { loading: true, result: null };
      }
    }
    return this.callsResults[id];
  };
  methods = () => {
    const results = this.props.methods(this.props, this.state, this.call);
    this._isMounted ? this.setState(results) : this.state = results;
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.rerender || (!_.isEqual(this.props, prevProps) || !_.isEqual(this.state, prevState))) {
      this.rerender = false;
      this.methods();
    }
  }
  render() {
    return <LoadTracker {...this.props} methodsResults={{...this.state}}/>;
  }
}
