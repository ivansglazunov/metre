import * as React from 'react';

import {Helmet} from "react-helmet";
import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';

const styles = () => ({
  
});

export const Component = (props : any) => {
  const { classes } = props;
  return (
    <div>
      <Helmet>
        <title>meteor+ts+react+ssr+mui blueprint</title>
      </Helmet>
      meteor+ts+react+ssr+mui blueprint
    </div>
  );
};

export default withStyles(styles)(Component);
