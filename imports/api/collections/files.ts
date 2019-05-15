

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import { FilesCollection } from 'meteor/ostrio:files';

import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

import { wrapCollection } from '../collection';
import { TPositions, NestedSets } from '../nested-sets';

const Files = new FilesCollection({
  collectionName: 'files',
  // allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    console.log('onBeforeUpload', file);
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

