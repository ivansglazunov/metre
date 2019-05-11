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
    if (filter.type === 'nums') {
      if (filter.value) {
        if (filter.value.name) query[`${field}.name`] = { $regex: filter.value.name };
        if (filter.value.value) query[`${field}.value`] = { $regex: filter.value.value };
      }
    }
  }
  return query;
};
