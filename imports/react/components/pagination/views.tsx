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

import ViewString from './views/value/string';
import NSString from './views/value/ns';

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

export const ViewValueFormula = ({ value, v, data, column }) => {
  const result = data.formulaEval(value.value);

  return <Grid container justify="space-between" spacing={1}>
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

export const Views: IViews = {
  Value: ({ context, data, column }) => {
    if (!data) return null;

    let value;
    if (column.getter === 'path') value = _.get(data, column.value);
    else if (column.getter === 'formula') value = mathEval(column.value, data).result;
    else return null;

    if (column.type === 'string' || !column.type) {
      return <ViewString value={value} data={data} column={column} context={context}/>;
    }

    if (column.type === 'ns') {
      return <NSString value={value} data={data} column={column} context={context}/>
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
      spacing={1}
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
