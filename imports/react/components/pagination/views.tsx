import { Button, Grid, IconButton, ListItem } from '@material-ui/core';
import { Add, ArrowDropDown, ArrowRight, ChevronLeft, ChevronRight, Clear } from '@material-ui/icons';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { find } from 'mingo';
import * as React from 'react';

import { mathEval } from '../../../api/math';
import { Field } from '../field';
import { types as filterTypes } from './filters';
import { ColumnSortIconButton } from './sort-icon-button';
import { toQuery } from './to-query';
import { IViews } from '.';

export const getters = [
  'path',
  'formula',
];

export const types = [
  'ns',
  'string',
  'formula',
  'id',
];

export const ViewValueFormula = ({ value, v, data, column }) => {
  const result = mathEval(value.value);

  return <Grid container justify="space-between" spacing={8}>
    <Grid item xs={8}>
      <Field
        value={value.value}
        onChange={e => Meteor.call('nodes.values.set', data._id, column.value.split('.')[1], { _id: value._id, value: e.target.value })}
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
        onClick={e => Meteor.call('nodes.values.pull', data._id, column.value.split('.')[1], value._id)}
      >
        <Clear />
      </IconButton>
    </Grid>
  </Grid>
};

export const ViewValuePosition = ({ data, value, position, Icon, fullHeight = false, ...props }) => {
  return <ListItem
    style={{
      height: fullHeight ? '100%' : 'auto',
      padding: 0,
      paddingLeft: data.___parentNestPosition
      ? (position.depth - data.___parentNestPosition.depth) * 10 
      : 0
    }}
    button
    {...props}
  >
    <div style={{ fontSize: '0.8em', height: fullHeight ? '100%' : 'auto', boxShadow: 'inset black 1px 0px 0px 0px' }}>
      <div><Icon style={{ float: 'left' }}  />{position.depth} {position.left}/{position.right} {position.tree}</div>
      <div>{position.space}</div>
    </div>
  </ListItem>;
};

export const Views: IViews = {
  Value: ({ storage, data }, column: any) => {
    let value;
    if (column.getter === 'path') value = _.get(data, column.value);
    else if (column.getter === 'formula') value = mathEval(column.value, data).result;
    else return null;

    if (column.type === 'string' || !column.type) {
      if (typeof (value) === 'object') return JSON.stringify(value);
      else return String(value);
    }

    if (column.type === 'ns') {
      if (_.isArray(value)) {
        const p = data.___nestPosition;
        return <div style={{ height: '100%' }}>
          {data.___nestPosition && <ViewValuePosition
            data={data}
            value={value}
            position={p}
            Icon={ArrowRight}
            disabled
            fullHeight
          />}
          {!data.___nestPosition && value.filter(p => !storage.isNest(data._id, p._id)).map(p => {
            return <ViewValuePosition
              key={p._id}
              data={data}
              value={value}
              position={p}
              Icon={ArrowRight}
              onClick={() => {
                storage.unsetNests(data._id);
                storage.setNest(data._id, p._id, p);
              }}
            />;
          })}
          {!data.___nestPosition && value.filter(p => storage.isNest(data._id, p._id)).map(p => {
            return <ViewValuePosition
              key={p._id}
              data={data}
              value={value}
              position={p}
              Icon={ArrowDropDown}
              onClick={() => storage.unsetNest(data._id, p._id)}
            />;
          })}
        </div>;
      }
      return null;
    }

    if (column.type === 'formula') {
      const filters = storage.getFilters(column._id);
      const collection = value && _.isArray(value.values) ? value.values : [];
      const q = toQuery(column.value, filters);
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
            onClick={e => Meteor.call('nodes.values.push', data._id, column.value.split('.')[1], { value: '' })}
          >
            <Add />
          </IconButton>
        </Grid>
      </div>;
    }
    return null;
  },
  Column: (context, column: any) => {
    return {
      minWidth: 300,
      maxWidth: 999,
      element: <Grid
        container
        spacing={8}
        style={{ textAlign: 'left' }}
        justify="space-between"
      >
        <Grid item xs={3} style={{ textAlign: 'center' }}>
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
        <Grid item xs={3} style={{ textAlign: 'center' }}>
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
      </Grid>,
    };
  },
  Filter: (context, filter: any) => {
    return filterTypes[filter.type]
    ? filterTypes[filter.type](context, filter)
    : <Grid key={filter._id} item xs={12}>unexpected filter type {filter.type}</Grid>
  },
  Filters: (context, column: any) => {
    const filters = context.storage.getFilters(column._id);
    
    return <Grid container>
      {filters.map(filter => <React.Fragment key={filter._id}>{Views.Filter(context, filter)}</React.Fragment>)}
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <IconButton style={{ padding: 0 }} onClick={
          e => context.storage.addFilter({ _id: Random.id(), columnId: column._id, type: column.type })
        }><Add/></IconButton>
      </Grid>
    </Grid>;
  },
  Pagination: (context) => {
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