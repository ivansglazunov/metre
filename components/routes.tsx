import * as React from 'react';
import { Switch, Route } from 'react-router';
import About from './pages/about';

export class Routes extends React.Component {
  render() {
    return <div>
      <Switch>
        <Route path="/about" component={About} />
        <Route component={About} />
      </Switch>
    </div>;
  }
}
