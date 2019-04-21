import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import chai from 'chai';
import _ from 'lodash';

export interface IDoc {
  _id: string;
  [key: string]: any;
}

export interface IPosition {
  _id: string;
  parentId?: string;
  tree: string;
  space: string;
  left: number;
  right: number;
  depth: number;
  last?: boolean;
}

export interface IPutOptions {
  tree: string;
  docId: string;
  parentId: string|null;
  space?: string;
}

export interface IPullOptions {
  positionId?: string;
  docId?: string;
  parentId?: string;
}

export interface IDocPositions extends IDoc {
  positions: IPosition[];
}

/**
 * @example
 * const ns = new NestedSets();
 * ns.init({
 *   collection: Meteor.nodes,
 *   field: 'positions', // default
 * });
 */
export class NestedSets<Doc extends IDocPositions> {
  public c;
  public rc;
  public field: string;
  public client;
  public session;

  init({
    collection,
    field = 'positions',
  }: {
    collection: Mongo.Collection<any>;
    field?: string,
  }) {
    this.c = collection;
    this.field = field;
    if (Meteor.isServer) {
      this.rc = this.c.rawCollection();
      // @ts-ignore
      this.client = this.c._driver.mongo.client;
      this.session = this.client.startSession();
    }
  }

  getAnyPositionsByTree(doc: Doc, tree: string) {
    if (doc && doc[this.field]) {
      const pss = [];
      for (let d = 0; d < doc[this.field].length; d++) {
        const ps = doc[this.field][d];
        if (ps.tree === tree) pss.push(ps);
      }
      return pss;
    }
    return [];
  }

  getPositionsByTreeIn(doc: Doc, tree: string, space: string, left: number, right: number) {
    const pss = [];
    if (doc && doc[this.field]) {
      for (let d = 0; d < doc[this.field].length; d++) {
        const ps = doc[this.field][d];
        if (ps.tree === tree && ps.space === space && ps.left >= left && ps.right <= right) pss.push(ps);
      }
    }
    return pss;
  }

  getPositionByPositionId(doc: Doc, id: string) {
    if (doc && doc[this.field]) {
      for (let d = 0; d < doc[this.field].length; d++) {
        const ps = doc[this.field][d];
        if (ps._id === id) return ps;
      }
    }
  }

  getPositionsByParentId(doc: Doc, parentId: string) {
    const pss = [];
    if (doc && doc[this.field]) {
      for (let d = 0; d < doc[this.field].length; d++) {
        const ps = doc[this.field][d];
        if (ps.parentId === parentId) pss.push(ps);
      }
    }
    return pss;
  }

  getSizeFromPositions(positions: IPosition[]): number {
    if (positions && positions.length) {
      return positions[0].right - positions[0].left;
    }
    return 1;
  }
  
  async move(tree, space, from, size) {
    const { field, rc, session } = this;
    await rc.update(
      {
        [field]: {
          $elemMatch: {
            tree,
            space,
            left: { $gte: from },
          },
        },
      },
      {
        $inc: {
          [`${field}.$[pos].left`]: size,
          [`${field}.$[pos].right`]: size,
        },
      },
      {
        session,
        multi: true,
        arrayFilters: [{
          'pos.tree': tree,
          'pos.space': space,
          'pos.left': { $gte: from },
        }],
      }
    );
  }
  
  async resize(tree, space, left, right, size) {
    const { field, rc, session } = this;
    await rc.update(
      {
        [field]: {
          $elemMatch: {
            tree,
            space,
            left: { $lte: left },
            right: { $gte: right },
          },
        },
      },
      {
        $inc: {
          [`${field}.$[pos].right`]: size,
        },
      },
      {
        session,
        multi: true,
        arrayFilters: [{
          'pos.tree': tree,
          'pos.space': space,
          'pos.left': { $lte: left },
          'pos.right': { $gte: right },
        }],
      }
    );
  }

