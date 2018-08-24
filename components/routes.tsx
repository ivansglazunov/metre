import * as React from 'react';
import { Switch, Route } from 'react-router';
import About from './pages/about';
import Maker from './pages/imagemaker';


export class Routes extends React.Component {
  render() {
    return <div>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="/imagemaker" component={Maker} />
        <Route component={About} />
      </Switch>
    </div>;
  }
}
