import * as _ from 'lodash';
import * as React from 'react';

import { Context } from '../components/pagination';
import ReactTable from 'react-table';

export class Table extends React.Component<any, any, any> {
  consumerRender = (context: any) => {
    return <ReactTable
      {...this.props}
      pages={context.trackerResults.pages}
      data={this.data(context)}
      page={context.config.page}
      onPageChange={this.onPageChange(context)}
      pageSize={context.config.pageSize}
      onPageSizeChange={this.onPageSizeChange(context)}
      columns={this.columns(context)}
      manual
      filterable
      loading={!!context.trackerResults.loading}
      PaginationComponent={this.PaginationComponent(context)}
    />;
  };
  PaginationComponent = (context) => () => {
    return <context.Views.Pagination context={context}/>;
  };
  onPageChange = (context) => (pageIndex) => context.storage.setPage(pageIndex);
  onPageSizeChange = (context) => (pageSize, pageIndex) => context.storage.setPageSize(pageIndex, pageSize);
  columns = (_context) => _context.config.columns.map(c => ({
    accessor: c._id,
    sortable: false,
    _context,
    Cell: this.Cell,
    Header: this.Header,
    Filter: this.Filter,
    ..._context.Views.columnSizes(_context, c),
  }));
  data = (context) => {
    return _.map(context.trackerResults.data, data => ({ data, context }));
  };

  Cell = ({ original: { data, context }, column: { id } }) => <context.Views.Value data={data} context={context} column={context.storage.getColumn(id)}/>;
  Header = ({ column: { id, _context } }) => <div style={{ paddingTop: 5 }}><_context.Views.Column context={_context} column={_context.storage.getColumn(id)}/></div>;
  Filter = ({ column: { id, _context } }) => <div style={{ padding: 3 }}><_context.Views.Filters context={_context} column={_context.storage.getColumn(id)}/></div>;

  render() {
    return <Context.Consumer>
      {this.consumerRender}
    </Context.Consumer>;
  }
}
