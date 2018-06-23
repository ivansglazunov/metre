import * as React from 'react';

import { Route } from 'react-router';

import Header from './header';
import About from './about';

export class Routes extends React.Component {
  render() {
    return <div>
      <Header/>
      
      <Route path="/about" component={About} />
    </div>;
  }
}
