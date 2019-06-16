import { ThemeProvider } from '@material-ui/styles';
import * as React from 'react';
import { useContext } from 'react';
import { Route, Switch } from 'react-router';

import MetreProvider, { Context } from '../api/metre/react';
import theme from './theme';

const NotFound = ({}) => {
  const { userId } = useContext(Context);
  return <div>
    userId: {userId}
  </div>;
};

export class Routes extends React.Component<any, any> {
  render() {
    const { userId } = this.props;

    return <MetreProvider userId={userId}>
      <ThemeProvider theme={theme}>
        <Switch>
          <Route component={NotFound} />
        </Switch>
      </ThemeProvider>
    </MetreProvider>;
  }
}
