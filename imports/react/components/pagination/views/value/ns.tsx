import { Meteor } from 'meteor/meteor';

import * as React from 'react';
import { useState } from 'react';
import { useTracker } from 'react-meteor-hooks'

import { find } from 'mingo';
import { IConfig } from './index';
import { toQuery } from './../../to-query';
import * as _ from 'lodash';
import { Button, Grid, IconButton, ListItem, Popover, List } from '@material-ui/core';
import { Add, ArrowDropDown, ArrowRight, ChevronLeft, ChevronRight, Clear, PlaylistAdd, Title } from '@material-ui/icons';
import { Nodes } from '../../../../../api/collections/index';
import { Field } from '../../../field';

export const ViewValuePositionLine = ({ children = '' }: { children?: any; }) => {
  return <div style={{ width: '100%', fontSize: '0.8em', height: 'auto', boxShadow: 'inset black 1px 0px 0px 0px', textAlign: 'left' }}>
    {children}
  </div>;
};

export const ViewValuePositionSearch = ({
  data, position,
  onClose
}) => {
  const [name, setName] = useState('');

  const { founded } = useTracker(() => {
    const founded = name ? Nodes.find({
      'strings.title.values.value': name,
    }).fetch() : [];
    return { founded };
  }, [name]);

  return <>
    <Field
      type="string"
      value={name}
      onChange={e => setName(e.target.value)}
    />
    <List dense>
      {founded.map(f => <ListItem key={f._id} button onClick={() => {
        Meteor.call(`${Nodes._name}.ns.nesting.put`, { tree: 'nesting', docId: f._id, parentId: data._id,  }, () => {
          if (onClose) onClose();
        });
      }}>
        {_.get(f, 'strings.title.values.0.value', '')}
      </ListItem>)}
    </List>
  </>;
};

export const ViewValuePosition = (
  {
    data, value, position, fullHeight = false,
    PullProps = {}, AddProps = {}, PushProps = {}, ToggleProps = {}, NameToggleProps = {}, NameProps = {},
    ...props
  }: any
) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [nameOpen, setNameOpen] = useState(!!position.name);

  if (!data) return null;

  const founded = data.___nsFoundedTrace && _.find(data.___nsFoundedTrace.positions, p => p.used._id === position._id);

  const pull = <IconButton
    style={{ padding: 0 }}
    onClick={e => {
      const parentId = position.parentId;
      if (parentId) Meteor.call('nodes.ns.nesting.pull', { docId: data._id, parentId, tree: position.tree });
      else Meteor.call('nodes.ns.nesting.pull', { positionId: position._id });
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

  const push = <>
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <div style={{
        width: 300,
        maxHeight: 300,
        overflow: 'auto',
      }}>
        <ViewValuePositionSearch
          data={data}
          position={position}
          onClose={() => setAnchorEl(null)}
        />
      </div>
    </Popover>
    <IconButton
      style={{ padding: 0 }}
      onClick={(e) => setAnchorEl(e.currentTarget)}
      {...PushProps}
    >
      <PlaylistAdd />
    </IconButton>
  </>;

  const nameToggle = <>
    <IconButton
      style={{ padding: 0 }}
      onClick={(e) => {
        setNameOpen(!nameOpen);
        Meteor.call('nodes.ns.nesting.name', { docId: data._id, positionId: position._id, name: '' });
      }}
      {...PushProps}
    >
      <Title />
    </IconButton>
  </>;

  const name = <>
    {nameOpen && <Field
      value={position.name}
      type="string"
      onChange={e => Meteor.call('nodes.ns.nesting.name', { docId: data._id, positionId: position._id, name: e.target.value })}
    />}
  </>;

  const toggle = <IconButton
    style={{ padding: 0, float: 'left' }}
    {...ToggleProps}
  />;

  return <ListItem
    style={{
      height: fullHeight ? '100%' : 'auto',
      padding: 0,
      paddingLeft: founded
        ? (position.depth - founded.base.depth) * 10
        : 0
    }}
    {...props}
  >
    <ViewValuePositionLine>
      <div>
        {toggle}
        {position.depth} {position.left}/{position.right} {position.tree}
      </div>
      <div>
        {pull}
        {add}
        {push}
        {nameToggle}
        {position.space}
      </div>
      <div>
        {name}
      </div>
    </ViewValuePositionLine>
  </ListItem>;
};

export default ({ value, data, column, context }: IConfig) => {
  const filters = context.storage.getFilters(column._id);

  if (_.isArray(value)) {
    let list = [];
    if (data.___nsFoundedTrace) {
      for (let p = 0; p < data.___nsFoundedTrace.positions.length; p++) {
        const f = data.___nsFoundedTrace.positions[p];
        list.push({ value: f.used, disabled: true });
      }
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
          value={value}
          position={p}
          ToggleProps={{
            disabled,
            children: data.___nsFoundedTrace || isNest ? <ArrowDropDown /> : <ArrowRight />,
            onClick: () => {
              context.storage.unsetNests(data._id);
              if (!isNest) context.storage.setNest(data._id, p._id);
            },
          }}
          fullHeight={!!data.___nsFoundedTrace}
        />
      ))}
      <ViewValuePositionLine />
    </div>;
  }
  return <ViewValuePositionLine />;
};
