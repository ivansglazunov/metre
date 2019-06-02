import * as React from 'react';
import { useState } from 'react';
import * as _ from 'lodash';

import { Context } from '..';
import { Divider, Paper } from '@material-ui/core';
import { SortIconButton } from '../sort-icon-button';
import { ClearIconButton } from '../clear-icon-button';

export const BlockColumn = ({ context, column, data }) => {
  return <Paper
    elevation={4}
    style={{
      overflow: 'auto',
      width: context.Views.columnSizes(context, column).minWidth,
      display: 'inline-block',
      verticalAlign: 'top',
      margin: 6,
    }}
  >
    <div style={{
      display: 'block'
    }}>
      <ClearIconButton column={column} context={context} style={{ padding: 0 }} />
      {column.value}
    </div>
    <div style={{
      display: 'block',
    }}>
      <context.Views.Value data={data} context={context} column={column} />
    </div>
  </Paper>;
};

export const BlockField = ({ field }) => {
  return <Paper
    elevation={4}
    style={{
      display: 'inline-block',
      textAlign: 'center',
      verticalAlign: 'top',
      margin: 6,
    }}
  >
    <div style={{ margin: 5 }}>
      {field.split('').map((l, i) => <div key={i} style={{
        display: 'block',
        fontSize: '0.8em',
        marginTop: -5,
        transform: 'rotate(90deg)',
        transformOrigin: '50% 50%',
      }}>{l}</div>)}
    </div>
  </Paper>;
};

export class List extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return <div style={{
      overflow: 'auto',
    }}>
      {context.trackerResults.data.map((d, i) => {
        const keys = _.keys(d);
        return <div
          key={`${d._id}${d.___nsUsedFromParentPosition && d.___nsUsedFromParentPosition._id}${i}`}
          style={{
            display: 'block',
            whiteSpace: 'nowrap',
          }}
        >
          {context.config.columns.map(c => {
            return<BlockColumn key={c._id} context={context} column={c} data={d} />;
          })}
          {keys.map(k => {
            return<BlockField key={k} field={k} />;
          })}
          <Divider />
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
