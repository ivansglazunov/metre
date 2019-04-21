import { Random } from 'meteor/random';

import 'mocha';
import { assert } from 'chai';

import { resetDatabase } from 'meteor/xolvio:cleaner';

import { NestedSets } from '../';
import { Nodes } from '../../collections';

const toIds = (docs) => docs.map(d => d._id);

const draw = (name, docs) => {
  console.log(name);
  docs.forEach(({
    _id,
    positions,
  }) => console.log(`${_id.slice(0, 4)} ${positions && positions.map(({
    space, parentId, left, right, depth
  }) => `[P:(${parentId && parentId.slice(0, 4)})S:(${space.slice(0, 4)})${left}|${right}{${depth}}(${right - left})]`).join(' ')}`));
}

const assertP = (ns, tree, docId) => {
  const doc = Nodes.findOne(docId);
  assert.isOk(doc);

  const docPs = ns.getAnyPositionsByTree(doc, tree);
  const docS = ns.getSizeFromPositions(docPs);

  const chsByParentId = Nodes.find({
    [`${ns.field}.parentId`]: docId,
  }).fetch();

  const chsByCoords = Nodes.find({
    [ns.field]: {
      $elemMatch: {
        tree,
        $or: docPs.map(({
          tree, space, left, right, depth
        }) => ({
          tree,
          space,
          left: { $gt: left },
          right: { $lt: right },
          depth: depth + 1,
        })),
      },
    },
  }).fetch();

  // children by parents and coords equal
  assert.deepEqual(toIds(chsByParentId), toIds(chsByCoords));

  // for each parent pos, must have one child pos
  for (let dp = 0; dp < docPs.length; dp++) {
    const docP = docPs[dp];
    assert.equal(docP.right - docP.left, docS);
    let chS = 0;
    for (let c = 0; c < chsByParentId.length; c++) {
      const ch = chsByParentId[c];
      let founded = false;
      for (let cp = 0; cp < ch.positions.length; cp++) {
        const chP = ch.positions[cp];
        if (chP.space === docP.space && chP.left > docP.left && chP.right < docP.right && chP.depth > docP.depth) {
          assert.isFalse(founded);
          chS += (chP.right - chP.left) + 1;
          founded = true;
        }
      }
      assert.isTrue(founded);
    }
    assert.equal(docS, chS + 1 || 1);
  }

  for (let c = 0; c < chsByParentId.length; c++) {
    const ch = chsByParentId[c];
    assertP(ns, tree, ch._id);
  }
};

