import { Projects, Tries } from '../../imports/api/collections/index';
import * as bodyParser  from 'body-parser';

import { validate } from 'jsonschema';

Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

// developer make post query to /project/:_id/getTry and gets:
export interface ITryReponse {
  tryId: string;
  input: { [key: string]: any; };
}
// or it:
export interface IErrorResponse {
  error: string;
}
// developer send next post query with result data to /try/tryId/done with json:
export interface IDoneRequest {
  data?: any;
}
// and gets result of parsing and validation they data:
export interface IDoneReponse {
  tryId: string;
  errors: any[];
  schemaError?: any;
}
// or again error

Picker.route('/project/:_id/getTry', function({  _id: projectId }, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  const send = (json) => res.end(JSON.stringify(json));
  const project = Projects.findOne(projectId);
  if (!project) return send({ error: `Project ${projectId} not founded.` });
  const tryId = Tries.insert({ projectId });
  send({ tryId, input: project.input });
});

Picker.route('/try/:_id/done', function({ _id: tryId }, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  const send = (json) => res.end(JSON.stringify(json));
  const tr = Tries.findOne(tryId);
  if (!tr) return send({ error: `Try ${tryId} not founded.` });
  if (tr.completedTime) return send({ error: `Try ${tryId} already completed.` });
  const project = Projects.findOne(tr.projectId);
  if (!project) return send({ error: `Project ${tr.projectId} not founded.` });
  const completedTime = new Date().valueOf();
  let errors;
  let schemaError;
  try {
    const results = validate(req.body, project.schema);
    errors = results.errors;
  } catch(error) {
    schemaError = error;
  }
  Tries.update(tr._id, { $set: {
    completedTime,
    speed: completedTime - tr.createdTime,
    errors,
    schemaError,
  } });
  return send({ tryId, errors, schemaError });
});
