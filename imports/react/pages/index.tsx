import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import * as React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';

// @ts-ignore
import { withStyles } from '@material-ui/core/styles';

import { Users, Nodes } from '../../api/collections/index';

class Component extends React.Component <any, any, any>{
  render() {
    return <div>
      <h1>users</h1>
      <div>
        {this.props.users.map(user => <div key={user._id}>{JSON.stringify(user)}</div>)}
      </div>
      <h1>posts</h1>
      <div>
        {this.props.nodes.map(node => <div key={node._id}>{JSON.stringify(node)}</div>)}
      </div>
    </div>;
  }
}

const tracked = withTracker((props) => {
  const users = Users.find();
  const nodes = Nodes.find();
  return {
    ready: users.ready() && nodes.ready(),
    users: users.fetch(),
    nodes: nodes.fetch(),
    ...props,
  };
})((props: any) => <Component {...props}/>);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
