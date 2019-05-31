import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';

import * as React from 'react';
import { useState } from 'react';

import * as  _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';

import { HotKeys } from "react-hotkeys";

import { Grid, LinearProgress, Tab, Tabs } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { Users, Nodes, Files } from '../../api/collections/index';

import { useDropzone } from 'react-dropzone';
import { IFile } from '../../api/collections/files';

export interface ILoad {
  _id: string;
  upload: IUpload;
}

export interface IUpload {
  [key: string]: any;
}

export interface IProps {
  files: IFile[];
  onLoad?: (load: ILoad, loads: ILoad[]) => void;
  onLoadStart?: (load: ILoad, loads: ILoad[]) => void;
  onLoadEnd?: (load: ILoad, loads: ILoad[]) => void;
  onLoaded?: (load: ILoad, loads: ILoad[]) => void;
}

export const DropzoneProgress = ({ loads }) => {
  return <React.Fragment>
    {loads.map(({ _id, upload }) => <div key={_id}>
      <div>
        <div>{upload.file.path}</div>
        <LinearProgress variant="determinate" value={upload.progress.get()}/>
      </div>
    </div>)}
  </React.Fragment>;
};

export const Dropzone = ({ files, onLoad, onLoadStart, onLoadEnd, onLoaded }: IProps) => {
  const [loads, setLoads] = React.useState([]);
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
    onDrop: files => files.map(file => {
      const upload = Files.insert({
        file,
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      const load = {_id: Random.id(), upload};
      if (onLoad) onLoad(load, loads);

      upload.on('start', () => {
        setLoads([...loads, load]);
        if (onLoadStart) onLoadStart(load, loads);
      });

      upload.on('end', (error, fileObj) => {
        const newLoads = _.filter(loads, l => l._id !== load._id);
        setLoads(newLoads);
        if (onLoadEnd) onLoadEnd(load, loads);
      });

      upload.start();
    }),
  });

  return (
    <Grid container justify="space-between" spacing={1}>
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>acceptedFiles</h4>
        <ul>{acceptedFiles.map((file: any) => (
          <li key={file.path}>
            {file.path} - {file.size} bytes
          </li>
        ))}</ul>
        <h4>uploads</h4>
        <DropzoneProgress loads={loads}/>
        <h4>files</h4>
        {files.map(file => <div key={file._id}>
          <div><a href={Files.findOne(file._id).link()}>{Files.findOne(file._id).link()}</a></div>
        </div>)}
      </aside>
    </Grid>
  );
};

// export class FS extends React.Component<any, any, any> {
//   state = {
//     uploads: [],
//   };
//   onChange = (e) => {
//     if (e.currentTarget.files && e.currentTarget.files.length) {

//       // this.setState({ uploads: e.currentTarget.files.map(f => { file: f, error: false, done: false }) });
      
//       // e.currentTarget.files.map(file => {
//       //   const upload = Files.insert({
//       //     file,
//       //     streams: 'dynamic',
//       //     chunkSize: 'dynamic'
//       //   }, false);

//       //   upload.on('start', () => {
//       //     this.setState({ done: false, error: false, currentUpload: this });
//       //   });

//       //   upload.on('end', (error, fileObj) => {
//       //     if (error) this.setState({ error });
//       //     else this.setState({ done: true });
//       //     this.setState({ done: false, error: false, currentUpload: false });
//       //   });
  
//       //   upload.start();
//       // });
//     }
//   }
//   render() {
//     const { files } = this.props;
//     // const { error, done } = this.state;

//     return null;
//     // return <Grid container>
//     //   <Grid item xs={12}>
//     //     <input type="file" onChange={this.onChange}/>
//     //   </Grid>
//     //   <Grid item style={{ color: 'green' }} xs={12}>
//     //     {done && 'done'}
//     //   </Grid>
//     //   <Grid item style={{ color: 'red' }} xs={12}>
//     //     {JSON.stringify(error)}
//     //   </Grid>
//     //   <Grid item xs={12}>
//     //     {files.map(file => <div>
//     //       <div><a href={Files.findOne(file._id).link()}>{Files.findOne(file._id).link()}</a></div>
//     //     </div>)}
//     //     {JSON.stringify(files)}
//     //   </Grid>
//     // </Grid>;
//   }
// } 

const tracked = withTracker((props) => {
  Meteor.subscribe('files');
  return {
    files: Files.find({}).cursor.fetch(),
  };
})((props: any) => <Dropzone {...props} />);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
