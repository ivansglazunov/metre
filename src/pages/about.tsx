import * as React from 'react';
import Fillimage from './../components/fillimage';

import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles';

import Link from 'gatsby-link';

export const styles: StyleRulesCallback = (theme: Theme) => ({
  
});

export const About = (props : any) => {
  const { classes } = props;
  return (
    <div>        
      <Fillimage imgSrc="https://styleschool.ru/fm_ajax.php?action=get_standart_file&type=category&id=204&name=fullscreen.jpg" height={600} positionY='top' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          marginTop: 64,
          background: 'rgba(0,0,0,0.5)',
          maxWidth: '50%',
          color: '#fff',
          textAlign: 'center',
          flex: 1
        }}>
          <h1 style={{paddingTop: '0.5em', paddingBottom: '0.5em'}}> Высшая Школа Стилистики </h1>
          <p>Профессиональное образование в индустрии моды и дизайна
          <br/>
          Очное, заочное и дистанционное обучение</p>
        </div>
      </Fillimage>
    </div>
  );
}

export default withStyles(styles)(About)   
