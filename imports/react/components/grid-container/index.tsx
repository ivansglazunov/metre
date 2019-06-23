import { Button, Paper, Grid, List, ListItem, ListItemText, Hidden } from '@material-ui/core';
import * as React from 'react';

export const GridContainer = ({
  children,
}) => {
  return <Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="flex-start"
    style={{ height: '100%', width: '100%', textAlign: 'center', position: 'absolute', top: 0, left: 0 }}
  >
    {children}
  </Grid>;
};
