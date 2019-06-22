import { Button, Grid, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Projects, Tries } from '../../../api/collections';

export class Samovar extends React.Component<any, any, any> {
  state = {
    url: `/project/abc/${this.props.userId || 'testUserId'}/getTry`,
    tryResponse: null,
    tryResult: '',
    doneResponse: '',
  };
  componentDidUpdate(prevProps) {
    if (!prevProps.userId && prevProps.userId !== this.props.userId) {
      this.setState({ url: `/project/abc/${this.props.userId}/getTry` });
    }
  }
  render() {
    const { projects, tries, userId } = this.props;
    const { url, tryResponse, tryResult, doneResponse } = this.state;

    return <Grid container>
      <Grid item xs={6}>
        <Button variant="outlined" onClick={() => {
          Tries.find({}).forEach(tr => Tries.remove(tr._id));
          Projects.find({}).forEach(p => Projects.remove(p._id));
          Projects.insert(
            {
             "_id": "abc",
             "title": "SomeTitle",
             "description": "SomeDescription",
             "status": true,
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
        <pre><code>{JSON.stringify({ userId }, null, 1)}</code></pre>
        <pre><code>{JSON.stringify(projects, null, 1)}</code></pre>
        <pre><code>{JSON.stringify(tries, null, 1)}</code></pre>
      </Grid>
      <Grid item xs={6}>
        <div>
          <TextField
            fullWidth
            variant="outlined"
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
          <TextField
            fullWidth
            variant="outlined"
            disabled={!tryResponse || !url}
            error={!(!tryResponse || !url) && (() => {
              try {
                const json = JSON.parse(tryResult);
                if (typeof(json) !== 'object') return true;
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
          {tryResponse && tryResponse.tryId && <div>{`/try/${tryResponse.tryId}/done`}</div>}
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

const tracked = withTracker(({ userId }) => {
  return {
    userId,
    projects: Projects.find({}).fetch(),
    tries: Tries.find({}).fetch(),
  };
})((props: any) => <Samovar {...props} />);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
