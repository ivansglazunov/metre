import * as React from 'react';

import { Context } from '..';
import { Divider } from '@material-ui/core';

export class List extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return <div>
      {context.trackerResults.data.map(d => {
        const depth = d.___nsUsedFromParentPosition ? d.___nsUsedFromParentPosition.depth : 0;
        return <div
          style={{
            boxSizing: 'border-box',
            paddingLeft: depth * 8,
          }}
        >
          <div style={{
            boxShadow: 'inset 1px 0 0 0 black',
          }}>
            {d._id}
          </div>
          <Divider/>
        </div>;
      })}
    </div>
  };
  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
