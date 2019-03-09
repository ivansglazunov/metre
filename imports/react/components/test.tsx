import * as React from 'react';

export const Test = ({
  open,
  toggle,
  user,
  create,
  login,
  logout,
  random,
}) => {
  return <div>
    <button onClick={toggle}>{open ? 'hide' : 'show'}</button>
    {open && <React.Fragment>
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
    </React.Fragment>}
  </div>;
};
