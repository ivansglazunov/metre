import * as React from 'react';
import { Switch, Route } from 'react-router';

import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';

import Nav from './components/nav';

import NotFound from './pages/not-found';
import NS from './pages/ns';
import StateTable from './pages/state-table';
import ParamsTable from './pages/params-table';
import PropsTable from './pages/props-table';
import Math from './pages/math';

// const NotFound = Loadable({
//   loader: () => import('./pages/not-found'),
//   loading: () => <div></div>,
// });
// const NS = Loadable({
//   loader: () => import('./pages/ns'),
//   loading: () => <div></div>,
// });
// const StateTable = Loadable({
//   loader: () => import('./pages/state-table'),
//   loading: () => <div></div>,
// });
// const ParamsTable = Loadable({
//   loader: () => import('./pages/params-table'),
//   loading: () => <div></div>,
// });
// const PropsTable = Loadable({
//   loader: () => import('./pages/props-table'),
//   loading: () => <div></div>,
// });
// const Math = Loadable({
//   loader: () => import('./pages/math'),
//   loading: () => <div></div>,
// });

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
