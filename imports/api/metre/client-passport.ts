import axios from 'axios';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import * as React from 'react';

import { Metre } from './metre';

Metre.clientPasswordHash = (password: string) => Accounts._hashPassword(password).digest;

Metre._loginWidthUsernameAndPasswordPassport = async (username, password) => {
  const response = await axios.post(`/passport/loginWidthUsernameAndPassword?username=${username}&password=${Metre.clientPasswordHash(password)}`);
  if (response && response.data) return response.data;
};

Metre.loginWidthUsernameAndPassword = async (username, password) => {
  const { userId, meteorToken } = await Metre._loginWidthUsernameAndPasswordPassport(username, password);
  if (meteorToken) Meteor.loginWithToken(meteorToken.token);
  return userId;
};

Metre.logout = async() => {
  await axios.post(`/passport/logout`);
  Meteor.logout();
};

Metre.initClient = async (userId) => {
  Metre.saveUserId(userId);
  if (!userId && Meteor.userId()) {
    const loginToken = localStorage.getItem('Meteor.loginToken');
    Metre._passportLoginWithMeteorToken(loginToken);
  }
};

Metre.saveUserId = (userId) => {
  Metre.passportUserId = userId;
};

Metre._passportLoginWithMeteorToken = async (token) => {
  const response = await axios.post(`/passport/meteorToken?token=${token}`);
  if (response && response.data && response.data.userId) {
    Metre.saveUserId(response.data.userId);
  }
};

Metre.passportUserId = undefined;

Accounts.onLogin(() => {
  Metre.saveUserId(Meteor.userId());
});
