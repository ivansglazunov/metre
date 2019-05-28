import { Button, Grid, IconButton, ListItem, Popover } from '@material-ui/core';
import { Add, ArrowDropDown, ArrowRight, ChevronLeft, ChevronRight, Clear } from '@material-ui/icons';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { find } from 'mingo';

import * as React from 'react';
import { useState } from 'react';

import { mathEval } from '../../../api/math';
import { Field } from '../field';
import { FilterType } from './filters';
import { ColumnSortIconButton } from './sort-icon-button';
import { toQuery } from './to-query';
import { IViews } from '.';
import { Nodes } from '../../../api/collections/index';
import { IPosition } from '../../../api/nested-sets/index';

export const getters = [
  'path',
  'formula',
];

export const types = [
  'tree',
  'ns',
  'string',
  'formula',
  'id',
];

export const ViewValueString = ({ value }: any) => {
  if (typeof (value) === 'object') return <React.Fragment>{JSON.stringify(value)}</React.Fragment>;
  else return <React.Fragment>{String(value)}</React.Fragment>;
};

export const ViewValueFormula = ({ value, v, data, column }) => {
  const result = data.formulaEval(value.value);

  return <Grid container justify="space-between" spacing={8}>
    <Grid item xs={8}>
      <Field
        value={value.value}
        onChange={e => Meteor.call('nodes.formulas.set', data._id, column.value.split('.')[1], { _id: value._id, value: e.target.value })}
      />
    </Grid>
    <Grid item xs={3}>
      <Field
        value={result.value}
        disabled
      />
    </Grid>
    <Grid item xs={1} style={{ textAlign: 'center' }}>
      <IconButton
        style={{ padding: 0 }}
        onClick={e => Meteor.call('nodes.formulas.pull', data._id, column.value.split('.')[1], value._id)}
      >
        <Clear />
      </IconButton>
    </Grid>
  </Grid>
};

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
      : <React.Fragment>
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
            onChange={e => Meteor.call('nodes.ns.nesting.name', { docId: data._id, parentId: position.parentId, tree: position.tree, name: e.target.value })}
          />
        </div>
        </React.Fragment>
      }
    </ViewValuePositionLine>
  </ListItem>;
};

