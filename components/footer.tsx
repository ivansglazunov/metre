import * as React from 'react';
import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from './widgets/container';
import Button from '@material-ui/core/Button';

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
      zIndex: 9,
      marginBottom: 0,
      minWidth:'100%',
      backgroundColor: '#F5F5F5',
    }}>
      <Container>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={4}>
            <h3>Кампус</h3>
            <ul>
              <li><a href="http://styleschool.ru">Москва</a></li>
              <li><a href="http://novosib.styleschool.ru" rel="nofollow">Новосибирск</a></li>
              <li><a href="http://smolensk.styleschool.ru">Смоленск</a></li>
              <li><a href="https://styleschool.ru/club">Клуб выпускников</a></li>
            </ul>
          </Grid>
          <Grid item xs={12} sm={6}>
            <h3>Партнеры</h3>
            <ul>
              <li><b>Р</b>оссийский государственный социальный университет </li>
              <li><b>Р</b>оссийский государственный университет туризма и сервиса</li>
            </ul>
          </Grid>
          <Grid item xs={12} sm={2}>
          <div style={{ fontSize: '1.6em' }}>
            <a href="https://vk.com/stylemsk" rel="nofollow" target="_blank">ВК</a>&nbsp;
            <a href="https://www.facebook.com/styleschool.ru/" rel="nofollow" target="_blank">ФБ</a>&nbsp;
            <a href="https://www.instagram.com/styleschool.ru/" rel="nofollow" target="_blank">Инст</a>
          </div>
          </Grid>
        </Grid>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={4}>
            <h3>Адрес</h3>
            <span>г. Москва, Проспект Мира, дом 101, стр. 1, 600 офис</span>
          </Grid>
          <Grid item xs={12} sm={4}>
            <h3>Телефоны</h3>
            <span>+7 (495) 221-89-35</span>
          </Grid>
          <Grid item xs={12} sm={4}>
          <h3>Время работы</h3>
            <span>Пн - Пт с 10:00 до 19:00 (мск)</span>
          </Grid>
        </Grid>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={4}>
          <a href="/information">Информация для пользователей</a>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="raised" href="#" data-yacounter="footer" data-toggle="modal" data-target="#styleschool-sandMessage"> Подать заявку </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default withStyles(styles)(Header);
