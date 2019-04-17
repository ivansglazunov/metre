import _ from 'lodash';
import { series } from 'async';
import { Random } from 'meteor/random';

import Nodes from '.';

export function moveRights(
  size, tree,
  space,
  right,
  done,
) {
  Nodes.update({
    [`in.${tree}.space`]: space,
    [`in.${tree}.left`]: { $gt: right },
  }, {
    $inc: {
      [`in.${tree}.left`]: size,
      [`in.${tree}.right`]: size,
    },
  }, { multi: true }, done);
};

export function resize(
  size, tree,
  selector,
  direction,
  done,
) {
  Nodes.update(selector, {
    $inc: {
      [`in.${tree}.${direction}`]: size,
    },
  }, { multi: true }, done);
};

export function nodesMoveSpace(
  tree,
  space0,
  left0,
  right0,
  depth0,
  space1,
  left1,
  right1,
  depth1,
  done,
) {
  Nodes.update({
    [`in.${tree}.space`]: space0,
    [`in.${tree}.left`]: { $gte: left0 },
    [`in.${tree}.right`]: { $lte: right0 },
    [`in.${tree}.depth`]: { $gte: depth0 },
  }, {
    $inc: {
      [`in.${tree}.left`]: left1,
      [`in.${tree}.right`]: right1,
      [`in.${tree}.depth`]: depth1,
    },
    $set: {
      [`in.${tree}.space`]: space1,
    },
  }, { multi: true }, done);
};

export function nodeSet(
  nodeId, parentId,
  tree,
  space,
  left, right, depth,
  done,
) {
  Nodes.update({
    _id: nodeId,
  }, {
    $set: {
      [`in.${tree}`]: {
        parentId,
        space,
        left,
        right,
        depth,
      },
    },
  }, { multi: true }, done);
};

export function nodesUnset(
  tree,
  space,
  left, right, depth,
  done,
) {
  Nodes.update({
    [`in.${tree}.space`]: space,
    [`in.${tree}.left`]: { $gte: left },
    [`in.${tree}.right`]: { $lte: right },
    [`in.${tree}.depth`]: { $gte: depth },
  }, {
    $unset: {
      [`in.${tree}`]: true,
    },
  }, { multi: true }, done);
};

export function nodesPut(tree, parentId, nodeId) {
  const parent = Nodes.findOne({ _id: parentId });
  if (!parent) throw new Error('parentNotFound');

  const pin = _.get(parent, `in.${tree}`);
  if (!pin) throw new Error('parentNotIntTree');

  const node = Nodes.findOne({ _id: nodeId });
  if (!node) throw new Error('nodeNotFound');

  const nin = _.get(node, `in.${tree}`);
  if (nin) throw new Error('nodeAlreadyInTree');
  const size = 1;

  series([
    (done) => moveRights(+size + 1, tree, pin.space, pin.right, done),
    (done) => resize(+size + 1, tree, {
      [`in.${tree}.space`]: pin.space,
      [`in.${tree}.left`]: { $lte: pin.left },
      [`in.${tree}.right`]: { $gte: pin.right },
      [`in.${tree}.depth`]: { $lte: pin.depth },
    }, 'right', done),
    (done) => nodeSet(nodeId, parentId, tree, pin.space, pin.right, pin.right + size, pin.depth + 1, done),
  ], (error, result) => {
    if (error) throw error;
  });
};

export function nodesPull(tree, nodeId) {
  const node = Nodes.findOne({ _id: nodeId });
  if (!node) throw new Error('nodeNotFound');

  const nin = _.get(node, `in.${tree}`);
  if (!nin) throw new Error('nodeNotInTree');
  const size = nin.right - nin.left;

  series([
    (done) => nodesUnset(tree, nin.space, nin.left, nin.right, nin.depth, done),
    (done) => resize(-(size + 1), tree, {
      [`in.${tree}.space`]: nin.space,
      [`in.${tree}.left`]: { $lte: nin.left },
      [`in.${tree}.right`]: { $gte: nin.right },
      [`in.${tree}.depth`]: { $lte: nin.depth - 1 },
    }, 'right', done),
    (done) => moveRights(-(size + 1), tree, nin.space, nin.right, done),
  ], (error, result) => {
    if (error) throw error;
  });
};

export function nodesMove(tree, parentId, nodeId) {
  let parent1 = Nodes.findOne({ _id: parentId });
  if (!parent1) throw new Error('newParentNotFound');

  let pin1 = _.get(parent1, `in.${tree}`);
  if (!pin1) throw new Error('newParentNotIntTree');

  let parent2, pin2;

  const node0 = Nodes.findOne({ _id: nodeId });
  if (!node0) throw new Error('nodeNotFound');

  const nin0 = _.get(node0, `in.${tree}`);
  if (!nin0) throw new Error('nodeNotInTree');
  const size = nin0.right - nin0.left;

  if (pin1.space === nin0.space && pin1.left >= nin0.left && pin1.right <= nin0.right) {
    throw new Error('cantMoveInSelf');
  }

  const tempSpace = Random.id();

  series([
    (done) => nodesMoveSpace(
      tree,
      nin0.space,
      nin0.left,
      nin0.right,
      nin0.depth,
      tempSpace,
      -nin0.left,
      -nin0.left,
      -nin0.depth,
      done,
    ),
    (done) => resize(-(size + 1), tree, {
      [`in.${tree}.space`]: nin0.space,
      [`in.${tree}.left`]: { $lte: nin0.left },
      [`in.${tree}.right`]: { $gte: nin0.right },
      [`in.${tree}.depth`]: { $lte: nin0.depth - 1 },
    }, 'right', done),
    (done) => moveRights(-(size + 1), tree, nin0.space, nin0.right, done),
    (done) => {
      parent2 = Nodes.findOne({ _id: parentId });
      if (!parent2) throw new Error('newParentNotFound');
      
      pin2 = _.get(parent2, `in.${tree}`);
      if (!pin2) throw new Error('newParentNotIntTree');

      if (done) done();
    },
    (done) => moveRights(+size + 1, tree, pin2.space, pin2.right, done),
    (done) => resize(+size + 1, tree, {
      [`in.${tree}.space`]: pin2.space,
      [`in.${tree}.left`]: { $lte: pin2.left },
      [`in.${tree}.right`]: { $gte: pin2.right },
      [`in.${tree}.depth`]: { $lte: pin2.depth },
    }, 'right', done),
    (done) => nodesMoveSpace(
      tree,
      tempSpace,
      nin0.left - nin0.left,
      nin0.right - nin0.left,
      nin0.depth - nin0.depth,
      pin2.space,
      (pin2.right),
      (pin2.right),
      pin2.depth + 1,
      done,
    ),
    (done) => Nodes.update(node0._id, { $set: {
      [`in.${tree}.parentId`]: parent1._id,
    } }, done),
  ], (error, result) => {
    if (error) throw error;
  });
};
