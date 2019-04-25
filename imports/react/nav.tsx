import * as React from 'react';
import { Link } from 'react-router-dom';

export default class Nav extends React.Component {
  render() {
    return <ul>
      <li><Link to='/ns'>ns</Link></li>
      <li><Link to='/table'>table</Link></li>
    </ul>;
  }
}
