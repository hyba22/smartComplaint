import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';

import { handleRegister, reset } from './register.reducer';
import './register-form.scss';

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  password: string;
  confirmPassword: string;
  address?: string;
};

export const RegisterForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const formDefaultValues = useMemo(
    () => ({
      firstName: '',
      lastName: '',
      email: '',
      login: '',
      password: '',
      confirmPassword: '',
      address: '',
    }),
    [],
  );

  useEffect(
    () => () => {
      dispatch(reset());
    },
    [dispatch],
  );

  const errorMessage = useAppSelector(state => state.register.errorMessage);
  const loading = useAppSelector(state => state.register.loading);
  const successMessage = useAppSelector(state => state.register.successMessage);

  useEffect(() => {
    setPassword(formDefaultValues.password);
    setLogin(formDefaultValues.login);
    setEmail(formDefaultValues.email);
    setFirstName(formDefaultValues.firstName);
    setLastName(formDefaultValues.lastName);
  }, [formDefaultValues]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [successMessage, errorMessage]);

  const handleValidSubmit: SubmitHandler<FieldValues> = (values, event) => {
    const formElement = event?.currentTarget as HTMLFormElement | undefined;
    const formData = formElement ? new FormData(formElement) : undefined;
    const pickValue = (key: keyof RegisterFormValues): string => {
      if (formData?.has(key)) {
        const raw = formData.get(key);
        return typeof raw === 'string' ? raw.trim() : '';
      }
      if (key === 'password') {
        return password.trim();
      }
      if (key === 'login') {
        return login.trim();
      }
      if (key === 'email') {
        return email.trim();
      }
      if (key === 'firstName') {
        return firstName.trim();
      }
      if (key === 'lastName') {
        return lastName.trim();
      }
      const directValue = formData?.get(key) ?? values[key];
      return typeof directValue === 'string' ? directValue.trim() : '';
    };

    dispatch(
      handleRegister({
        login: pickValue('login'),
        email: pickValue('email'),
        password: pickValue('password'),
        firstName: pickValue('firstName'),
        lastName: pickValue('lastName'),
        address: pickValue('address'),
        role: 'CLIENT',
        langKey: 'fr',
      }),
    );
  };
  return (
    <div className="register-form-page py-12">
      <Row className="justify-content-center">
        <Col md="8" lg="7" xl="6" className="text-center">
          <h1 id="register-title" data-cy="registerTitle" className="mb-3 register-form-page__title">
            {t('auth.registerClient')}
          </h1>
          <p className="register-form-page__subtitle">{t('auth.registerClientSubtitle')}</p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8" lg="7" xl="6">
          <div className="register-panel">
            <ValidatedForm id="register-form" className="register-form" onSubmit={handleValidSubmit} defaultValues={formDefaultValues}>
              <Row className="g-4">
                <Col md="6">
                  <ValidatedField
                    name="firstName"
                    label={t('auth.firstName')}
                    placeholder={t('common.enterFirstName')}
                    data-cy="firstName"
                    onChange={event => {
                      setFirstName(event.target.value ?? '');
                      return event;
                    }}
                    validate={{
                      required: { value: true, message: t('common.fieldRequired') },
                      maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
                    }}
                  />
                </Col>
                <Col md="6">
                  <ValidatedField
                    name="lastName"
                    label={t('auth.lastName')}
                    placeholder={t('common.enterLastName')}
                    data-cy="lastName"
                    onChange={event => {
                      setLastName(event.target.value ?? '');
                      return event;
                    }}
                    validate={{
                      required: { value: true, message: t('common.fieldRequired') },
                      maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
                    }}
                  />
                </Col>
              </Row>
              <Row className="g-4">
                <Col md="6">
                  <ValidatedField
                    name="email"
                    label={t('common.email')}
                    placeholder={t('common.enterEmail')}
                    type="email"
                    data-cy="email"
                    onChange={event => {
                      setEmail(event.target.value ?? '');
                      return event;
                    }}
                    validate={{
                      required: { value: true, message: t('common.fieldRequired') },
                      minLength: { value: 5, message: t('common.minLength', { min: 5 }) },
                      maxLength: { value: 254, message: t('common.maxLength', { max: 254 }) },
                      validate: v => isEmail(v) || t('common.invalidEmail'),
                    }}
                  />
                </Col>
                <Col md="6">
                  <ValidatedField
                    name="login"
                    label={t('auth.username')}
                    placeholder={t('auth.usernamePlaceholder')}
                    data-cy="login"
                    onChange={event => {
                      setLogin(event.target.value ?? '');
                      return event;
                    }}
                    validate={{
                      required: { value: true, message: t('common.fieldRequired') },
                      pattern: {
                        value: /^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/,
                        message: t('common.invalidLogin'),
                      },
                      minLength: { value: 1, message: t('common.minLength', { min: 1 }) },
                      maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
                    }}
                  />
                </Col>
              </Row>
              <ValidatedField
                name="address"
                label={t('common.address')}
                placeholder={t('common.enterAddress')}
                data-cy="address"
                validate={{
                  required: { value: true, message: t('common.fieldRequired') },
                  maxLength: { value: 255, message: t('common.maxLength', { max: 255 }) },
                }}
              />
              <Row className="g-4">
                <Col md="6">
                  <ValidatedField
                    name="password"
                    label={t('auth.password')}
                    placeholder={t('auth.passwordPlaceholder')}
                    type="password"
                    data-cy="firstPassword"
                    onChange={event => {
                      setPassword(event.target.value ?? '');
                      return event;
                    }}
                    validate={{
                      required: { value: true, message: t('common.fieldRequired') },
                      minLength: { value: 8, message: t('common.minLength', { min: 8 }) },
                      maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
                    }}
                  />
                </Col>
                <Col md="6">
                  <ValidatedField
                    name="confirmPassword"
                    label={t('auth.confirmPassword')}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    type="password"
                    data-cy="secondPassword"
                    validate={{
                      required: { value: true, message: t('common.fieldRequired') },
                      minLength: { value: 8, message: t('common.minLength', { min: 8 }) },
                      maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
                      validate: v => v === password || t('common.passwordsMustMatch'),
                    }}
                  />
                </Col>
              </Row>
              <PasswordStrengthBar password={password} />
              {successMessage && (
                <Alert variant="success" className="register-form__feedback" data-cy="registerSuccess">
                  {successMessage}
                </Alert>
              )}
              {errorMessage && (
                <Alert variant="danger" className="register-form__feedback" data-cy="registerError">
                  {errorMessage}
                </Alert>
              )}
              <div className="register-form__cta">
                <Button id="register-submit" variant="primary" type="submit" data-cy="submit" disabled={loading}>
                  {loading ? t('auth.registering') : t('auth.createAccount')}
                </Button>
                <Link to="/account/register" className="register-form__secondary">
                  {t('auth.chooseAnotherProfile')}
                </Link>
              </div>
            </ValidatedForm>
            <Alert variant="info" className="register-form__info">
              <span>{t('auth.clientConfirmationEmailNote')}</span>
            </Alert>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterForm;
