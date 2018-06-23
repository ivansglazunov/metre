import * as React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles';

export const styles: StyleRulesCallback = () => ({
  flex: {
    flex: 1,
  },
  floatright: {
    float: 'right',
  },
  tab: {
    minWidth: 0,
  },
});

export const Header = (props : any) => {
  const { classes } = props;
  return(
    <div style = {{
      position: 'absolute',
      zIndex: 9,
      minWidth:'100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    }}>
      <AppBar position="fixed" color="default" style={{ zIndex: 999 }}>
        <Toolbar>
          <img
            src="/logo.png"
            style={{
              width: '3em',
              margin: '0 16px 0 0',
            }}
          />
          <Typography
          variant="title"
            color="inherit"
            style={{
              margin: '0 16px 0 0',
            }}
          >
          </Typography>
          <Tabs
            value={props.location.pathname}
            indicatorColor="primary"
            textColor="primary"
            className={classes.floatright}
          >
            <Tab
            label="О школе"
              value="/about"
              component={Link}
              className={classes.tab}
              to={`/about`}
            />
            <Tab
            label="Запись на обучение"
              value="/education"
              component={Link}
              to={`/education`}
              className={classes.tab}
            />
            <Tab
            label="Контакты"
              value="/contacts"
              component={Link}
              to={`/contacts`}
              className={classes.tab}
            />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Paper style={{ overflow: 'hidden', marginTop: 64, backgroundColor: 'transparent' }}>
        <Tabs
          value={props.location.pathname}
          indicatorColor="primary"
          textColor="primary"
          className={classes.floatright}
        >
          <Tab
          label="Расписание"
            value="/shadule"
            component={Link}
            to={`/shadule`}
            className={classes.tab}
          />
          <Tab
          label="Профподготовка"
            value="/prof"
            component={Link}
            to={`/prof`}
            className={classes.tab}
          />
          <Tab
          label="Курсы"
            value="/courses"
            component={Link}
            to={`/courses`}
            className={classes.tab}
          />
          <Tab
          label="Мастер-классы"
            value="/masterClasses"
            component={Link}
            to={`/masterClasses`}
            className={classes.tab}
          />
          <Tab
          label="Консалтинг"
            value="/сonsulting"
            component={Link}
            to={`/сonsulting`}
            className={classes.tab}
          />
        </Tabs>
      </Paper>
    </div>
  );
};

export default withRouter(withStyles(styles)(Header));
