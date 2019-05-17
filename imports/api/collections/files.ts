

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import { FilesCollection } from 'meteor/ostrio:files';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../collection';
import { TPositions, NestedSets } from '../nested-sets';

export interface IFile {
  _id: string;
  ext: string;
  extension: string;
  extensionWithDot: string;
  isAudio: boolean;
  isImage: boolean;
  isJSON: boolean;
  isPDF: boolean;
  isText: boolean;
  isVideo: boolean;
  meta: any;
  mime: string;
  "mime-type": string;
  name: string;
  path: string;
  public: boolean;
  size: number;
  type: string;
  userId?: string;
  versions: any;
  _collectionName: string;
  _downloadRoute: string;
  _storagePath: string;
}

const Files = new FilesCollection({
  collectionName: 'files',
  // allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    return true;
  }
});
// @ts-ignore
Meteor.files = Files;
export default Files;

// Server
if (Meteor.isServer) {
  // Publish
  Meteor.publish('files', function() {
    return Files.find().cursor;
  });
}

