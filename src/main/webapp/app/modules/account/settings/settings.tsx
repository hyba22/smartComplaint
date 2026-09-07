import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { useLocation } from 'react-router';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getSession } from 'app/shared/reducers/authentication';
import Sidebar from 'app/shared/layout/sidebar/client-sidebar';
import AdminSidebar from 'app/shared/layout/sidebar/sidebar';
import ConseillerSidebar from 'app/shared/layout/sidebar/conseiller-sidebar';

import { changePassword, reset, saveAccountSettings } from './settings.reducer';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const account = useAppSelector(state => state.authentication.account);
  const successMessage = useAppSelector(state => state.settings.successMessage);
  const errorMessage = useAppSelector(state => state.settings.errorMessage);
  const loading = useAppSelector(state => state.settings.loading);
  const location = useLocation();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    dispatch(getSession());
    return () => {
      dispatch(reset());
    };
  }, []);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  const handleValidSubmit = values => {
    dispatch(
      saveAccountSettings({
        ...account,
        ...values,
      }),
    );
  };

  const handlePasswordChange = e => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t('account.passwordMismatch'));
      return;
    }
    if (passwords.newPassword.length < 4) {
      toast.error(t('account.passwordMinLength'));
      return;
    }
    dispatch(
      changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    );
  };

  const getSidebar = () => {
    if (location.pathname.startsWith('/client')) {
      return <Sidebar />;
    } else if (location.pathname.startsWith('/admin')) {
      return <AdminSidebar />;
    } else if (location.pathname.startsWith('/conseiller')) {
      return <ConseillerSidebar />;
    }
    return null;
  };

  const sidebar = getSidebar();

  const settingsContent = (
    <div className="pt-6" style={{ width: '55%', margin: '0 auto' }}>
      <h1 id="settings-title" className="mb-4">
        {t('account.settings')}
      </h1>

      <ValidatedForm id="settings-form" onSubmit={handleValidSubmit} defaultValues={account}>
        <ValidatedField
          name="firstName"
          label={t('account.firstName')}
          id="firstName"
          placeholder={t('account.firstNamePlaceholder')}
          validate={{
            required: { value: true, message: t('common.required') },
            minLength: { value: 1, message: t('common.minLength', { min: 1 }) },
            maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
          }}
          data-cy="firstname"
        />
        <ValidatedField
          name="lastName"
          label={t('account.lastName')}
          id="lastName"
          placeholder={t('account.lastNamePlaceholder')}
          validate={{
            required: { value: true, message: t('common.required') },
            minLength: { value: 1, message: t('common.minLength', { min: 1 }) },
            maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
          }}
          data-cy="lastname"
        />
        <ValidatedField
          name="email"
          label={t('account.email')}
          placeholder={t('account.emailPlaceholder')}
          type="email"
          validate={{
            required: { value: true, message: t('common.required') },
            minLength: { value: 5, message: t('common.minLength', { min: 5 }) },
            maxLength: { value: 254, message: t('common.maxLength', { max: 254 }) },
            validate: v => isEmail(v) || t('common.invalidEmail'),
          }}
          data-cy="email"
        />
        <Button variant="primary" type="submit" data-cy="submit">
          {t('account.saveSettings')}
        </Button>
      </ValidatedForm>

      <hr className="my-4" />

      <div className="mt-4">
        <Button variant="outline-primary" onClick={() => setShowPasswordForm(!showPasswordForm)}>
          {showPasswordForm ? t('account.cancelPasswordChange') : t('account.changePassword')}
        </Button>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="mt-4">
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                {t('account.currentPassword')}
              </label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                value={passwords.currentPassword}
                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                {t('account.newPassword')}
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
                minLength={4}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                {t('account.confirmNewPassword')}
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
                minLength={4}
              />
            </div>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? t('account.changing') : t('account.changePassword')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );

  if (sidebar) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        {sidebar}
        <main className="flex-1 ml-[280px] p-6 flex justify-center">{settingsContent}</main>
      </div>
    );
  }

  return settingsContent;
};

export default SettingsPage;
