import { IFilter, IColumn } from './index';

export const toPath = (column: IColumn) => {
  if (column.type === 'formula') return `${column.value}.values.value`;
  return column.value;
};

export const toQuery = (field: string, filters: IFilter[]) => {
  const query = {};
  for (let f = 0; f < filters.length; f++) {
    const filter = filters[f];
    if (filter.type === 'string') {
      if (filter.value) {
        query[field] = { $regex: filter.value };
      }
    }
    if (filter.type === 'formula') {
      try {
        if (filter.value) {
          new RegExp(filter.value);
          query[field] = { $regex: filter.value };
        }
      } catch(error) {}
    }
    if (filter.type === 'ns' || filter.type === 'tree') {
      if (filter.value) {
        if (filter.value.left) {
          query[`${field}.left`] = { $gte: +filter.value.left };
        }
        if (filter.value.right) {
          query[`${field}.right`] = { $lte: +filter.value.right };
        }
        if (filter.value.space) {
          query[`${field}.space`] = { $regex: filter.value.space };
        }
        if (filter.value.tree) {
          query[`${field}.tree`] = { $regex: filter.value.tree };
        }
      }
    }
  }
  return query;
};
