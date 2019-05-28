import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import SimpleSchema from 'simpl-schema';
import * as _ from 'lodash';

import { wrapCollection } from '../../collection';
import { TPositions, NestedSets } from '../../nested-sets';
import { IPosition } from '../../nested-sets/index';
import { mathEval } from '../../math';

export const nsInit = ({
  collection,
  field,
}) => {
  const ns = new NestedSets();
  ns.init({
    collection,
    field,
  });

  return {
    ns,
  };
};

export const nsHelpers = ({
  collection,
  ns,
}) => {
  collection.helpers({
    /**
     * @description
     * get one parent by name, and optional tree, or by ___nsUsedFromParentPosition
     */
    __nsParent({ name, tree, options = { subscribe: false } }: { name: string, tree?: string, options?: any }) {
      const parentIds = [];
      if (typeof(name) === 'string') {
        if (this[ns.field]) {
          for (let p = 0; p < this[ns.field].length; p++) {
            const position = this[ns.field][p];
            if (typeof(tree) === 'string') {
              if (position.tree !== tree) continue;
            }
            parentIds.push(position.parentId);
          }
        }
      } else {
        if (this.___nsUsedFromParentPosition) {
          parentIds.push(this.___nsUsedFromParentPosition.parentId);
        }
      }
      const $elemMatch: any = { name };
      if (typeof(tree) === 'string') $elemMatch.tree = tree;

      if (parentIds.length) {
        return collection.findOne({
          _id: { $in: parentIds },
          [ns.field]: { $elemMatch },
        }, options);
      }
    },

    /**
     * @description
     * get all parent positions by name
     */
    __nsParents({ tree, options = { subscribe: false } }: { tree?: string, options?: any } = {}) {
      const positions = [];
      if (this[ns.field]) {
        for (let p = 0; p < this[ns.field].length; p++) {
          const position = this[ns.field][p];
          if (typeof(tree) === 'string') {
            if (position.tree !== tree) continue;
          }
          positions.push(position);
        }
      }

      return positions.map(p => {
        const d = collection.findOne(p.parentId, options);
        d.___nsUsedFromChildPosition = p;
        return d;
      });
    },

    /**
     * @description
     * get child by name and optional tree
     */
    __nsChild({ name, tree = this.___nsUsedFromParentPosition && this.___nsUsedFromParentPosition.tree, options = { subscribe: false } }: { name: string, tree?: string, options?: any }) {
      if (typeof(name) != 'string') return null;
      return collection.findOne({
        [`${ns.field}.parentId`]: this._id,
        [`${ns.field}.name`]: name,
        [`${ns.field}.tree`]: { $in: tree
          ? [tree]
          : this[ns.field].map(p => p.tree),
        },
      }, { subscribe: false });
    },
    __nsChildren({ tree, space, options = { subscribe: false } }: { tree?: string; space?: string; options?: any } = {}): any[] {
      const $or = [];
      if (this[ns.field]) for (let p = 0; p < this[ns.field].length; p++) {
        const pos = this[ns.field][p];
        if (
          (typeof(tree) === 'string' && tree === pos.tree) || (typeof(tree) !== 'string')
          &&
          (typeof(space) === 'string' && space === pos.space) || (typeof(space) !== 'string')
        ) {
          const $elemMatch: any = {};
          if ((typeof(tree) === 'string' && tree === pos.tree)) {
            $elemMatch.tree = tree;
          }
          if ((typeof(space) === 'string' && space === pos.space)) {
            $elemMatch.space = space;
          }
          $elemMatch.left = { $gt: pos.left };
          $elemMatch.right = { $lt: pos.right };
          $or.push({ [ns.field]: { $elemMatch } });
        }
      }
      return collection.find($or.length ? { $or } : { _id: { $exists: false } }, options).fetch();
    },
    __nsPositions({ tree, space, root, options }: { tree?: string; space?: string; root?: IPosition; options?: any; } = {}): any[] {
      const nodes = this.__nsChildren({ tree, space, options });
      let results = [];
      for (let n = 0; n < nodes.length; n++) {
        const node = nodes[n];
        for (let p = 0; p < node[ns.field].length; p++) {
          const doc = collection.findOne(node._id, { subscribe: false });
          const position = doc[ns.field][p];
          if (
            (typeof(tree) === 'string' && tree === position.tree) || (typeof(tree) !== 'string')
            &&
            (typeof(space) === 'string' && space === position.space) || (typeof(space) !== 'string')
          ) {
            doc.___nsUsedFromParentPosition = position;
            if (root) doc.___nsRootUserPosition = root;
            results.push(doc);
          }
        }
      }
      results = _.sortBy(results, n => n.___nsUsedFromParentPosition.left);
      return results;
    },
  });
};


const Schemas: any = {};
  
Schemas.Put = new SimpleSchema({
  tree: String,
  docId: String,
  parentId: {
    type: String,
    optional: true,
  },
  space: {
    type: String,
    optional: true,
  },
});

Schemas.Pull = new SimpleSchema({
  positionId: {
    type: String,
    optional: true,
  },
  docId: {
    type: String,
    optional: true,
  },
  parentId: {
    type: String,
    optional: true,
  },
  tree: {
    type: String,
    optional: true,
  },
});

Schemas.Name = new SimpleSchema({
  positionId: {
    type: String,
    optional: true,
  },
  parentId: {
    type: String,
    optional: true,
  },
  tree: {
    type: String,
    optional: true,
  },
  docId: {
    type: String,
  },
  name: {
    type: String,
  }
});

Schemas.Move = new SimpleSchema({
  put: Schemas.Put,
  pull: Schemas.Pull,
  name: Schemas.Name,
});

export const nsMethods = ({
  collection,
  ns,
}) => {
  Meteor.methods({
    [`${collection._name}.ns.${ns.field}.name`](options) {
      Schemas.Name.validate(options);
      ns.name(options);
    },
    async [`${collection._name}.ns.${ns.field}.put`](options) {
      Schemas.Put.validate(options);
      await ns.put(options);
    },
    async [`${collection._name}.ns.${ns.field}.pull`](options) {
      Schemas.Pull.validate(options);
      await ns.pull(options);
    },
    async [`${collection._name}.ns.${ns.field}.move`](options) {
      Schemas.Move.validate(options);
      await ns.put(options.put);
      await ns.pull(options.pull);
    },
  });
};
