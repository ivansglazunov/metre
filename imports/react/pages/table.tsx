import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import * as React from 'react';
import * as _ from 'lodash';
import ReactTable from 'react-table';

import { Users, Nodes } from '../../api/collections/index';
import { Context, Provider } from '../components/pagination';

import options from '../../api/collections/nodes/options/index';

import { TextField, Grid, List, ListItem, ListItemText, CardContent, Card, Button, ListItemSecondaryAction, IconButton, InputAdornment } from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';

export interface IFilter
{
  _id: string;
  type: string;
  value: any;
}

export interface IColumn
{
  _id: string;
  method: string;
  value: string;
  type: string;
  filters: IFilter[];
  [ key: string ]: any;
}

export interface IState
{
  columns: IColumn[];
}

export const filterTo$and = (columns): any[] =>
{
  const $and = [];
  for (let c = 0; c < columns.length; c++)
  {
    if (columns[ c ].filter && columns[ c ].method === 'accessor')
    {
      const col = columns[ c ];
      for (let f = 0; f < col.filters.length; f++)
      {
        const filter = col.filters[ f ];
        if (filter.contains) $and.push({ [ filter.accessor ]: { $regex: `.*${ filter.contains }.*` }, });
        if (filter.equal) $and.push({ [ filter.accessor ]: { $eq: filter.contains }, });
      }
    }
  }
  return $and;
};

