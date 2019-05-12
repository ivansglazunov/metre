import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import { Link } from 'react-router-dom';

export default class Nav extends React.Component {
  state = {
    status: 'connecting',
  };
  componentDidMount() {
    Tracker.autorun(() => {
      this.setState({ status: Meteor.status().status });
    });
  }
  makeReset = () => Meteor.call('nodes.reset');
  render() {
    return <ul>
      <li>{this.state.status}</li>
      <li><Link to='/ns'>ns</Link></li>
      <li><Link to='/table'>table</Link></li>
      <li><Link to='/math'>math</Link></li>
      <li><button onClick={this.makeReset}>reset</button></li>
    </ul>;
  }
}
