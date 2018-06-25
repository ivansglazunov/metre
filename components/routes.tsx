import * as React from 'react';

import { Route } from 'react-router';

import About from './pages/about';

export class Routes extends React.Component {
  render() {
    return <div>      
      <Route path="/about" component={About} />
    </div>;
  }
}
