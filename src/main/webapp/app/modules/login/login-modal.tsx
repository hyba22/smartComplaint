import React from 'react';
import { Alert, Button, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap';
import { ValidatedField } from 'react-jhipster';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { type FieldError, useForm, type FieldValues } from 'react-hook-form';

export interface ILoginModalProps {
  showModal: boolean;
  loginError: boolean;
  handleLogin: (username: string, password: string, rememberMe: boolean) => void;
  handleClose: () => void;
}

const LoginModal = (props: ILoginModalProps) => {
  const { t } = useTranslation();
  const login = (values: FieldValues) => {
    const { username, password, rememberMe } = values as { username: string; password: string; rememberMe: boolean };
    props.handleLogin(username, password, rememberMe);
  };

  const {
    handleSubmit,
    register,
    formState: { errors, touchedFields },
  } = useForm({ mode: 'onTouched' });

  const { loginError, handleClose } = props;

  const handleLoginSubmit = e => {
    handleSubmit(login)(e);
  };

  return (
    <Modal
      show={props.showModal}
      onHide={handleClose}
      backdrop="static"
      centered
      id="login-page"
      autoFocus={false}
      dialogClassName="login-modal__dialog"
      contentClassName="login-modal__content"
      backdropClassName="login-modal__backdrop"
    >
      <Form onSubmit={handleLoginSubmit}>
        <ModalHeader id="login-title" data-cy="loginTitle" closeButton className="login-modal__header">
          {t('auth.login')}
        </ModalHeader>
        <ModalBody className="login-modal__body">
          <Row>
            <Col md="12">
              {loginError && (
                <Alert variant="danger" data-cy="loginError">
                  <strong>{t('auth.loginErrorTitle')}</strong> {t('auth.loginErrorMessage')}
                </Alert>
              )}
            </Col>
            <Col md="12">
              <ValidatedField
                name="username"
                label={t('auth.username')}
                placeholder={t('auth.usernamePlaceholder')}
                required
                autoFocus
                data-cy="username"
                validate={{ required: 'Username cannot be empty!' }}
                register={register}
                error={errors.username as FieldError}
                isTouched={touchedFields.username}
              />
              <ValidatedField
                name="password"
                type="password"
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                required
                data-cy="password"
                validate={{ required: 'Password cannot be empty!' }}
                register={register}
                error={errors.password as FieldError}
                isTouched={touchedFields.password}
              />
              <ValidatedField name="rememberMe" type="checkbox" check label={t('auth.rememberMe')} value={true} register={register} />
            </Col>
          </Row>
          <div className="mt-1">&nbsp;</div>
          <Alert variant="warning">
            <Link to="/account/reset/request" data-cy="forgetYourPasswordSelector">
              {t('auth.forgotPassword')}
            </Link>
          </Alert>
          <Alert variant="warning">
            <span>{t('auth.noAccount')}</span> <Link to="/account/register">{t('auth.createAccount')}</Link>
          </Alert>
        </ModalBody>
        <ModalFooter className="login-modal__footer">
          <Button variant="outline-secondary" onClick={handleClose} tabIndex={1} className="login-modal__ghost">
            {t('common.cancel')}
          </Button>{' '}
          <Button variant="primary" type="submit" data-cy="submit" className="login-modal__submit">
            {t('auth.login')}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default LoginModal;
