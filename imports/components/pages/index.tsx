import * as React from 'react';

import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';

const styles = () => ({
  
});

export const Component = (props : any) => {
  const { classes } = props;
  return (
    <div>meteor+ts+react+ssr+mui blueprint</div>
  );
};

export default withStyles(styles)(Component);
