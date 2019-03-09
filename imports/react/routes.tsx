import * as React from 'react';
import { Switch, Route } from 'react-router';
import Index from './pages/index';

export class Routes extends React.Component {
  render() {
    return <Switch>
      <Route component={Index} />
    </Switch>;
  }
}