export const Views: IViews = {
  Value: ({ context, data, column }) => {
    if (!data) return null;

    let value;
    if (column.getter === 'path') value = _.get(data, column.value);
    else if (column.getter === 'formula') value = mathEval(column.value, data).result;
    else return null;

    if (column.type === 'string' || !column.type) {
      return <ViewValueString value={value}/>;
    }

    if (column.type === 'tree') {
      const filters = context.storage.getFilters(column._id);

      if (_.isArray(value)) {
        let list = [];
        if (data.___nsUsedPosition) {
          list.push({ value: data.___nsUsedPosition, disabled: true });
        } else {
          let biggest;
          for (let v = 0; v < value.length; v++) {
            const p = value[v];
            if (!biggest || (p.right - p.left > biggest.right - biggest.left)) {
              biggest = p;
            }
          }
          if (biggest) list.push({ value: biggest, disabled: false, isNest: context.storage.isNest(data._id, biggest._id) });
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
                children: data.___nsUsedPosition || isNest ? <ArrowDropDown/> : <ArrowRight/>,
                onClick: () => {
                  context.storage.unsetNests(data._id);
                  if (!isNest) context.storage.setNest(data._id, p._id, p);
                },
              }}
              fullHeight={!!data.___nsUsedPosition}
              short
            />
          ))}
          <ViewValuePositionLine/>
        </div>;
      }
      return <ViewValuePositionLine/>;
    }

    if (column.type === 'ns') {
      const filters = context.storage.getFilters(column._id);

      if (_.isArray(value)) {
        let list = [];
        if (data.___nsUsedPosition) {
          list.push({ value: data.___nsUsedPosition, disabled: true });
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
                children: data.___nsUsedPosition || isNest ? <ArrowDropDown/> : <ArrowRight/>,
                onClick: () => {
                  context.storage.unsetNests(data._id);
                  if (!isNest) context.storage.setNest(data._id, p._id, p);
                },
              }}
              fullHeight={!!data.___nsUsedPosition}
            />
          ))}
          <ViewValuePositionLine/>
        </div>;
      }
      return <ViewValuePositionLine/>;
    }

    if (column.type === 'formula') {
      const filters = context.storage.getFilters(column._id);
      const collection = value && _.isArray(value.values) ? value.values : [];
      const q = toQuery('value', filters);
      const values = find(collection, q).all();

      return <div>
        {values.map((value, n) => {
          return <div key={value._id}>
            <ViewValueFormula data={data} value={value} v={n} column={column}/>
          </div>;
        })}
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <IconButton
            style={{ padding: 0 }}
            onClick={e => Meteor.call('nodes.formulas.push', data._id, column.value.split('.')[1], { value: '' })}
          >
            <Add />
          </IconButton>
        </Grid>
      </div>;
    }
    return null;
  },
  columnSizes: (context, column) => ({
    minWidth: column.variant === 'short' ? 100 : 300,
    maxWidth: 999,
  }),
  Column: ({ context, column }) => {
    const full = !column.variant || column.variant === 'full';
    return <Grid
      container
      spacing={8}
      style={{ textAlign: 'left' }}
      justify="space-between"
    >
      <Grid item xs={2} style={{ textAlign: 'center' }}>
        <IconButton style={{ padding: 0 }} onClick={
          () => context.storage.setColumn({ ...column, variant: full ? 'short' : 'full' })
        }>{full ? <ArrowDropDown/> : <ArrowRight/>}</IconButton>
      </Grid>
      {full && <React.Fragment>
        <Grid item xs={2} style={{ textAlign: 'center' }}>
          <ColumnSortIconButton column={column} storage={context.storage} style={{ padding: 0 }}/>
        </Grid>
        <Grid item xs={3}>
          <Field
            select
            label={'getter'}
            value={column && column.getter || 'path'}
            onChange={e => context.storage.setColumn({
              ...column,
              getter: e.target.value,
            })}
          >
            {getters.map((g, i) => <option key={i} value={g}>{g}</option>)}
          </Field>
        </Grid>
        <Grid item xs={3}>
          <Field
            select
            label={'type'}
            value={column && column.type || 'string'}
            onChange={e => context.storage.setColumn({
              ...column,
              type: e.target.value,
            })}
          >
            {types.map((t, i) => <option key={i} value={t}>{t}</option>)}
          </Field>
        </Grid>
        <Grid item xs={2} style={{ textAlign: 'center' }}>
          <IconButton
            style={{ padding: 0 }}
            onClick={() => context.storage.delColumn(column)}
          >
            <Clear />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <Field
            label={column.getter}
            value={column && column.value || ''}
            onChange={e => context.storage.setColumn({
              ...column,
              value: e.target.value,
            })}
          />
        </Grid>
      </React.Fragment>}
    </Grid>;
  },
  Filter: ({ context, column, filter, filterIndex }) => {
    return <FilterType context={context} column={column} filter={filter} filterIndex={filterIndex}/>;
  },
  FiltersList: ({ context, column, filters }) => {
    return <React.Fragment>
      {filters.map((filter, i) => (
        <React.Fragment key={filter._id}>
          <Views.Filter context={context} filter={filter} column={column} filterIndex={i}/>
        </React.Fragment>
      ))}
    </React.Fragment>;
  },
  Filters: ({ context, column }) => {
    const [open, setOpen] = useState(null);

    const filters = context.storage.getFilters(column._id);
    
    const content = <context.Views.FiltersList context={context} column={column} filters={filters}/>;

    return <Grid container>
      {column.variant === 'short'
      ? <React.Fragment>
        {!!filters.length && <Button fullWidth onClick={e => setOpen(e.currentTarget)}>
          {filters.length}
        </Button>}
        <Popover
          open={!!open}
          anchorEl={open}
          onClose={() => setOpen(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {content}
        </Popover>
      </React.Fragment>
      : content
      }
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <IconButton style={{ padding: 0 }} onClick={
          e => context.storage.addFilter({ _id: Random.id(), columnId: column._id, type: column.type })
        }><Add/></IconButton>
      </Grid>
    </Grid>;
  },
  Pagination: ({ context }) => {
    const page = context.config.page || 0;
    const pageSize = context.config.pageSize || 5;
    const { pages } = context.methodsResults;
    const df = page > 5 ? 5 : page;
    const ps = _.times(pages, p => p).splice(
      (page - 5) < 0 ? 0 : (page - 5),
      df + 5,
    );

    return <Grid
      container
      spacing={8}
      justify="center"
    >
      <Grid item style={{ textAlign: 'center' }}>
        <IconButton style={{ padding: 0 }} onClick={
          () => context.storage.setPage(context.config.page - 1)
        }>
          <ChevronLeft/>
        </IconButton>
        {ps.map(p => (
          p === page
          ? <Field
            key={'page'}
            value={`${page}`}
            type="number"
            max={pages - 1}
            min={0}
            onChange={e => context.storage.setPage(+e.target.value)}
            style={{ width: 50 }}
            inputProps={{
              style: {
                padding: 5, textAlign: 'center',
              },
            }}
          />
          : <Button
            key={p}
            disabled={p === page}
            size="small" style={{ minWidth: 0 }}
            onClick={
              () => context.storage.setPage(p)
            }
          >{p}</Button>
        ))}
        <IconButton style={{ padding: 0 }} onClick={
          () => context.storage.setPage(context.config.page + 1)
        }>
          <ChevronRight/>
        </IconButton>
        <Field
          value={`${pageSize}`}
          type="number"
          min={0}
          onChange={e => context.storage.setPageSize(0, +e.target.value)}
          style={{ width: 50 }}
          inputProps={{
            style: {
              padding: 5, textAlign: 'center',
            },
          }}
        />
      </Grid>
    </Grid>;
  },
};
