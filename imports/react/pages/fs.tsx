import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import * as React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';

import { HotKeys } from "react-hotkeys";

import { Grid, LinearProgress, Tab, Tabs } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { Users, Nodes, Files } from '../../api/collections/index';

export class FS extends React.Component<any, any, any> {
  state = {
    done: false,
    error: false,
    currentUpload: false,
  };
  onChange = (e) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {

      // We upload only one file, in case
      // multiple files were selected
      const upload = Files.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', () => {
        this.setState({ done: false, error: false, currentUpload: this });
      });

      upload.on('end', (error, fileObj) => {
        if (error) this.setState({ error });
        else this.setState({ done: true });
        this.setState({ done: false, error: false, currentUpload: false });
      });

      upload.start();
    }
  }
  render() {
    const { files } = this.props;
    const { error, done } = this.state;

    return <Grid container>
      <Grid item xs={12}>
        <input type="file" onChange={this.onChange}/>
      </Grid>
      <Grid item style={{ color: 'green' }} xs={12}>
        {done && 'done'}
      </Grid>
      <Grid item style={{ color: 'red' }} xs={12}>
        {JSON.stringify(error)}
      </Grid>
      <Grid item xs={12}>
        {files.map(file => <div>
          <div><a href={Files.findOne(file._id).link()}>{Files.findOne(file._id).link()}</a></div>
        </div>)}
        {JSON.stringify(files)}
      </Grid>
    </Grid>;
  }
} 

const tracked = withTracker((props) => {
  Meteor.subscribe('files');
  return {
    files: Files.find({}).cursor.fetch(),
  };
})((props: any) => <FS {...props} />);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
