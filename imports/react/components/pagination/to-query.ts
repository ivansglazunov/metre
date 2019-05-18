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
    if (filter.type === 'formula') {
      try {
        if (filter.value) {
          new RegExp(filter.value);
          query[field] = { $regex: filter.value };
        }
      } catch(error) {}
    }
  }
  return query;
};
