import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import { Switch, Route } from 'react-router';

import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';

import Nav from './components/nav';
import LinearProgress from '@material-ui/core/LinearProgress';

const isP = Meteor.isProduction;

const NotFound = isP ? Loadable({
  loader: () => import('./pages/not-found'),
  loading: () => <LinearProgress/>,
}) : require('./pages/not-found').default;
const NS = isP ? Loadable({
  loader: () => import('./pages/ns'),
  loading: () => <LinearProgress/>,
}) : require('./pages/ns').default;
const StateTable = isP ? Loadable({
  loader: () => import('./pages/state-table'),
  loading: () => <LinearProgress/>,
}) : require('./pages/state-table').default;
const ParamsTable = isP ? Loadable({
  loader: () => import('./pages/params-table'),
  loading: () => <LinearProgress/>,
}) : require('./pages/params-table').default;
const PropsTable = isP ? Loadable({
  loader: () => import('./pages/props-table'),
  loading: () => <LinearProgress/>,
}) : require('./pages/props-table').default;
const Math = isP ? Loadable({
  loader: () => import('./pages/math'),
  loading: () => <LinearProgress/>,
}) : require('./pages/math').default;

// TODO review title and favicon

export class Routes extends React.Component {
  render() {
    return <React.Fragment>
      <Nav/>
      <Switch>
        <Route path='/ns' component={NS} />
        <Route path='/state-table' component={StateTable} />
        <Route path='/params-table' component={ParamsTable} />
        <Route path='/props-table' component={PropsTable} />
        <Route path='/math' component={Math} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>;
  }
}
