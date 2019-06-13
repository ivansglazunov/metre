import { Grid, IconButton } from '@material-ui/core';
import { Add, Clear } from '@material-ui/icons';
import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { find } from 'mingo';
import * as React from 'react';
import { useState } from 'react';

import { IConfig } from '.';
import { Field } from '../../../field';
import { toQuery } from '../../to-query';
import { Nodes } from '../../../../../api/collections';

import Values from './values';

const defaultParse = (data) => String(data);

export default (props: IConfig) => {
  return <Values {...props} encode={defaultParse} decode={defaultParse}/>;
};
