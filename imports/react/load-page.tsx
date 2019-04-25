import { Meteor } from 'meteor/meteor';
import * as React from 'react';

import { withTracker } from 'meteor/react-meteor-data';

export interface ICall {
  async (name: string, ...args: any[]): any;
}

export interface IResults {
  [key: string]: any;
}

export interface IOptions {
  methods(props: any, prevResults: IResults, call: ICall): IResults;
  tracker(props: any): IResults;
  Component: any;
}

export const LoadPageCore = (props) => {
  return <props.Component {...props}/>
};

export const LoadPageTracker = withTracker
((props: any) => ({ ...props, ...props.tracker(props) }))
(LoadPageCore); 

export class LoadPage extends React.Component<any, any, any> {
  state: any = {};
  constructor(props) {
    super(props);
    this.methods();
  }
  call = (name, ...args) => new Promise((res, rej) => {
    Meteor.call(name, ...args, (error, result) => {
      if (error) rej(error);
      else res(result);
    });
  });
  async methods() {
    this.setState(await this.props.methods(this.props, this.state, this.call));
  }
  componentDidUpdate() {
    this.methods();
  }
  render() {
    return <LoadPageTracker {...this.props} {...this.state}/>;
  }
}
