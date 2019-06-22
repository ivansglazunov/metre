import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Metre } from './metre';

export const Context = React.createContext<any>({});

export function useMetre(deps?: any[]) {
  return useContext(Context);
}

export default withTracker(({ userId }: any) => {
  return {
    userId: Meteor.isServer ? userId : (Meteor.userId() || Metre.userId),
  };
})(({
  userId,
  children,
}) => {
  return <Context.Provider value={{
    userId,
  }}>
    {children}
  </Context.Provider>;
});
