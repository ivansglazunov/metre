import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import _ from 'lodash';

import { Users, Nodes } from '../../api/collections/index';
import Table from '../components/table';
import TextField from '@material-ui/core/TextField';

export default class TablePage extends React.Component<any, any, any> {

  state = {
    error: null,
    list: [],
    
    rtp: {
      page: 0,
      pages: 0,
      pageSize: 5,
      sorted: [],
      filtered: [],
    },
  };

  query = () => {
    const result: any = {};
    const $and = this.state.rtp.filtered.map(f => ({
      [f.id]: { $regex : `.*${f.value}.*` },
    }));
    if ($and.length) result.$and = $and;
    return result;
  };
  sort = () => {
    const result: any = {};
    for (let s = 0; s < this.state.rtp.sorted.length; s++) {
      const so = this.state.rtp.sorted[s];
      result[so.id] = so.desc ? 1 : -1;
    }
    return result;
  };
  columns = [
    {
      Header: 'Id',
      accessor: '_id',
      Filter: ({ filter, onChange }) => (
        <TextField
          style={{ margin: 0 }}
          margin="normal"
          variant="outlined"
          fullWidth
          value={filter ? filter.value : ''}
          onChange={event => onChange(event.target.value)}
        />
      ),
    },
  ];

  onPageChange = (page) => this.setState({ rtp: { ...this.state.rtp, page } });
  onPageSizeChange = (pageSize, page) => this.setState({ ...this.state.rtp, rtp: { pageSize, page } });
  onSortedChange = (sorted, column, shiftKey) => {
    this.setState({ rtp: { ...this.state.rtp, sorted } });
  };
  onFilteredChange = (filtered, column) => {
    this.setState({ rtp: { ...this.state.rtp, filtered } });
  };

  methods = async ({ query, sort, page, pageSize }, prevResults, call) => ({
    pages: Math.ceil(await call('nodes.count', query, { sort }) / pageSize),
    _data: await call('nodes.fetch', query, {
      fields: { _id: 1 },
      skip: pageSize * page,
      limit: pageSize,
      ...sort,
    }),
  });
  tracker = ({ sort, _data }) => ({
    data: _data && Nodes.find({ _id: { $in: _data.map(d => d._id) } }, { sort }).fetch(),
  });

  render() {
    const { rtp: { page, pageSize, pages, sorted, filtered } } = this.state;

    return <Table
      methods={this.methods}
      tracker={this.tracker}

      query={this.query()}
      sort={this.sort()}

      columns={this.columns}

      pages={pages}
      page={page}
      onPageChange={this.onPageChange}

      pageSize={pageSize}
      onPageSizeChange={this.onPageSizeChange}
      
      sorted={sorted}
      onSortedChange={this.onSortedChange}
      
      filterable={true}
      filtered={filtered}
      onFilteredChange={this.onFilteredChange}
    />;
  }
}
