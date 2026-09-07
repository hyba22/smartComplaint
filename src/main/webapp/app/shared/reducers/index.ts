import { ReducersMapObject } from '@reduxjs/toolkit';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

import entitiesReducers from 'app/entities/reducers';
import activate from 'app/modules/account/activate/activate.reducer';
import password from 'app/modules/account/password/password.reducer';
import passwordReset from 'app/modules/account/password-reset/password-reset.reducer';
import register from 'app/modules/account/register/register.reducer';
import settings from 'app/modules/account/settings/settings.reducer';
import administration from 'app/modules/administration/administration.reducer';
import userManagement from 'app/modules/administration/user-management/user-management.reducer';

import applicationProfile from './application-profile';
import authentication from './authentication';
import notification from './notification';

const rootReducer: ReducersMapObject = {
  authentication,
  applicationProfile,
  administration,
  userManagement,
  register,
  activate,
  passwordReset,
  password,
  settings,
  notification,
  loadingBar,
  ...entitiesReducers,
};

export default rootReducer;
