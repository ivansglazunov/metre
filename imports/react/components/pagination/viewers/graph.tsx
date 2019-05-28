import * as React from 'react';

import { Context } from '../';

export class Graph extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return '123';
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
