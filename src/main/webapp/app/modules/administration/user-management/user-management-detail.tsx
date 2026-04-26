import React, { useEffect } from 'react';
import { Badge, Button, Row } from 'react-bootstrap';
import { TextFormat } from 'react-jhipster';
import { Link, useParams } from 'react-router';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getUser } from './user-management.reducer';

export const UserManagementDetail = () => {
  const dispatch = useAppDispatch();

  const { login } = useParams<'login'>();

  useEffect(() => {
    dispatch(getUser(login));
  }, []);

  const user = useAppSelector(state => state.userManagement.user);

  return (
    <div>
      <h2 data-cy="userManagementDetailsHeading">
        Utilisateur [<strong>{user.login}</strong>]
      </h2>
      <Row size="md">
        <dl className="jh-entity-details">
          <dt>Login</dt>
          <dd>
            <span>{user.login}</span>&nbsp;
            {user.activated ? <Badge bg="success">Activé</Badge> : <Badge bg="danger">Désactivé</Badge>}
          </dd>
          <dt>Prénom</dt>
          <dd>{user.firstName}</dd>
          <dt>Nom</dt>
          <dd>{user.lastName}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Créé par</dt>
          <dd>{user.createdBy}</dd>
          <dt>Créé le</dt>
          <dd>{user.createdDate && <TextFormat value={user.createdDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid />}</dd>
          <dt>Modifié par</dt>
          <dd>{user.lastModifiedBy}</dd>
          <dt>Modifié le</dt>
          <dd>
            {user.lastModifiedDate && <TextFormat value={user.lastModifiedDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid />}
          </dd>
          <dt>Droits</dt>
          <dd>
            <ul className="list-unstyled">
              {user.authorities?.map((authority, i) => (
                <li key={`user-auth-${i}`}>
                  <Badge bg="info">{authority}</Badge>
                </li>
              ))}
            </ul>
          </dd>
        </dl>
      </Row>
      <Button as={Link as any} to="/admin/user-management" replace variant="info" data-cy="entityDetailsBackButton">
        <FontAwesomeIcon icon={faArrowLeft} /> <span className="d-none d-md-inline">Retour</span>
      </Button>
    </div>
  );
};

export default UserManagementDetail;