// p parent
// dPs document positions
// chPs children positions
// lPs left positions
// rPs right positions
describe('nested-sets', () => {
  beforeEach(() => {
    resetDatabase();
  });
  const ns = new NestedSets();
  ns.init({
    collection: Nodes,
    field: 'positions',
  });
  const tree = 'nesting';
  const put = async (tree, parentId, handler?) => {
    const docId = Nodes.insert({});
    await ns.put({ tree, docId, parentId, });
    if (handler) await handler(docId);
    return docId;
  };
  describe('put', () => {
    it('-p-dPs-chPs-lPs-rPs', async () => {
      const docId = Nodes.insert({});
      await ns.put({ tree, docId, parentId: null, });
      const docs = Nodes.find({}).fetch();
      assert.lengthOf(docs, 1);
      assert.lengthOf(docs[0].positions, 1);
      assertP(ns, tree, docId);
    });
    it('-p-dPs-chPs+lPs-rPs', async () => {
      const space = Random.id();
      const docIdL = Nodes.insert({});
      const docId = Nodes.insert({});
      await ns.put({ tree, docId: docIdL, parentId: null, space,
      });
      await ns.put({ tree, docId, parentId: null, space,
      });
      const docs = Nodes.find({}).fetch();
      assert.lengthOf(docs, 2);
      assert.lengthOf(docs[0].positions, 1);
      assert.deepEqual(
        docs[0].positions[0],
        {
          _id: docs[0].positions[0]._id,
          parentId: null,
          tree,
          space,
          left: 0,
          right: 1,
          depth: 0,
        },
      );
      assert.deepEqual(
        docs[1].positions[0],
        {
          _id: docs[1].positions[0]._id,
          parentId: null,
          tree,
          space,
          left: 2,
          right: 3,
          depth: 0,
          last: true,
        },
      );
      assert.lengthOf(docs[1].positions, 1);
      assertP(ns, tree, docId);
    });
    it('-p+dPs-chPs-lPs-rPs', async () => {
      const docId = Nodes.insert({});
      await ns.put({ tree, docId, parentId: null, });
      await ns.put({ tree, docId, parentId: null, });
      const docs = Nodes.find({}).fetch();
      assert.lengthOf(docs, 1);
      assert.lengthOf(docs[0].positions, 2);
      assert.deepEqual(
        docs[0].positions[0],
        {
          _id: docs[0].positions[0]._id,
          parentId: null,
          tree,
          space: docs[0].positions[0].space,
          left: 0,
          right: 1,
          depth: 0,
          last: true,
        },
      );
      assert.deepEqual(
        docs[0].positions[1],
        {
          _id: docs[0].positions[1]._id,
          parentId: null,
          tree,
          space: docs[0].positions[1].space,
          left: 0,
          right: 1,
          depth: 0,
          last: true,
        },
      );
      assertP(ns, tree, docId);
    });
    it('+p-dPs-chPs-lPs-rPs', async () => {
      const parentId = Nodes.insert({});
      const docId = Nodes.insert({});
      await ns.put({ tree, docId: parentId, parentId: null, });
      await ns.put({ tree, docId, parentId, });
      const docs = Nodes.find({}).fetch();
      assert.lengthOf(docs, 2);
      assert.lengthOf(docs[0].positions, 1);
      assert.lengthOf(docs[1].positions, 1);
      assertP(ns, tree, parentId);
    });
    it('-p+dPs+chPs-lPs-rPs', async () => {
      const parentId = Nodes.insert({});
      const docId = Nodes.insert({});
      await ns.put({ tree, docId: parentId, parentId: null, });
      await ns.put({ tree, docId, parentId, });
        await ns.put({ tree, docId: parentId, parentId: null, });
      const docs = Nodes.find({}).fetch();
      assert.lengthOf(docs, 2);
      assert.lengthOf(docs[0].positions, 2);
      assert.lengthOf(docs[1].positions, 2);
      assertP(ns, tree, parentId);
    });
    it('+p+dPs-chPs-lPs-rPs', async () => {
      const rootId = Nodes.insert({});
      const parentId = Nodes.insert({});
      await ns.put({ tree, docId: rootId, parentId: null, });
      await ns.put({ tree, docId: parentId, parentId: null, });
      await ns.put({ tree, docId: parentId, parentId: rootId, });
      const docs = Nodes.find({}).fetch();
      assert.lengthOf(docs, 2);
      assertP(ns, tree, parentId);
    });
    it('+p+dPs+chPs-lPs-rPs', async () => {
      const rootId = Nodes.insert({});
      const parentId = Nodes.insert({});
      const docId = Nodes.insert({});
      await ns.put({ tree, docId: rootId, parentId: null, });
      await ns.put({ tree, docId: parentId, parentId: null, });
      await ns.put({ tree, docId, parentId, });
      await ns.put({ tree, docId: parentId, parentId: rootId, });
      const docs = Nodes.find({}).fetch();
      assert.lengthOf(docs, 3);
      assertP(ns, tree, parentId);
    });
    it('+p+dPs+chPs+lPs+rPs', async () => {
      let rootId, middleId;
      rootId = await put(tree, null, async (parentId) => {
        await put(tree, parentId, async (parentId) => {
          await put(tree, parentId, async (parentId) => {});
        });
        middleId = await put(tree, parentId, async (parentId) => {
        });
        await put(tree, parentId, async (parentId) => {
          await put(tree, parentId, async (parentId) => {});
        });
      });
      await put(tree, middleId);
      const docs = Nodes.find({}).fetch();  
      assertP(ns, tree, rootId);
    });
    it('+p2(1space)+dPs+chPs-lPs-rPs', async () => {
      const rootId = await put(tree, null);
      const p0 = await put(tree, rootId);
      const c0 = await put(tree, p0);
      const c1 = await put(tree, c0);
      const p1 = await put(tree, rootId);
      await ns.put({ tree, docId: c0, parentId: p1, });
      const docs = Nodes.find({}).fetch();
      assertP(ns, tree, rootId);
    });
    it('+p2(1space)+dPs-chPs-lPs-rPs', async () => {
      const rootId = await put(tree, null);
      const p0 = await put(tree, rootId);
      const c0 = await put(tree, p0);
      const p1 = await put(tree, rootId);
      await ns.put({ tree, docId: c0, parentId: p1, });
      const docs = Nodes.find({}).fetch();
      assertP(ns, tree, rootId);
    });
    it('+p2(2space)+dPs+chPs-lPs-rPs', async () => {
      const p0 = await put(tree, null);
      const c0 = await put(tree, p0);
      const c1 = await put(tree, c0);
      const p1 = await put(tree, null);
      await ns.put({ tree, docId: c0, parentId: p1, });
      const docs = Nodes.find({}).fetch();
      assertP(ns, tree, p0);
      assertP(ns, tree, p1);
    });
    it('+p2(2space)+dPs-chPs-lPs-rPs', async () => {
      const p0 = await put(tree, null);
      const c0 = await put(tree, p0);
      const p1 = await put(tree, null);
      await ns.put({ tree, docId: c0, parentId: p1, });
      const docs = Nodes.find({}).fetch();
      assertP(ns, tree, p0);
      assertP(ns, tree, p1);
    });
  });
});
