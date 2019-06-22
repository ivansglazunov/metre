import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import 'mocha';
import { assert } from 'chai';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { HTTP } from 'meteor/http';

import './';
import { Projects, Tries } from '../../imports/api/collections/index';

describe('samovar', () => {
  beforeEach(() => {
    resetDatabase();
  });
  it('Best', (done) => {
    const input = {
      [Random.id()]: Random.id(),
    };
    const projectId = Projects.insert({
      "schema": {
        "type": "object",
        "properties": {
          "data": {
            "type": "string"
          }
        }
      },
      "input": input
    });
    HTTP.call('POST', `${Meteor.absoluteUrl()}project/${projectId}/testUserId/getTry`, {}, (error, result) => {
      assert.ifError(error);
      assert.isObject(result);
      assert.isObject(result.data);
      assert.isNotOk(result.data.error);
      assert.isString(result.data.tryId);
      assert.deepEqual(result.data.input, input);
      HTTP.call('POST', `${Meteor.absoluteUrl()}try/${result.data.tryId}/done`, {
        data: { data: Random.id() },
      }, (error, result) => {
        assert.ifError(error);
        assert.isObject(result);
        assert.isObject(result.data);
        assert.isNotOk(result.data.error);
        assert.isString(result.data.tryId);
        assert.isArray(result.data.errors);
        assert.isEmpty(result.data.errors);
        assert.isNotOk(result.data.schemaError);

        assert.exists(Projects.findOne(projectId));
        assert.exists(Tries.findOne(result.data.tryId));
        done();
      });
    });
  });
  it('Project not founded', (done) => {
    const projectId = 'abc';
    HTTP.call('POST', `${Meteor.absoluteUrl()}project/${projectId}/testUserId/getTry`, {}, (error, result) => {
      assert.ifError(error);
      assert.isObject(result);
      assert.isObject(result.data);
      assert.deepEqual(result.data, { error: `Project ${projectId} not founded.`});
      done();
    });
  });
  it('Try broken', (done) => {
    const input = {
      [Random.id()]: Random.id()
    };
    const projectId = Projects.insert({
      "schema": {
        "type": "object",
        "properties": {
          "data": {
            "type": "string"
          }
        }
      },
      "input": input
    });
    HTTP.call('POST', `${Meteor.absoluteUrl()}project/${projectId}/testUserId/getTry`, {}, (error, result) => {
      assert.ifError(error);
      assert.isObject(result);
      assert.isObject(result.data);
      assert.isNotOk(result.data.error);
      assert.isString(result.data.tryId);
      assert.deepEqual(result.data.input, input);
      HTTP.call('POST', `${Meteor.absoluteUrl()}try/${result.data.tryId}/done`, {
        data: { data: 123 },
      }, (error, result) => {
        assert.ifError(error);
        assert.isObject(result);
        assert.isObject(result.data);
        assert.isNotOk(result.data.error);
        assert.isString(result.data.tryId);
        assert.isArray(result.data.errors);
        assert.isNotEmpty(result.data.errors);
        assert.isNotOk(result.data.schemaError);

        assert.exists(Projects.findOne(projectId));
        assert.exists(Tries.findOne(result.data.tryId));
        done();
      });
    });
  });
  it('Try not founded', (done) => {
    const input = {
      [Random.id()]: Random.id()
    };
    const projectId = Projects.insert({
      "schema": {
        "type": "object",
        "properties": {
          "data": {
            "type": "string"
          }
        }
      },
      "input": input
    });
    HTTP.call('POST', `${Meteor.absoluteUrl()}project/${projectId}/testUserId/getTry`, {}, (error, result) => {
      assert.ifError(error);
      assert.isObject(result);
      assert.isObject(result.data);
      assert.isNotOk(result.data.error);
      assert.isString(result.data.tryId);
      assert.deepEqual(result.data.input, input);
      const tryId = result.data.tryId;
      HTTP.call('POST', `${Meteor.absoluteUrl()}try/abc/done`, {
        data: { data: 123 },
      }, (error, result) => {
        assert.ifError(error);
        assert.isObject(result);
        assert.isObject(result.data);
        assert.deepEqual(result.data, { error: `Try abc not founded.`});

        assert.exists(Projects.findOne(projectId));
        assert.exists(Tries.findOne(tryId));
        assert.notExists(Tries.findOne('abc'));
        done();
      });
    });
  });
  it('Try already completed', (done) => {
    const input = {
      [Random.id()]: Random.id(),
    };
    const projectId = Projects.insert({
      "schema": {
        "type": "object",
        "properties": {
          "data": {
            "type": "string"
          }
        }
      },
      "input": input
    });
    HTTP.call('POST', `${Meteor.absoluteUrl()}project/${projectId}/testUserId/getTry`, {}, (error, result) => {
      assert.ifError(error);
      assert.isObject(result);
      assert.isObject(result.data);
      assert.isNotOk(result.data.error);
      assert.isString(result.data.tryId);
      assert.deepEqual(result.data.input, input);

      const tryId = result.data.tryId;
      
      HTTP.call('POST', `${Meteor.absoluteUrl()}try/${result.data.tryId}/done`, {
        data: { data: Random.id() },
      }, (error, result) => {
        assert.ifError(error);
        assert.isObject(result);
        assert.isObject(result.data);
        assert.isNotOk(result.data.error);
        assert.isString(result.data.tryId);
        assert.isArray(result.data.errors);
        assert.isEmpty(result.data.errors);
        assert.isNotOk(result.data.schemaError);

        assert.exists(Projects.findOne(projectId));
        assert.exists(Tries.findOne(result.data.tryId));
        
        HTTP.call('POST', `${Meteor.absoluteUrl()}try/${result.data.tryId}/done`, {
          data: { data: Random.id() },
        }, (error, result) => {
          assert.ifError(error);
          assert.isObject(result);
          assert.isObject(result.data);
          assert.deepEqual(result.data, { error: `Try ${tryId} already completed.`});

          assert.exists(Projects.findOne(projectId));
          assert.exists(Tries.findOne(result.data.tryId));
          
          done();
        });
      });
    });
  });
});
