import _ from 'lodash';

export const parseUser = ({
  _id: id = undefined,
  username = undefined,
  emails = [],
  profile: {
    firstname = '',
    lastname = '',
    secondname = '',
    phone = '',
    region = '',
  } = {},
  roles: objectRoles = undefined,
} = {}) => {
  const roles = [];
  if (objectRoles) for (let name in objectRoles) {
    let groups = objectRoles[name];
    if (groups) for (let g in groups) {
      roles.push({ name, group: groups[g] });
    }
  }
  return {
    id,
    username,
    email: _.get(emails, '0.address'),
    emails,
    firstname,
    lastname,
    secondname,
    phone,
    region,
    roles,
  };
};
