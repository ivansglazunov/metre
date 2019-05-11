import * as React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import { Users, Nodes } from '../../api/collections/index';

export default class NotFound extends React.Component<any, any, any> {
  render() {
    const { node } = this.props;

    return <div>
      <div>404</div>
    </div>;
  }
}
