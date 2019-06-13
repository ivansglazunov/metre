import { Button, Grid, IconButton, ListItem, Popover } from '@material-ui/core';
import { Add, ArrowDropDown, ArrowDropUp, ArrowRight, ChevronLeft, ChevronRight, Clear } from '@material-ui/icons';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { find } from 'mingo';

import * as React from 'react';
import { useState } from 'react';

import { mathEval } from '../../../api/math';
import { Field } from '../field';
import { FilterType } from './filters';
import { SortIconButton } from './sort-icon-button';
import { ClearIconButton } from './clear-icon-button';
import { toQuery } from './to-query';
import { IViews } from '.';
import { Nodes } from '../../../api/collections/index';
import { IPosition } from '../../../api/nested-sets/index';

import * as views from './views/value';

export const getters = [
  'path',
  'formula',
];

export const types = [
  'string',
  'ns',
  'formula',
  'values',
  'strings',
  'id',
];

export const Views: IViews = {
  Value: ({ context, data, column }) => {
    if (!data) return null;

    let value;
    if (column.getter === 'path') value = _.get(data, column.value);
    else if (column.getter === 'formula') value = mathEval(column.value, data).result;
    else return null;

    if (~types.indexOf(column.type) && views[column.type]) {
      const View = views[column.type];
      return <View value={value} data={data} column={column} context={context}/>;
    }

    return null;
  },
  columnSizes: (context, column) => ({
    minWidth: 300,
    maxWidth: 999,
  }),
  Column: ({ context, column }) => {
    return <Grid
      container
      spacing={1}
      style={{ textAlign: 'left' }}
      justify="space-between"
    >
      <React.Fragment>
        <Grid item xs={2} style={{ textAlign: 'center' }}>
          <SortIconButton column={column} storage={context.storage} style={{ padding: 0 }}/>
        </Grid>
        <Grid item xs={4}>
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
        <Grid item xs={4}>
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
          <ClearIconButton column={column} context={context} style={{ padding: 0 }}/>
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
      </React.Fragment>
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
      {content}
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
      spacing={1}
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
