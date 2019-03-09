import * as React from 'react';

export const Test = ({
  user,
  create,
  login,
  logout,
  random,
}) => {
  return <div>
    {
      user
      ? <React.Fragment>
        <button onClick={logout}>logout</button>
        <button onClick={random}>random</button>
      </React.Fragment>
      : <React.Fragment>
        <button onClick={create}>create</button>
        <button onClick={login}>login</button>
      </React.Fragment>
    }
    <div>
      {JSON.stringify(user)}
    </div>
  </div>;
};
