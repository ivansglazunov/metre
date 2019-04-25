import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ReactTable from 'react-table';
import { LoadPage } from '../load-page';

class DrawTable extends React.Component<any, any, any>{
  render() {
    const { ...props } = this.props;

    return <div>
      <ReactTable
        {...props}
        manual
      />
    </div>;
  }
}

export default class Table extends React.Component<any, any, any> {
  static propTypes = {
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPageSizeChange: PropTypes.func.isRequired,
  };

  render() {
    const { methods, tracker, ...props } = this.props;

    return <LoadPage
      methods={methods}
      tracker={tracker}
      Component={DrawTable}
      
      {...props}
    />;
  }
}
