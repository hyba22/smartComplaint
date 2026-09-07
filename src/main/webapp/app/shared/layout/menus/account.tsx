import React from 'react';
import { useTranslation } from 'react-i18next';

import MenuItem from 'app/shared/layout/menus/menu-item';

import { NavDropdown } from './menu-components';

const accountMenuItemsAuthenticated = () => {
  const { t } = useTranslation();
  return (
    <>
      <MenuItem icon="wrench" to="/account/settings" data-cy="settings">
        {t('account.profile')}
      </MenuItem>
      <MenuItem icon="lock" to="/account/password" data-cy="passwordItem">
        {t('account.password')}
      </MenuItem>
      <MenuItem icon="sign-out-alt" to="/logout" data-cy="logout">
        {t('account.logout')}
      </MenuItem>
    </>
  );
};

const accountMenuItems = () => {
  const { t } = useTranslation();
  return (
    <>
      <MenuItem id="login-item" icon="sign-in-alt" to="/login" data-cy="login">
        {t('header.login')}
      </MenuItem>
      <MenuItem icon="user-plus" to="/account/register" data-cy="register">
        {t('header.register')}
      </MenuItem>
    </>
  );
};

export const AccountMenu = ({ isAuthenticated = false }) => {
  const { t } = useTranslation();
  return (
    <NavDropdown icon="user" name={t('header.account')} id="account-menu" data-cy="accountMenu">
      {isAuthenticated && accountMenuItemsAuthenticated()}
      {!isAuthenticated && accountMenuItems()}
    </NavDropdown>
  );
};