export const types: any = {};
types.any = {
  Header: ({ value, onChange, ...props }) => <Field
    label="accessor"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...props}
  />,
  Value: ({ value, onChange, ...props }) => JSON.stringify(value),
};
types.string = {
  Header: ({ value, onChange, ...props }) => <Field
    label="accessor"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    {...props}
  />,
  Filter: ({ value: filters, onChangeFilter }) =>
  {
    return <React.Fragment>
      {filters.map(filter => <React.Fragment>
        <Field
          value={filter.value || ''}
          onChange={event => onChangeFilter({ ...filter, value: event.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="end">
              <IconButton
                style={{ padding: 0 }}
              >
                <Clear />
              </IconButton>
            </InputAdornment>,
          }}
        />
      </React.Fragment>)}
      <div style={{ textAlign: 'center' }}>
        <IconButton
          style={{ padding: 0 }}
          onClick={() => onChangeFilter({ _id: Random.id(), })}
        >
          <Add />
        </IconButton>
      </div>
    </React.Fragment>
  },
  Value: ({ value, onChange, ...props }) => <Field
    value={value || ''}
    onChange={event => onChange(event.target.value)}
    {...props}
  />,
};
types.nums = {
  Header: ({ value, onChange, ...props }) => <Field
    label="accessor"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    {...props}
  />,
  Filter: ({ value, onChange, ...props }) => (null),
  Value: ({ value, onChange, ...props }) => <Grid container>
    {!_.isArray(value) ? null : value.map(v => <React.Fragment key={v._id}>
      <Grid item xs={4}><Field value={v.type} label={'type'} style={{ margin: 2 }} /></Grid>
      <Grid item xs={4}><Field value={v.value} label={'value'} style={{ margin: 2 }} /></Grid>
      <Grid item xs={4}><Field value={v.format} label={'format'} style={{ margin: 2 }} /></Grid>
    </React.Fragment>)}
  </Grid>,
};

export const rtColumn = {
  Cell: ({ original, column: { _column: { method, value: path }, _type } }) =>
  {
    const value = _.get(original, path);
    return <_type.Value doc={original} value={value} />;
    return _.isObject(value) ? JSON.stringify(value, null, 1) : String(value);
  },

  Header: ({ column: { _column: { _id, value }, _setColumn, _type } }) => <_type.Header value={value} onChange={(value) => _setColumn({ _id, value })} style={{ paddingTop: 3 }} />,

  Filter: ({ column: { _column: { _id, filters }, _setColumn, _type } }) => <_type.Filter value={filters} onChangeFilters={(filters) => _setColumn({ _id, filters })} onChangeFilter={(filter) => {
    for (let f = 0; f < filters.length; f++) {
      if (filters[f]._id === filter) {
        filters[f] = filter;
      }
      return;
    }
    filters.push(filter);
  }}/>,
};

export const Field = (props) => <TextField
  value={props.value || ''}
  style={{ margin: 0, ...props.style }}
  margin="normal"
  variant="outlined"
  InputLabelProps={{
    shrink: true,
  }}
  inputProps={{
    style: {
      padding: 3,
    },
  }}
  SelectProps={{
    SelectDisplayProps: {
      style: {
        padding: 3,
      },
    },
  }}
  fullWidth
  {...props}
/>

export default class TablePage extends React.Component<any, IState, any> {
  state = {
    columns: [],
  };

  methods = ({ _query, _sort, config: { page, pageSize } }, prevResults, call) => ({
    pages: Math.ceil((call('pages', 'nodes.count', _query, { sort: _sort }) || 0) / pageSize),
    _data: call('data', 'nodes.ids', _query, {
      skip: pageSize * page,
      limit: pageSize,
      ..._sort,
    }) || [],
  });
  tracker = ({ _sort, methodsResults: { _data } }) => ({
    data: _data && Nodes.find({ _id: { $in: _data } }, { sort: _sort }).fetch(),
  });

  addColumn = () => this.setState(({ columns }) => ({
    columns: [ ...columns, {
      _id: Random.id(), method: 'accessor', value: '_id', type: 'string',
      rt: {}, filters: [],
    } ],
  }));
  setColumn = (column) => this.setState(({ columns }) => ({ columns: columns.map(c => column._id === c._id ? { ...c, ...column } : c) }));
  delColumn = (column) => this.setState(({ columns }) => ({ columns: _.filter(columns, (c) => c._id !== column._id) }));

  render()
  {
    const { columns } = this.state;

    const $and = filterTo$and(columns);

    return <Provider
      methods={this.methods}
      tracker={this.tracker}

      _query={$and.length ? { $and } : {}}
      _sort={{ _id: 1 }}
    >
      <Context.Consumer>
        {({ children, storage, config, methodsResults, trackerResults }: any) =>
        {
          return <Grid container>
            <Grid item xs={4} style={{ boxShadow: 'inset 0 0 2px 0 black' }}>
              <div>
                <Button
                  variant="outlined" size="small"
                  onClick={() => storage.setPageSize(config.pageSize - 1)}
                >-</Button>
                <Button
                  variant="outlined" size="small"
                  onClick={() => storage.setPageSize(config.pageSize + 1)}
                >+</Button>
                <Button
                  variant="outlined" size="small"
                  onClick={() => storage.setPage(config.page - 1)}
                >[</Button>
                <Button
                  variant="outlined" size="small"
                  onClick={() => storage.setPage(config.page + 1)}
                >]</Button>
              </div>
              <List dense={true}>
                <ListItem button onClick={this.addColumn}>+</ListItem>
                {columns.map(c =>
                {
                  return <ListItem key={c._id} divider>
                    <Grid container spacing={16}>
                      <Grid item xs={5}>
                        <Field
                          select
                          label="method"
                          value={c.method}
                          onChange={(e) => this.setColumn({ _id: c._id, method: e.target.value })}
                        >
                          <option value="accessor">accessor</option>
                          <option value="math">math</option>
                        </Field>
                      </Grid>
                      <Grid item xs={5}>
                        <Field
                          label="value"
                          value={c.value}
                          onChange={(e) => this.setColumn({ _id: c._id, value: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <Field
                          label="filter"
                          value={c.filter}
                          onChange={(e) => this.setColumn({ _id: c._id, filter: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <Field
                          select
                          label="type"
                          value={c.type}
                          onChange={(e) => this.setColumn({ _id: c._id, type: e.target.value })}
                        >
                          {_.map(_.keys(types), (t, i) => <option key={i} value={t} selected={t === c.type}>{t}</option>)}
                        </Field>
                      </Grid>
                      <Grid item>
                        <IconButton
                          style={{ padding: 0 }}
                          onClick={() => this.delColumn(c)}
                        >
                          <Clear />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </ListItem>;
                })}
              </List>
            </Grid>
            <Grid item xs={2} style={{ boxShadow: 'inset 0 0 2px 0 black' }}>
              <pre style={{ fontSize: 8 }}><code>{JSON.stringify(config, null, 1)}</code></pre>
              <pre style={{ fontSize: 8 }}><code>{JSON.stringify(methodsResults, null, 1)}</code></pre>
              <pre style={{ fontSize: 8 }}><code>{JSON.stringify(trackerResults, null, 1)}</code></pre>
            </Grid>
            <Grid item xs={6} style={{ boxShadow: 'inset 0 0 2px 0 black' }}>
              <ReactTable
                manual
                filterable
                data={trackerResults.data}
                columns={columns.map(c => ({
                  accessor: c._id,
                  sortable: false,
                  ...rtColumn,
                  _column: c,
                  _setColumn: this.setColumn,
                  _type: types[ c.type ],
                }))}
              />
            </Grid>
          </Grid>;
        }}
      </Context.Consumer>
    </Provider>;
  }
}
