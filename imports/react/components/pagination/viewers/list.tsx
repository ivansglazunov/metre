import * as React from 'react';
import { useState } from 'react';

import { Context } from '..';
import { Divider } from '@material-ui/core';

export class List extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return <div style={{
      overflow: 'auto',
    }}>
      {context.trackerResults.data.map(d => {
        const depth = d.___nsUsedFromParentPosition ? d.___nsUsedFromParentPosition.depth : 0;
        return <div
          key={`${d._id}${depth}`}
          style={{
            display: 'block',
            whiteSpace: 'nowrap',
          }}
        >
          {/* <div style={{
            boxShadow: 'inset 1px 0 0 0 black',
          }}>
            {d._id}
          </div> */}
          {context.config.columns.map(c => <div key={c._id} style={{
            ...context.Views.columnSizes(context, c),
            display: 'inline-block',
            verticalAlign: 'top',
          }}>
            <div>{c.value}</div>
            <context.Views.Value data={d} context={context} column={c}/>
          </div>)}
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
