import { IFilter } from './index';

export const toQuery = (field: string, filters: IFilter) => {
  const query = {};
  for (let f = 0; f < filters.length; f++) {
    const filter = filters[f];
    if (filter.type === 'string') {
      if (filter.value) {
        query[field] = { $regex: filter.value };
      }
    }
    if (filter.type === 'values') {
      if (filter.value) {
        query[`${field}.values.value`] = { $regex: filter.value };
      }
    }
  }
  return query;
};
