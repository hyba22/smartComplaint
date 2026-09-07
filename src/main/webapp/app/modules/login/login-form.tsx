import React, { useEffect } from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { login } from 'app/shared/reducers/authentication';

import './login-form.scss';

export const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const formDefaultValues = {
    username: '',
    password: '',
    rememberMe: false,
  };

  const loginError = useAppSelector(state => state.authentication.loginError);
  const loading = useAppSelector(state => state.authentication.loading);

  const handleValidSubmit = (values: any) => {
    dispatch(login(values.username, values.password, values.rememberMe));
  };

  useEffect(() => {
    if (loginError) {
      toast.error(t('auth.loginErrorTitle') + ' ' + t('auth.loginErrorMessage'));
    }
  }, [loginError]);

  return (
    <div className="login-form-page py-12">
      <Row className="justify-content-center">
        <Col md="8" lg="7" xl="6" className="text-center">
          <h1 id="login-title" data-cy="loginTitle" className="mb-3 login-form-page__title">
            {t('auth.login')}
          </h1>
          <p className="login-form-page__subtitle">{t('auth.loginSubtitle')}</p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8" lg="7" xl="6">
          <div className="login-panel">
            <ValidatedForm id="login-form" className="login-form" onSubmit={handleValidSubmit} defaultValues={formDefaultValues}>
              <ValidatedField
                name="username"
                label={t('auth.username')}
                placeholder={t('auth.usernamePlaceholder')}
                required
                autoFocus
                data-cy="username"
                validate={{ required: t('common.fieldRequired') }}
              />
              <ValidatedField
                name="password"
                type="password"
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                required
                data-cy="password"
                validate={{ required: t('common.fieldRequired') }}
              />
              <ValidatedField name="rememberMe" type="checkbox" check label={t('auth.keepMeLoggedIn')} value={true} />
              {loginError && (
                <Alert variant="danger" className="login-form__feedback" data-cy="loginError">
                  <strong>{t('auth.loginErrorTitle')}</strong> {t('auth.loginErrorMessage')}
                </Alert>
              )}
              <div className="login-form__cta">
                <Button id="login-submit" variant="primary" type="submit" data-cy="submit" disabled={loading}>
                  {loading ? t('auth.loggingIn') : t('auth.login')}
                </Button>
              </div>
              <div className="login-form__links">
                <Alert variant="warning" className="login-form__link-alert">
                  <Link to="/account/reset/request" data-cy="forgetYourPasswordSelector" className="login-form__link">
                    {t('auth.forgotPasswordQuestion')}
                  </Link>
                </Alert>
                <Alert variant="info" className="login-form__link-alert">
                  <span>{t('auth.noAccount')}</span>{' '}
                  <Link to="/account/register" className="login-form__link">
                    {t('auth.createAccount')}
                  </Link>
                </Alert>
              </div>
            </ValidatedForm>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoginForm;
