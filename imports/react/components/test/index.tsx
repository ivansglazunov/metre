import { Button, Grid, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';

import { Projects, Tries } from '../../../api/collections';
import { useMetre } from '../../../api/metre/react';

const Samovar = withTracker<any, any>(({
  userId,
  projectId,
}) => {
  return {
    userId,
    projectId,
    project: Projects.findOne(projectId),
    tries: Tries.find({}).fetch(),
  };
})(({
  projectId,
  project,
  userId,
  tries,
}) => {
  const [url, setUrl] = useState(`/project/${projectId}/${userId}/getTry`);
  const [tryResponse, setTryResponse] = useState(null);
  const [tryResult, setTryResult] = useState('');
  const [doneResponse, setDoneResponse] = useState('');

  return <div style={{ textAlign: 'left', padding: 6 }}>
    <div>
      <TextField
        fullWidth
        variant="outlined"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
    </div>
    <div>
      <Button disabled={!url} variant="outlined" onClick={async () => {
        const { data: tryResponse } = await axios.get(url);
        setTryResponse(tryResponse);
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
        onChange={e => setTryResult(e.target.value)}
      />
      {tryResponse && tryResponse.tryId && <div>{`/try/${tryResponse.tryId}/done`}</div>}
      <Button disabled={!url} variant="outlined" onClick={async () => {
        const { data: doneResponse } = await axios.post(`/try/${tryResponse.tryId}/done`, JSON.parse(tryResult));
        setDoneResponse(doneResponse);
      }}>done</Button>
    </div>
    <div>
      <pre><code>{JSON.stringify(doneResponse, null, 1)}</code></pre>
    </div>
  </div>;
});

export default ({ projectId }) => {
  const { userId } = useMetre();
  return <Samovar projectId={projectId} userId={userId}/>
};
