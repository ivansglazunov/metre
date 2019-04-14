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
  console.log('moveRights', { 
    size, tree,
    space,
    right,});
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

export function resizeParents(
  size, tree,
  space,
  left, right, depth,
  done,
) {
  console.log('resizeParents', { 
    size, tree,
    space,
    left, right, depth,});

  Nodes.update({
    [`in.${tree}.space`]: space,
    [`in.${tree}.left`]: { $lte: left },
    [`in.${tree}.right`]: { $gte: right },
    [`in.${tree}.depth`]: { $lte: depth },
  }, {
    $inc: {
      [`in.${tree}.right`]: size,
    },
  }, { multi: true }, done);
};

export function moveNodes(
  tree,
  space,
  left0, right0, depth0,
  left1, right1, depth1,
  done,
) {
  console.log('moveNodes', { 
    tree,
    space,
    left0, right0, depth0,
    left1, right1, depth1,});
  Nodes.update({
    [`in.${tree}.space`]: space,
    [`in.${tree}.left`]: { $gte: left0 },
    [`in.${tree}.right`]: { $lte: right0 },
    [`in.${tree}.depth`]: { $gte: depth0 },
  }, {
    $inc: {
      [`in.${tree}.left`]: left1,
      [`in.${tree}.right`]: right1,
      [`in.${tree}.depth`]: depth1,
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
  console.log('nodeSet', { 
    nodeId, parentId,
    tree,
    space,
    left, right, depth,});
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
  console.log('nodesUnset', { 
    tree,
    space,
    left, right, depth,});
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
    (done) => resizeParents(+size + 1, tree, pin.space, pin.left, pin.right, pin.depth, done),
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
    (done) => resizeParents(-(size + 1), tree, nin.space, nin.left, nin.right, nin.depth - 1, done),
    (done) => moveRights(-(size + 1), tree, nin.space, nin.right, done),
  ], (error, result) => {
    if (error) throw error;
  });
};

export function nodesMove(tree, parentId, nodeId) {
  const parent = Nodes.findOne({ _id: parentId });
  if (!parent) throw new Error('parentNotFound');

  const pin = _.get(parent, `in.${tree}`);
  if (!pin) throw new Error('parentNotIntTree');

  const node = Nodes.findOne({ _id: nodeId });
  if (!node) throw new Error('nodeNotFound');

  const nin = _.get(node, `in.${tree}`);
  if (!nin) throw new Error('nodeNotInTree');
  const size = nin.right - nin.left;

  if (pin.space !== nin.space) throw new Error('notInSameSpace');
  if (pin.left >= nin.left && pin.right <= nin.right) throw new Error('cantMoveInSelf');

  series([
    (done) => resizeParents(size + 1, tree, pin.space, pin.left, pin.right, pin.depth, done),
    (done) => moveRights(size + 1, tree, pin.space, pin.right, done),
    (done) => moveNodes(
      tree, nin.space,
      nin.left, nin.right, nin.depth,
      pin.right, pin.right + size, pin.depth,
      done,
    ),
    (done) => resizeParents(size + 1, tree, nin.space, nin.left, nin.right, nin.depth - 1, done),
    (done) => moveRights(size + 1, tree, nin.space, nin.right, done),
  ], (error, result) => {
    if (error) throw error;
  });
};

export function _nodesPut(
  tree: string,
  parentId: string,
  childId: string,
) {
  const child0 = Nodes.findOne({ _id: childId });
  if (!child0) throw new Error('childNotFound');

  const cin0 = _.get(child0, `in.${tree}`);
  const size = cin0 ? (cin0.right - cin0.left) : 1;

  const parent0 = Nodes.findOne({ _id: parentId });
  if (!parent0) throw new Error('parentNotFound');

  const pin0 = _.get(parent0, `in.${tree}`);
  if (!pin0) throw new Error('parentNotInTree');

  const hashN = Random.id();
  const hashP = Random.id();

  const nin = {
    parentId,
    left: pin0.right,
    right: pin0.right + size,
    depth: pin0.depth + 1,
    hash: hashN,
  };

  const list = [];

  // current
  list.push((next) => {
    Nodes.update(child0._id, {
      $set: {
        [`in.${tree}`]: nin,
      },
    }, { multi: true }, next);
  });

  if (cin0) {
    // unparents
    list.push((next) => {
      Nodes.update({
        _id: { $ne: child0._id },
        [`in.${tree}.left`]: { $lte: cin0.left },
        [`in.${tree}.right`]: { $gte: cin0.right },
        [`in.${tree}.depth`]: { $lt: cin0.depth },
      }, {
        $inc: {
          [`in.${tree}.right`]: -(size + 1),
        },
      }, { multi: true }, next);
    });

    // unrights
    list.push((next) => {
      Nodes.update({
        _id: { $ne: child0._id },
        [`in.${tree}.left`]: { $gt: cin0.right },
      }, {
        $inc: {
          [`in.${tree}.left`]: -(size + 1),
          [`in.${tree}.right`]: -(size + 1),
        },
      }, { multi: true }, next);
    });

    // children
    list.push((next) => {
      Nodes.update({
        _id: { $ne: child0._id },
        ['in.${tree}.depth']: { $gt: cin0.depth },
        [`in.${tree}.left`]: { $gt: cin0.left },
        [`in.${tree}.right`]: { $lt: cin0.right },
      }, {
        $inc: {
          [`in.${tree}.left`]: nin.left - cin0.left,
          [`in.${tree}.right`]: nin.left - cin0.left,
          [`in.${tree}.depth`]: nin.depth - cin0.depth,
        },
        $set: {
          [`in.${tree}.hash`]: hashN,
        },
      }, { multi: true }, next);
    });
  }

  // reparents
  list.push((next) => {
    Nodes.update({
      _id: { $ne: child0._id },
      [`in.${tree}.left`]: { $lte: pin0.left },
      [`in.${tree}.right`]: { $gte: pin0.right },
    }, {
      $inc: {
        [`in.${tree}.right`]: (size + 1),
      },
    }, { multi: true }, next);
  });

  // rerights
  list.push((next) => {
    Nodes.update({
      _id: { $ne: child0._id },
      [`in.${tree}.left`]: { $gt: nin.right },
      [`in.${tree}.hash`]: { $ne: hashN },
    }, {
      $inc: {
        [`in.${tree}.left`]: (size + 1),
        [`in.${tree}.right`]: (size + 1),
      },
    }, { multi: true }, next);
  });
};

export function _nodesPull(
  tree: string,
  nodeId: string,
) {
  const node = Nodes.findOne({ _id: nodeId });
  if (!node) throw new Error('nodeNotFound');

  const nin = _.get(node, `in.${tree}`);
  if (!nin) throw new Error('nodeNotInTree');

  const size = (nin.right - nin.left);

  const list = [];

  // children
  list.push((next) => {
    Nodes.update({
      [`in.${tree}.left`]: { $gte: nin.left },
      [`in.${tree}.right`]: { $lte: nin.right },
      [`in.${tree}.depth`]: { $gte: nin.depth },
    }, {
      $unset: {
        [`in.${tree}`]: true,
      },
    }, { multi: true }, next);
  });

  // devide parents
  list.push((next) => {
    Nodes.update({
      _id: { $ne: node._id },
      [`in.${tree}.left`]: { $lt: nin.left },
      [`in.${tree}.right`]: { $gt: nin.right },
      [`in.${tree}.depth`]: { $lt: nin.depth },
    }, {
      $inc: {
        [`in.${tree}.right`]: -(size + 1),
      },
    }, { multi: true }, next);
  });

  // devide rights
  list.push((next) => {
    Nodes.update({
      _id: { $ne: node._id },
      [`in.${tree}.left`]: { $gt: nin.right },
    }, {
      $inc: {
        [`in.${tree}.left`]: -(size + 1),
        [`in.${tree}.right`]: -(size + 1),
      },
    }, { multi: true }, next);
  });

  series(list);
};