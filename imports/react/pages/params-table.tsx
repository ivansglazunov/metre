import * as React from 'react';

import { Provider as PaginationProvider } from '../components/pagination';
import { Views } from '../components/pagination/views';
import { Context as StoreContext, Provider as StoreProvider } from '../components/store/params';
import Table, { defaultStore, methods, tracker } from './components/table';

export default () => (
  <StoreProvider
    name="store"
    default={defaultStore}
  >
    <StoreContext.Consumer>
      {({ value, set }) => (
        <PaginationProvider
          methods={methods}
          tracker={tracker}

          Views={Views}

          value={value}
          set={set}
        >
          <Table/>
        </PaginationProvider>
      )}
    </StoreContext.Consumer>
  </StoreProvider>
);