  async unlast(tree, space) {
    const { field, rc, c, session } = this;
    await rc.update(
      {
        [field]: {
          $elemMatch: {
            tree,
            space,
            last: true,
          },
        },
      },
      {
        $unset: {
          [`${field}.$[pos].last`]: true,
        },
      },
      {
        multi: true,
        arrayFilters: [{
          'pos.tree': tree,
          'pos.space': space,
          'pos.last': true,
        }],
        session,
      }
    );
  }

  getLastInSpace(tree, space) {
    const { c, field } = this;

    const d = c.findOne({
      [field]: {
        $elemMatch: {
          tree, space,
          last: true
        },
      }
    });
    if (d) {
      const dps = d.positions;
      for (let p = 0; p < dps.length; p++) {
        const dp = dps[p];
        if (dp.tree === tree && dp.space === space && dp.last) return { d, dp };
      }
    }
    return;
  }

  regetPos(docId, posId) {
    const { c, field } = this;

    const doc = c.findOne(docId);
    const dPs = doc[field];
    for (let dPi = 0; dPi < dPs.length; dPi++) {
      if (dPs[dPi]._id === posId) return dPs[dPi];
    }
  }

  getChs(tree, dP) {
    const { c, field } = this;
    return c.find({
      [field]: {
        $elemMatch: {
          tree: tree,
          space: dP.space,
          left: { $gt: dP.left },
          right: { $lt: dP.right },
        },
      },
    }).fetch();
  }

  async _push(chId, chP) {
    const { rc, session, field } = this;

    await rc.update(
      { _id: chId },
      {
        $push: {
          [field]: chP,
        },
      },
      { session },
    );
  }

  async put(options: IPutOptions) {
    try {
      // ====================
      // INPUT VARS
      chai.assert.isObject(options);
      const { c, rc, field, session } = this;
      const {
        tree, docId, parentId,
        space: maybeSpace,
      } = options;
      chai.assert.isString(docId, 'Option docId must be a string.');

      // ====================
      // LOCAL VARS

      // ====================
      // d - document
      const d = c.findOne(docId);
      chai.assert.exists(d, `Doc by docId ${docId} option not founded.`);
      
      const dPs = this.getAnyPositionsByTree(d, tree); // positions
      const dS = this.getSizeFromPositions(dPs); // size
      const dHasPosition = !!dPs.length;
      const dHasChildren = dS > 1;

      // ====================
      // p - parent
      let p, pPs;
      if (!_.isNull(parentId)) {
        chai.assert.isString(parentId, 'Option parentId must be a string or null.');
        p = c.findOne(parentId);
        chai.assert.exists(p, 'Parent not found');
        pPs = this.getAnyPositionsByTree(p, tree);
        chai.assert.isNotEmpty(pPs, 'Cant put into doc which not in tree.');
        chai.assert.isNotOk(maybeSpace, 'Cant put into doc and in custom space at same time.');
      }
      const _pPs = pPs && pPs.length;

      for (let pPi = 0; ((_pPs && pPi < pPs.length) || (!_pPs && !pPi)); pPi++) {
        const pP = pPs && pPs.length ? this.regetPos(p._id, pPs[pPi]._id) : undefined;

        await this.session.startTransaction();

        // ====================
        // RESULT D POS
        const space = pP ? pP.space : maybeSpace || Random.id();
  
        const lastDoc = this.getLastInSpace(tree, space);
        const newCoord = lastDoc ? lastDoc.dp.right + 1 : 0;
  
        const left = pP ? pP.right : newCoord;
        const right = pP ? pP.right + dS : newCoord + dS;
        const depth = pP ? pP.depth + 1 : 0;
        const last = !parentId;

        if (dHasPosition) {
          if (dHasChildren) {
            // +dPs+chPs
            // for (let dPi = 0; dPi < dPs.length; dPi++) {
            const dP = dPs[0];
            await this.move(tree, space, left, +dS+1);
            if (parentId) await this.resize(tree, space, pP.left, pP.right, +dS+1);
            const chs = this.getChs(tree, dP);
            for (let c = 0; c < chs.length; c++) {
              const ch = chs[c];
              const chPs = this.getPositionsByTreeIn(ch, tree, dP.space, dP.left, dP.right);

              chai.assert.isNotEmpty(chPs, `Unexpected child positions not founded by ${JSON.stringify({ ch, tree, space: dP.space, left: dP.left, right: dP.right })}`);

              for (let chPi = 0; chPi < chPs.length; chPi++) {
                const chP = chPs[chPi];
                const chL = chP.left - dP.left;
                const chS = chP.right - chP.left;
                const chD = chP.depth - dP.depth;

                await this._push(ch._id, {
                  _id: Random.id(),
                  parentId: chP.parentId,
                  tree, space,
                  left: chL + left,
                  right: chL + left + chS,
                  depth: chD + depth,
                });
              }
            }
            if (!parentId) await this.unlast(tree, space);

            await this._push(d._id, {
              _id: Random.id(),
              parentId, tree, space, left, right, depth, last,
            });
            // }
          } else {
            // +dPs-chPs
            await this.move(tree, space, left, +dS+1);
            if (parentId) await this.resize(tree, space, pP.left, pP.right, +dS+1);
            if (!parentId) await this.unlast(tree, space);
            await this._push(docId, {
              _id: Random.id(),
              parentId, tree, space, left, right, depth, last,
            });
          }
        } else {
          // -dPs-chPs
          await this.move(tree, space, left, +dS+1);
          if (parentId) await this.resize(tree, space, pP.left, pP.right, +dS+1);
          if (!parentId) await this.unlast(tree, space);
          await this._push(docId, {
            _id: Random.id(),
            parentId, tree, space, left, right, depth, last,
          });
        }
        await this.session.commitTransaction();
      }
    } catch(error) {
      await this.session.abortTransaction();
      throw error;
    }
  }

