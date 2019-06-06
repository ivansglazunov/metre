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
    __nsFind(config: IFindConfig, options: any = { subscribe: false }) {
      const pss = parseDocPositions(config);
      const query = generateFindQuery(pss, { field: 'nesting', ...config, doc: this });
      if (query) {
        const cursor = collection.find(query, options)
        
        if (config.trace) {
          const docs = cursor.map(d => traceDocPositions(config, pss, query, d));

          if (config.sort) return sortDocsByPos(config, docs);
        
          return docs;
        }

        return cursor.fetch();
      } else return [];
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

export interface IFindConfig {
  /**
   * Limit and direction of find.
   * @description
   * -1/-2...
   * +1/+2...
   */
  depth: number;
  
  position?: IPosition;

  field?: string;
  doc?: any;

  positionId?: string;  

  tree?: string;
  space?: string;
  
  name?: string;

  trace?: boolean;
  sort?: boolean;
}

export interface IFounded {
  config: IFindConfig;
  positions: { base: IPosition; used: IPosition; }[];
}

export const parseDocPositions = (config: IFindConfig) => {
  const {
    depth,
    position,
    field, doc,
    positionId,
    tree, space,
    name,
  } = config;

  if (!depth) throw new Error('depth must be > or < then 0');

  let pss = [];
  if (position) pss = [position];
  else if (!doc || !field) throw new Error('position or doc and field must be defined');
  else {
    if (positionId) {
      for (let p = 0; !pss.length && p < doc[field].length; p++) {
        const ps = doc[field][p];
        if (ps._id === positionId) pss = [ps];
      }
    } else {
      for (let p = 0; p < doc[field].length; p++) {
        const ps = doc[field][p];
        if (
          (!tree || tree && ps.tree === tree) &&
          (!space || space && ps.space === space)
        ) pss.push(ps);
      }
    }
  }

  return pss;
};

export const generateFindQuery = (pss: IPosition[], config: IFindConfig) => {
  const {
    depth,
    position,
    field, doc,
    positionId,
    tree, space,
    name,
  } = config;
  if (pss.length) {
    const $or = [];
    
    for (let p = 0; p < pss.length; p++) {
      const ps = pss[p];
      const $elemMatch: any = {};
      if (name) $elemMatch.name = name;
      $elemMatch.tree = ps.tree;
      $elemMatch.space = ps.space;
      if (depth > 0) {
        $elemMatch.left = { $gt: ps.left };
        $elemMatch.right = { $lt: ps.right };
        $elemMatch.depth = { $gt: ps.depth, $lte: ps.depth + depth };
      } else {
        $elemMatch.left = { $lt: ps.left };
        $elemMatch.right = { $gt: ps.right };
        $elemMatch.depth = { $lt: ps.depth, $gte: ps.depth + depth };
      }
      $or.push({ [field]: { $elemMatch } });
    }

    return { $or };
  } else return undefined;
};

export const traceDocPositions = (config: IFindConfig, pss: IPosition[], query: any, doc: any) => {
  if (!config.field) throw new Error('field must be defined');
  const positions = [];
  for (let f = 0; f < doc[config.field].length; f++) {
    const pf = doc[config.field][f];
    for (let p = 0; p < pss.length; p++) {
      const ps = pss[p];
      if (
        (!config.name || config.name === pf.name) &&
        (ps.tree === pf.tree) &&
        (ps.space === pf.space) &&
        (config.depth > 0
          ? pf.left > ps.left && pf.right < ps.right &&
          pf.depth > ps.depth && pf.depth <= ps.depth + config.depth
          : pf.left < ps.left && pf.right > ps.right &&
          pf.depth < ps.depth && pf.depth >= ps.depth + config.depth
        )
      ) positions.push({ base: ps, used: pf });
    }
  }
  doc.___nsFoundedTrace = {
    config,
    positions,
  };
  return doc;
};

export const sortDocsByPos = (config: IFindConfig, docs: any[]) => {
  if (!config.trace) throw new Error('docs can be sorted by pos only if traced');
  const result = [];
  for (let d = 0; d < docs.length; d++) {
    const doc = docs[d];
    for (let f = 0; f < doc.___nsFoundedTrace.positions.length; f++) {
      const clone = _.clone(doc);
      clone.___nsFoundedTrace =  { ...doc.___nsFoundedTrace, positions: [doc.___nsFoundedTrace.positions[f]] };
      result.push(clone);
    }
  }
  return _.sortBy(result, r => r.___nsFoundedTrace.positions[0].used.left);
};