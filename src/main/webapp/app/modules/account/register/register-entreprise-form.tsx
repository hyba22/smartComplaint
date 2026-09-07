import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import { FieldValues } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';

import { handleEntrepriseRegister, reset } from './register.reducer';
import './register-form.scss';
import './register-entreprise-form.scss';

type EntrepriseRegisterValues = {
  idEntreprise: string;
  nomEntreprise: string;
  secteur?: string;
  adresseEntreprise: string;
  tel?: string;
  emailEntreprise?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  adminLogin?: string;
};

const RegisterEntrepriseForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [adminPassword, setAdminPassword] = useState('');
  const [idEntreprise, setIdEntreprise] = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [secteur, setSecteur] = useState('');
  const [adresseEntreprise, setAdresseEntreprise] = useState('');
  const [tel, setTel] = useState('');
  const [emailEntreprise, setEmailEntreprise] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminLogin, setAdminLogin] = useState('');

  const formDefaultValues = useMemo<EntrepriseRegisterValues>(
    () => ({
      idEntreprise: '',
      nomEntreprise: '',
      secteur: '',
      adresseEntreprise: '',
      tel: '',
      emailEntreprise: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      adminLogin: '',
    }),
    [],
  );

  useEffect(
    () => () => {
      dispatch(reset());
    },
    [dispatch],
  );

  const { errorMessage, loading, successMessage } = useAppSelector(state => state.register);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [successMessage, errorMessage]);

  useEffect(() => {
    setAdminPassword(formDefaultValues.adminPassword);
    setIdEntreprise(formDefaultValues.idEntreprise);
    setNomEntreprise(formDefaultValues.nomEntreprise);
    setSecteur(formDefaultValues.secteur || '');
    setAdresseEntreprise(formDefaultValues.adresseEntreprise);
    setTel(formDefaultValues.tel || '');
    setEmailEntreprise(formDefaultValues.emailEntreprise || '');
    setAdminFirstName(formDefaultValues.adminFirstName);
    setAdminLastName(formDefaultValues.adminLastName);
    setAdminEmail(formDefaultValues.adminEmail);
    setAdminLogin(formDefaultValues.adminLogin || '');
  }, [formDefaultValues]);

  const handleValidSubmit = (values: FieldValues, event?: React.BaseSyntheticEvent) => {
    const formData = event?.currentTarget ? new FormData(event.currentTarget) : undefined;
    const pickValue = (key: keyof EntrepriseRegisterValues): string => {
      // FormData
      if (formData?.has(key)) {
        const raw = formData.get(key);
        if (typeof raw === 'string' && raw.trim()) {
          return raw.trim();
        }
      }
      // local state
      if (key === 'idEntreprise' && idEntreprise) {
        return idEntreprise.trim();
      }
      if (key === 'nomEntreprise' && nomEntreprise) {
        return nomEntreprise.trim();
      }
      if (key === 'secteur' && secteur) {
        return secteur.trim();
      }
      if (key === 'adresseEntreprise' && adresseEntreprise) {
        return adresseEntreprise.trim();
      }
      if (key === 'tel' && tel) {
        return tel.trim();
      }
      if (key === 'emailEntreprise' && emailEntreprise) {
        return emailEntreprise.trim();
      }
      if (key === 'adminFirstName' && adminFirstName) {
        return adminFirstName.trim();
      }
      if (key === 'adminLastName' && adminLastName) {
        return adminLastName.trim();
      }
      if (key === 'adminEmail' && adminEmail) {
        return adminEmail.trim();
      }
      if (key === 'adminPassword' && adminPassword) {
        return adminPassword.trim();
      }
      if (key === 'adminLogin' && adminLogin) {
        return adminLogin.trim();
      }
      // values parameter from react-hook-form
      const directValue = values[key];
      return typeof directValue === 'string' ? directValue.trim() : '';
    };

    const emailValue = pickValue('adminEmail').toLowerCase();
    const loginValue = pickValue('adminLogin') || emailValue;

    const payload = {
      idEntreprise: pickValue('idEntreprise'),
      nomEntreprise: pickValue('nomEntreprise'),
      secteur: pickValue('secteur') || undefined,
      adresseEntreprise: pickValue('adresseEntreprise'),
      tel: pickValue('tel') || undefined,
      emailEntreprise: pickValue('emailEntreprise') || undefined,
      adminFirstName: pickValue('adminFirstName'),
      adminLastName: pickValue('adminLastName'),
      adminEmail: emailValue,
      adminPassword: pickValue('adminPassword'),
      adminLogin: loginValue,
    };

    dispatch(handleEntrepriseRegister(payload));
  };

  return (
    <div className="register-form-page py-12">
      <Row className="justify-content-center">
        <Col md="8" lg="7" xl="6" className="text-center">
          <h1 className="mb-3 register-form-page__title" data-cy="registerEntrepriseTitle">
            {t('auth.registerCompany')}
          </h1>
          <p className="register-form-page__subtitle">{t('auth.registerCompanySubtitle')}</p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8" lg="7" xl="6">
          <div className="register-panel">
            <ValidatedForm
              id="register-entreprise-form"
              className="register-form register-form--entreprise"
              onSubmit={handleValidSubmit}
              defaultValues={formDefaultValues}
            >
              <div className="register-form__section">
                <h2 className="register-form__section-title">{t('auth.companyInformation')}</h2>
                <Row className="g-4">
                  <Col md="6">
                    <ValidatedField
                      name="nomEntreprise"
                      label={t('auth.companyName')}
                      placeholder={t('auth.companyNamePlaceholder')}
                      data-cy="nomEntreprise"
                      onChange={event => {
                        setNomEntreprise(event.target.value ?? '');
                        return event;
                      }}
                      validate={{
                        required: { value: true, message: t('common.fieldRequired') },
                        maxLength: { value: 255, message: t('common.maxLength', { max: 255 }) },
                      }}
                    />
                  </Col>
                  <Col md="6">
                    <ValidatedField
                      name="idEntreprise"
                      label={t('auth.taxId')}
                      placeholder={t('auth.taxIdPlaceholder')}
                      data-cy="idEntreprise"
                      onChange={event => {
                        setIdEntreprise(event.target.value ?? '');
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
                      name="secteur"
                      label={t('common.sector')}
                      placeholder={t('auth.businessSectorPlaceholder')}
                      data-cy="secteur"
                      onChange={event => {
                        setSecteur(event.target.value ?? '');
                        return event;
                      }}
                      validate={{
                        maxLength: { value: 255, message: t('common.maxLength', { max: 255 }) },
                      }}
                    />
                  </Col>
                  <Col md="6">
                    <ValidatedField
                      name="tel"
                      label={t('common.phone')}
                      placeholder={t('auth.companyPhonePlaceholder')}
                      data-cy="tel"
                      onChange={event => {
                        setTel(event.target.value ?? '');
                        return event;
                      }}
                      validate={{
                        maxLength: { value: 30, message: t('common.maxLength', { max: 30 }) },
                      }}
                    />
                  </Col>
                </Row>
                <ValidatedField
                  name="adresseEntreprise"
                  label={t('auth.fullAddress')}
                  placeholder={t('auth.fullAddressPlaceholder')}
                  data-cy="adresseEntreprise"
                  onChange={event => {
                    setAdresseEntreprise(event.target.value ?? '');
                    return event;
                  }}
                  validate={{
                    required: { value: true, message: t('common.fieldRequired') },
                    maxLength: { value: 500, message: t('common.maxLength', { max: 500 }) },
                  }}
                />
                <ValidatedField
                  name="emailEntreprise"
                  label={t('auth.companyEmailOptional')}
                  placeholder={t('auth.companyEmailPlaceholder')}
                  data-cy="emailEntreprise"
                  onChange={event => {
                    setEmailEntreprise(event.target.value ?? '');
                    return event;
                  }}
                  validate={{
                    maxLength: { value: 255, message: t('common.maxLength', { max: 255 }) },
                    validate: value => !value || isEmail(value) || t('common.invalidEmail'),
                  }}
                />
              </div>

              <div className="register-form__section">
                <h2 className="register-form__section-title">{t('auth.companyAdministrator')}</h2>
                <Row className="g-4">
                  <Col md="6">
                    <ValidatedField
                      name="adminFirstName"
                      label={t('auth.firstName')}
                      placeholder={t('auth.adminFirstName')}
                      data-cy="adminFirstName"
                      onChange={event => {
                        setAdminFirstName(event.target.value ?? '');
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
                      name="adminLastName"
                      label={t('auth.lastName')}
                      placeholder={t('auth.adminLastName')}
                      data-cy="adminLastName"
                      onChange={event => {
                        setAdminLastName(event.target.value ?? '');
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
                      name="adminEmail"
                      label={t('auth.adminEmail')}
                      placeholder={t('auth.adminEmailPlaceholder')}
                      type="email"
                      data-cy="adminEmail"
                      onChange={event => {
                        setAdminEmail(event.target.value ?? '');
                        return event;
                      }}
                      validate={{
                        required: { value: true, message: t('common.fieldRequired') },
                        minLength: { value: 5, message: t('common.minLength', { min: 5 }) },
                        maxLength: { value: 254, message: t('common.maxLength', { max: 254 }) },
                        validate: value => isEmail(value) || t('common.invalidEmail'),
                      }}
                    />
                  </Col>
                  <Col md="6">
                    <ValidatedField
                      name="adminLogin"
                      label={t('auth.adminLogin')}
                      placeholder={t('auth.adminLoginPlaceholder')}
                      data-cy="adminLogin"
                      onChange={event => {
                        setAdminLogin(event.target.value ?? '');
                        return event;
                      }}
                      validate={{
                        maxLength: { value: 50, message: t('common.maxLength', { max: 50 }) },
                      }}
                    />
                  </Col>
                </Row>
                <Row className="g-4">
                  <Col md="6">
                    <ValidatedField
                      name="adminPassword"
                      label={t('auth.password')}
                      placeholder={t('auth.password')}
                      type="password"
                      data-cy="adminPassword"
                      onChange={event => {
                        setAdminPassword(event.target.value ?? '');
                        return event;
                      }}
                      validate={{
                        required: { value: true, message: t('common.fieldRequired') },
                        minLength: { value: 8, message: t('common.minLength', { min: 8 }) },
                        maxLength: { value: 60, message: t('common.maxLength', { max: 60 }) },
                      }}
                    />
                  </Col>
                  <Col md="6">
                    <ValidatedField
                      name="confirmPassword"
                      label={t('auth.confirmPassword')}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      type="password"
                      data-cy="confirmPassword"
                      validate={{
                        required: { value: true, message: t('common.fieldRequired') },
                        validate: value => value === adminPassword || t('common.passwordsMustMatch'),
                      }}
                    />
                  </Col>
                </Row>
                <div className="mt-2">
                  <PasswordStrengthBar password={adminPassword} />
                </div>
              </div>

              {successMessage && (
                <Alert variant="success" className="register-form__feedback" data-cy="registerEntrepriseSuccess">
                  {successMessage}
                </Alert>
              )}
              {errorMessage && (
                <Alert variant="danger" className="register-form__feedback" data-cy="registerEntrepriseError">
                  {errorMessage}
                </Alert>
              )}

              <div className="register-form__cta">
                <Button variant="primary" type="submit" data-cy="submitEntreprise" disabled={loading}>
                  {loading ? t('auth.registering') : t('auth.createCompanySpace')}
                </Button>
                <Link to="/account/register" className="register-form__secondary">
                  {t('auth.chooseAnotherProfile')}
                </Link>
              </div>
            </ValidatedForm>
            <Alert variant="info" className="register-form__info">
              <span>{t('auth.confirmationEmailNote')}</span>
            </Alert>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterEntrepriseForm;
