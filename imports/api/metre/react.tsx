import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Metre } from './metre';

export const Context = React.createContext<any>({});

export default withTracker(({ userId }: any) => {
  return {
    userId: (Metre.passportUserId && userId) || (Meteor.isServer ? undefined : Meteor.userId()),
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
