import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Row } from 'react-bootstrap';
import { TextFormat } from 'react-jhipster';
import { Link, useParams } from 'react-router';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getUser } from './user-management.reducer';

export const UserManagementDetail = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { login } = useParams<'login'>();

  useEffect(() => {
    if (login) {
      dispatch(getUser(login));
    }
  }, [dispatch, login]);

  const user = useAppSelector(state => state.userManagement.user);

  return (
    <div>
      <h2 data-cy="userManagementDetailsHeading">
        {t('users.title')} [<strong>{user.login}</strong>]
      </h2>
      <Row size="md">
        <dl className="jh-entity-details">
          <dt>{t('users.login')}</dt>
          <dd>
            <span>{user.login}</span>&nbsp;
            {user.activated ? <Badge bg="success">{t('users.active')}</Badge> : <Badge bg="danger">{t('users.inactive')}</Badge>}
          </dd>
          <dt>{t('users.firstName')}</dt>
          <dd>{user.firstName}</dd>
          <dt>{t('users.lastName')}</dt>
          <dd>{user.lastName}</dd>
          <dt>{t('users.email')}</dt>
          <dd>{user.email}</dd>
          <dt>{t('common.createdBy')}</dt>
          <dd>{user.createdBy}</dd>
          <dt>{t('users.createdDate')}</dt>
          <dd>{user.createdDate && <TextFormat value={user.createdDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid />}</dd>
          <dt>{t('users.lastModifiedBy')}</dt>
          <dd>{user.lastModifiedBy}</dd>
          <dt>{t('users.lastModifiedDate')}</dt>
          <dd>
            {user.lastModifiedDate && <TextFormat value={user.lastModifiedDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid />}
          </dd>
          <dt>{t('users.role')}</dt>
          <dd>
            <Badge bg="info">{user.role || 'UTILISATEUR'}</Badge>
          </dd>
        </dl>
      </Row>
      <Button as={Link as any} to="/admin/user-management" replace variant="info" data-cy="entityDetailsBackButton">
        <FontAwesomeIcon icon={faArrowLeft} /> <span className="d-none d-md-inline">{t('common.back')}</span>
      </Button>
    </div>
  );
};

export default UserManagementDetail;
