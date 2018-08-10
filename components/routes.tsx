import * as React from 'react';
import { Route, Switch } from 'react-router';
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
