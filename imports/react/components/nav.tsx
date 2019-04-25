import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import { Link } from 'react-router-dom';

export default class Nav extends React.Component {
  makeReset = () => Meteor.call('nodes.reset');
  render() {
    return <ul>
      <li><Link to='/ns'>ns</Link></li>
      <li><Link to='/table'>table</Link></li>
      <li><button onClick={this.makeReset}>reset</button></li>
    </ul>;
  }
}
