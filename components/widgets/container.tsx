import * as React from 'react';
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles';

const styles: StyleRulesCallback = (theme: Theme) => ({
  container: {
    [theme.breakpoints.up("lg")]: {
      width: 1024
    },
    margin: '0 auto',
  },
});
class Container extends React.Component<any> {
  render() {
    const { classes, children } = this.props;
    return <div className={classes.container} {...this.props.props}>
      {children}
    </div>;
  }
}

export default withStyles(styles)(Container)