import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import { find } from 'mingo';
import { IConfig } from './index';
import { toQuery } from './../../to-query';
import * as _ from 'lodash';
import { Button, Grid, IconButton, ListItem, Popover } from '@material-ui/core';
import { Add, ArrowDropDown, ArrowRight, ChevronLeft, ChevronRight, Clear } from '@material-ui/icons';
import { Nodes } from '../../../../../api/collections/index';
import { Field } from '../../../field';

export const ViewValuePositionLine = ({ children = '' }: { children?: any; }) => {
  return <div style={{ width: '100%', fontSize: '0.8em', height: 'auto', boxShadow: 'inset black 1px 0px 0px 0px', textAlign: 'left' }}>
    {children}
  </div>;
};

export const ViewValuePosition = (
  {
    data, value, position, fullHeight = false, short = false, PullProps = {}, AddProps = {}, ToggleProps = {}, ...props
  }: any
) => {
  if (!data) return null;

  const pull = <IconButton
    style={{ padding: 0 }}
    onClick={e => {
      const parentId = position.parentId;
      Meteor.call('nodes.ns.nesting.pull', { docId: data._id, parentId });
    }}
    {...PullProps}
  >
    <Clear />
  </IconButton>;

  const add = <IconButton
    style={{ padding: 0 }}
    onClick={e => Nodes.insert({}, (error, docId) => Meteor.call('nodes.ns.nesting.put', { tree: 'nesting', docId, parentId: data._id }))}
    {...AddProps}
  >
    <Add />
  </IconButton>;

  const toggle = <IconButton
    style={{ padding: 0, float: 'left' }}
    {...ToggleProps}
  />;

  return <ListItem
    style={{
      height: fullHeight ? '100%' : 'auto',
      padding: 0,
      paddingLeft: data.___nsRootUserPosition
      ? (position.depth - data.___nsRootUserPosition.depth) * 10 
      : 0
    }}
    {...props}
  >
    <ViewValuePositionLine>
      {short
      ? <div>
          <div>{toggle}</div>
          <div>
            {pull}
            {add}
          </div>
        </div>
      : <>
        <div>
          {toggle}
          {position.depth} {position.left}/{position.right} {position.tree}
        </div>
        <div>
          {pull}
          {add}
          {position.space}
        </div>
        <div>
          <Field
            value={position.name}
            type="string"
            onChange={e => Meteor.call('nodes.ns.nesting.name', { docId: data._id, positionId: position._id, name: e.target.value })}
          />
        </div>
        </>
      }
    </ViewValuePositionLine>
  </ListItem>;
};

export default ({ value, data, column, context }: IConfig) => {
  const filters = context.storage.getFilters(column._id);

  if (_.isArray(value)) {
    let list = [];
    if (data.___nsUsedFromParentPosition) {
      list.push({ value: data.___nsUsedFromParentPosition, disabled: true });
    } else {
      // not nested
      list.push.apply(list, value.filter(
        p => !context.storage.isNest(data._id, p._id)
      ).map(value => ({ value, disabled: false, isNest: false })));
      // nested
      list.push.apply(list, value.filter(
        p => context.storage.isNest(data._id, p._id)
      ).map(value => ({ value, disabled: false, isNest: true })));
    }
    list = find(list, toQuery('value', filters.filter(filter => filter.deny != 'client'))).all();

    return <div style={{ height: '100%' }}>
      {!!list.length && list.map(({ value: p, disabled, isNest }) => (
        <ViewValuePosition
          key={p._id}
          data={data}
          short={column.variant === 'short'}
          value={value}
          position={p}
          ToggleProps={{
            disabled,
            children: data.___nsUsedFromParentPosition || isNest ? <ArrowDropDown/> : <ArrowRight/>,
            onClick: () => {
              context.storage.unsetNests(data._id);
              if (!isNest) context.storage.setNest(data._id, p._id);
            },
          }}
          fullHeight={!!data.___nsUsedFromParentPosition}
        />
      ))}
      <ViewValuePositionLine/>
    </div>;
  }
  return <ViewValuePositionLine/>;
};