  async _pull(tree, space, gteLeft, lteRight, gteDepth) {
    const { rc, session, field } = this;

    await rc.update(
      {
        [field]: {
          $elemMatch: {
            tree, space,
            left: { $gte: gteLeft },
            right: { $lte: lteRight },
            depth: { $gte: gteDepth },
          },
        }
      },
      {
        $pull: {
          [field]: {
            tree, space,
            left: { $gte: gteLeft },
            right: { $lte: lteRight },
            depth: { $gte: gteDepth },
          },
        },
      },
      { multi: true, session },
    );
  }

  async pull(options: IPullOptions) {
    const {
      c, field,
    } = this;

    chai.assert.isObject(options);

    const { positionId, docId, parentId } = options;
    chai.assert.isString(positionId);

    let d, dPs;
    if (positionId) {
      d = c.findOne({
        [field]: { $elemMatch: { _id: positionId } },
      });
      chai.assert.exists(d, `Doc is not founded.`);
      const tdP = this.getPositionByPositionId(d, positionId);
      chai.assert.exists(tdP, `Doc position is not founded.`);
      dPs = this.getPositionsByParentId(d, tdP.parentId);
      chai.assert.isNotEmpty(dPs, `Positions in parentId ${tdP.parentId} of doc not founded`);
    } else if (docId && parentId) {
      d = c.findOne(docId);
      chai.assert.exists(d, `Doc is not founded.`);
      dPs = this.getPositionsByParentId(d, parentId);
      chai.assert.isNotEmpty(dPs, `Positions in parentId ${parentId} of doc not founded`);
    }
    
    for (let dPi = 0; dPi < dPs.length; dPi++) {
      await this.session.startTransaction();
      
      const dP = this.regetPos(d._id, dPs[dPi]._id);
      await this._pull(dP.tree, dP.space, dP.left, dP.right, dP.depth);
      await this.move(dP.tree, dP.space, dP.left, -((dP.right - dP.left) + 1));
      if (dP.parentId) await this.resize(dP.tree, dP.space, dP.left, dP.right, -((dP.right - dP.left) + 1));
      
      await this.session.commitTransaction();
    }
  }
}
