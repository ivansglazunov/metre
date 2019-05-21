import { Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import axios from 'axios';

import { Projects, Tries } from '../../api/collections';
import { Field } from '../components/field';

export class Samovar extends React.Component<any, any, any> {
  state = {
    url: '/project/abc/getTry',
    tryResponse: null,
    tryResult: '',
    doneResponse: '',
  };
  render() {
    const { projects, tries } = this.props;
    const { url, tryResponse, tryResult, doneResponse } = this.state;

    return <Grid container>
      <Grid item xs={6}>
        <Button variant="outlined" onClick={() => {
          Tries.find({}).forEach(tr => Tries.remove(tr._id));
          Projects.find({}).forEach(p => Projects.remove(p._id));
          Projects.insert(
            {
             "_id": "abc",
             "schema": {
              "type": "object",
              "properties": {
               "data": {
                "type": "number"
               }
              }
             },
             "input": {
              "data": 123
             }
            }
          );
        }}>clear</Button>
        <pre><code>{JSON.stringify(projects, null, 1)}</code></pre>
        <pre><code>{JSON.stringify(tries, null, 1)}</code></pre>
      </Grid>
      <Grid item xs={6}>
        <div>
          <Field 
            delay={0}
            value={url}
            onChange={e => this.setState({ url: e.target.value })}
          />
        </div>
        <div>
          <Button disabled={!url} variant="outlined" onClick={async () => {
            const { data: tryResponse } = await axios.get(url);
            this.setState({ tryResponse })
          }}>try</Button>
        </div>
        <div>
          <pre><code>{JSON.stringify(tryResponse, null, 1)}</code></pre>
        </div>
        <div>
          <Field 
            delay={0}
            disabled={!tryResponse || !url}
            error={!(!tryResponse || !url) && (() => {
              try {
                JSON.parse(tryResult);
              } catch(error) {
                return true;
              }
              return false;
            })()}
            placeholder={`{"data":123}`}
            value={tryResult}
            multiline
            onChange={e => this.setState({ tryResult: e.target.value })}
          />
          <Button disabled={!url} variant="outlined" onClick={async () => {
            const { data: doneResponse } = await axios.post(`/try/${tryResponse.tryId}/done`, JSON.parse(tryResult));
            this.setState({ doneResponse });
          }}>done</Button>
        </div>
        <div>
          <pre><code>{JSON.stringify(doneResponse, null, 1)}</code></pre>
        </div>
      </Grid>
    </Grid>;
  }
} 

const tracked = withTracker((props) => {
  return {
    projects: Projects.find({}).fetch(),
    tries: Tries.find({}).fetch(),
  };
})((props: any) => <Samovar {...props} />);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
