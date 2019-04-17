import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import * as React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';

// @ts-ignore
import { withStyles } from '@material-ui/core/styles';

import { Users, Nodes } from '../../api/collections/index';

class Component extends React.Component <any, any, any>{
  state = {
    moving: null,
  };

  level = (tree, depth, left, right, space?) => {
    const nodes = Nodes
    .find({
      [`in.${tree}.depth`]: depth,
      [`in.${tree}.left`]: { $gte: left },
      [`in.${tree}.right`]: { $lte: right },
      [`in.${tree}.space`]: space ? space : { $exists: true },
    });

    return nodes.map(node => {
      const nin = _.get(node, 'in.nesting');

      return <div
        key={node._id}
        style={{
          width: `${100 / nodes.count()}%`,
          float: 'left',
        }}
      >
        <div
          style={{ padding: 6, border: '1px solid black' }}
        >
          <div style={{ fontSize: 8 }}>{node._id}</div>
          <div style={{ fontSize: 8 }}>({nin.space})</div>
          <div>
            {nin.left}|{nin.right}
            <button onClick={() => node.put('nesting', Nodes.insert({}))}>+</button>
            <button onClick={() => node.pull('nesting')}>x</button>
            <button onClick={() => this.setState({ moving: node._id })}>c</button>
            <button onClick={() => node.move('nesting', this.state.moving)}>p</button>
          </div>
        </div>
        {this.level(tree, depth + 1, nin.left, nin.right, nin.space)}
      </div>;
    });
  };

  free = (tree) => {
    return Nodes.find({ [`in.${tree}`]: { $exists: false } })
    .map((node) => {
      return <div
        key={node._id}
        style={{ padding: 6, border: '1px solid black', float: 'left' }}
      >
        <div style={{ fontSize: 8 }}>{node._id}</div>
      </div>;
    });
  };

  render() {
    return <div>
      <button onClick={() => Meteor.call('nodes.reset')}>reset</button>
      {this.level('nesting', 0, 0, 999999999999999)}
      <br/><hr/><br/>
      {this.free('nesting')}
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
