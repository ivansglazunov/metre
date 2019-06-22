import { ThemeProvider } from '@material-ui/styles';
import * as React from 'react';
import { useContext } from 'react';
import { Route, Switch } from 'react-router';

import { Grid, Typography } from '@material-ui/core';

import MetreProvider from '../api/metre/react';
import theme from './theme';

import Index from './pages/index';
import Projects from './pages/projects';
import Project from './pages/project';
import Tries from './pages/tries';
import Tri from './pages/try';
import Users from './pages/users';
import User from './pages/user';
import Profile from './pages/profile';
import Test from './pages/test';

const NotFound = ({}) => {
  return <Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="center"
    style={{ height: '100%', width: '100%', textAlign: 'center' }}
  >
    <Grid item xs>
      <Typography variant="h4">404</Typography>
    </Grid>
  </Grid>;
};

export class Routes extends React.Component<any, any> {
  render() {
    const { userId } = this.props;

    return <MetreProvider userId={userId}>
      <ThemeProvider theme={theme}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Switch>
            <Route exact path="/" component={Index}/>
            <Route exact path="/projects" component={Projects}/>
            <Route exact path="/project/:projectId" component={Project}/>
            <Route exact path="/tries" component={Tries}/>
            <Route exact path="/try/:tryId" component={Tri}/>
            <Route exact path="/users" component={Users}/>
            <Route exact path="/user/:userId" component={User}/>
            <Route exact path="/profile" component={Profile}/>
            <Route exact path="/test" component={Test}/>

            <Route component={NotFound}/>
          </Switch>
        </div>
      </ThemeProvider>
    </MetreProvider>;
  }
}
