import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, FormText, Row } from 'react-bootstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Link, useNavigate, useParams } from 'react-router';

import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { createUser, getRoles, getUser, reset, updateUser } from './user-management.reducer';

export const UserManagementUpdate = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { login } = useParams<'login'>();
  const isNew = login === undefined;

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getUser(login));
    }
    dispatch(getRoles());
    return () => {
      dispatch(reset());
    };
  }, [login]);

  const handleClose = () => {
    navigate('/admin/user-management');
  };

  const saveUser = values => {
    if (isNew) {
      dispatch(createUser(values));
    } else {
      dispatch(updateUser(values));
    }
    handleClose();
  };

  const user = useAppSelector(state => state.userManagement.user);
  const loading = useAppSelector(state => state.userManagement.loading);
  const updating = useAppSelector(state => state.userManagement.updating);
  const authorities = useAppSelector(state => state.userManagement.authorities);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1 data-cy="UserManagementCreateUpdateHeading">{isNew ? t('users.addUser') : t('users.editUser')}</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : (
            <ValidatedForm onSubmit={saveUser} defaultValues={user}>
              {user.id && <ValidatedField type="text" name="id" data-cy="id" required readOnly label="ID" validate={{ required: true }} />}
              <ValidatedField
                type="text"
                name="login"
                data-cy="login"
                label={t('users.login')}
                validate={{
                  required: {
                    value: true,
                    message: t('common.fieldRequired'),
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/,
                    message: t('common.invalidLogin'),
                  },
                  minLength: {
                    value: 1,
                    message: t('common.minLength', { min: 1 }),
                  },
                  maxLength: {
                    value: 50,
                    message: t('common.maxLength', { max: 50 }),
                  },
                }}
              />
              <ValidatedField
                type="text"
                name="firstName"
                data-cy="firstName"
                label={t('users.firstName')}
                validate={{
                  maxLength: {
                    value: 50,
                    message: t('common.maxLength', { max: 50 }),
                  },
                }}
              />
              <ValidatedField
                type="text"
                name="lastName"
                data-cy="lastName"
                label={t('users.lastName')}
                validate={{
                  maxLength: {
                    value: 50,
                    message: t('common.maxLength', { max: 50 }),
                  },
                }}
              />
              <FormText>{t('common.maxLength', { max: 50 })}</FormText>
              <ValidatedField
                name="email"
                data-cy="email"
                label={t('users.email')}
                placeholder={t('users.enterEmail')}
                type="email"
                validate={{
                  required: {
                    value: true,
                    message: t('common.fieldRequired'),
                  },
                  minLength: {
                    value: 5,
                    message: t('common.minLength', { min: 5 }),
                  },
                  maxLength: {
                    value: 254,
                    message: t('common.maxLength', { max: 254 }),
                  },
                  validate: v => isEmail(v) || t('common.invalidEmail'),
                }}
              />
              <ValidatedField
                type="checkbox"
                name="activated"
                data-cy="activated"
                check
                value={true}
                disabled={!user.id}
                label={t('users.active')}
              />
              <ValidatedField type="select" name="authorities" data-cy="profiles" multiple label={t('users.role')}>
                {authorities.map(role => (
                  <option value={role} key={role}>
                    {role}
                  </option>
                ))}
              </ValidatedField>
              <Button as={Link as any} to="/admin/user-management" replace variant="info" data-cy="entityCreateCancelButton">
                <FontAwesomeIcon icon={faArrowLeft} />
                &nbsp;
                <span className="d-none d-md-inline">{t('common.back')}</span>
              </Button>
              &nbsp;
              <Button variant="primary" type="submit" disabled={updating} data-cy="entityCreateSaveButton">
                <FontAwesomeIcon icon={faSave} />
                &nbsp; {t('common.save')}
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default UserManagementUpdate;
