import * as React from 'react';
import { withRouter } from 'react-router';
import Link from 'gatsby-link';

import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles';

export const styles: StyleRulesCallback = (theme: Theme) => ({
  flex: {
    flex: 1,
  },
  floatright: {
    float: "right",
  },
  tab: {
    minWidth: 0,
  }
});

export const Header = (props : any) => {
  const { classes } = props;
  return(
    <div>
      <AppBar position="static" color="default">
        <Toolbar>
          <img 
            src='http://styleschool.ru/theme/image.php?theme=bootstrap&amp;component=theme&amp;image=logo64' 
            style={{
              width: '3em',
              margin: '0 16px 0 0',
            }}
          />
          <Typography variant="title" color="inherit">
            Высшая школа стилистики
          </Typography>
          <Button color="inherit">О школе</Button>
          <Button color="inherit">Запись на обучение</Button>
          <Button color="inherit">Контакты</Button>
          <span  className={classes.flex}/>
          <IconButton aria-haspopup="true" color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={{ overflow: 'hidden' }}>
        <Tabs
          value={props.location.pathname}
          indicatorColor="primary"
          textColor="primary"
          className={classes.floatright}
        >
          <Tab 
            label="Расписание" 
            value="/shadule" 
            component={props => <Link {...props} to={`/shadule`}/>}
            className={classes.tab}
          />
          <Tab 
            label="Профподготовка" 
            value="/prof" 
            component={props => <Link {...props} to={`/prof`}/>}
            className={classes.tab}
          />
          <Tab 
            label="Курсы" 
            value="/courses" 
            component={props => <Link {...props} to={`/courses`}/>}
            className={classes.tab}
          />
          <Tab 
            label="Мастер-классы" 
            value="/master-classes" 
            component={props => <Link {...props} to={`/master-classes`}/>}
            className={classes.tab}
          />
          <Tab 
            label="Консалтинг" 
            value="/сonsulting" 
            component={props => <Link {...props} to={`/сonsulting`}/>}
            className={classes.tab}
          />
        </Tabs>
      </div>
    </div>
  )
};

export default withRouter(withStyles(styles)(Header));
