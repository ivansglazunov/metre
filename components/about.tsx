import * as React from 'react';
import Fillimage from './fillimage';
import Grid from '@material-ui/core/Grid';
import Container from './container';
import Button from '@material-ui/core/Button';

import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';

import Department from './department';

export const styles: StyleRulesCallback = () => ({
  root: {
    flexGrow: 1,
  },
});

export const About = (props : any) => {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <Fillimage imgSrc="/pages/about/fullscreen.jpg" height={600} positionY='top' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
        <div style={{ 
          marginTop: 64,
          background: 'rgba(0,0,0,0.5)',
          maxWidth: '50%',
          color: '#fff',
          textAlign: 'center',
          flex: 1
        }}>
          <h1 style={{paddingTop: '0.5em', paddingBottom: '0.5em'}}> Высшая Школа Стилистики </h1>
          <p>Профессиональное образование в индустрии моды и дизайна <br/>
          Очное, заочное и дистанционное обучение</p>
        </div>
      </Fillimage>
      <Container props={{ style: { marginTop: 60 } }}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={4}>
            <img src="/pages/about/combo_celi.jpg" style={{ maxWidth:'100%' }}/>
          </Grid>
          <Grid item xs={12} sm={8}>
            <div> Наши цели
              <ul> 
                <li>Подготовить специалистов, чьи знания и профессиональные навыки соответствуют требованиям современного мира</li>
                <li>Дать возможность применить лучшим выпускникам Школы свои знания и практические навыки посредством работы с реальными как частными, так и с корпоративными клиентами</li>
                <li>Реализовать не только необходимые спецдисциплины в той или иной области, но и актуальные общекультурные дисциплины, без которых нельзя стать успешным и современным профессионалом</li>
                <li>Предоставить возможность выбора как программ и курсов, так и способа их освоения: принцип модульного обучения предполагает свободу и вариативность в освоении тех знаний и навыков, которые с Вашей точки зрения, Вам необходимы</li>
                <li>Привлекать интересных и грамотных профессионалов-практиков, которые не только читают лекции в аудитории, но главное - готовят обучающихся к практике в условиях российского рынка</li>
              </ul>
            </div>
          </Grid>
        </Grid>
      </Container>
      <div style={{textAlign: 'center'}}><h2>Факультеты</h2></div>
      <Container>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={3}>
            <Department logo="https://styleschool.ru/fm_ajax.php?action=get_standart_file&type=category&id=204&name=imedg_icon.png"  title="Факультет Имиджмейкинга" link="#"/>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Department logo="https://styleschool.ru/fm_ajax.php?action=get_standart_file&type=category&id=204&name=imedg_icon.png"  title="Факультет Имиджмейкинга" link="#"/>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Department logo="https://styleschool.ru/fm_ajax.php?action=get_standart_file&type=category&id=204&name=imedg_icon.png"  title="Факультет Имиджмейкинга" link="#"/>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Department logo="https://styleschool.ru/fm_ajax.php?action=get_standart_file&type=category&id=204&name=imedg_icon.png"  title="Факультет Имиджмейкинга" link="#"/>
          </Grid>
        </Grid>
      </Container>
      <div style={{ textAlign: 'center'}}> <Button variant="raised" href="#"> Клуб выпускников </Button></div>
      <img src="/pages/about/aboutData_1.png" style={{display: 'block', margin:'0 auto'}}/>
      <h3 style={{ textAlign: 'center'}}>Преподаватели</h3>
      <h3 style={{ textAlign: 'center'}}>Наша география</h3>
      <img src="/pages/about/map.jpg" style={{display: 'block', margin:'0 auto'}}/>
    </div>
  );
}

export default withStyles(styles)(About)   
