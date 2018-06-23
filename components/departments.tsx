import * as React from 'react';
import Department from './department';
import Container from './../components/container';
import { Grid } from '@material-ui/core';

export default class Departments extends React.Component<any> {
  render() {
    return <Container>
      <Grid container spacing={24}>
        {
          this.props.deps.map((dep: any) => 
            <Grid item xs={12} sm={3}>
              <Department logo={dep.logo} title={dep.title} link={dep.link}/>
            </Grid>
          )
        }
      </Grid>
    </Container>;
  }
}




