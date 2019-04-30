import * as React from 'react';
import { Switch, Route } from 'react-router';

import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';

import Nav from './components/nav';

// import NotFound from './pages/not-found';
// import NS from './pages/ns';
// import Table from './pages/table';
// import Math from './pages/math';

const NotFound = Loadable({
  loader: () => import('./pages/not-found'),
  loading: () => <div></div>,
});
const NS = Loadable({
  loader: () => import('./pages/ns'),
  loading: () => <div></div>,
});
const Table = Loadable({
  loader: () => import('./pages/table'),
  loading: () => <div></div>,
});
const Math = Loadable({
  loader: () => import('./pages/math'),
  loading: () => <div></div>,
});

export class Routes extends React.Component {
  render() {
    return <React.Fragment>
      <Nav/>
      <Switch>
        <Route path='/ns' component={NS} />
        <Route path='/table' component={Table} />
        <Route path='/math' component={Math} />
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>;
  }
}
