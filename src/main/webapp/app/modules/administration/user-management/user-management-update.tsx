import React, { useEffect } from 'react';
import { Button, Col, FormText, Row } from 'react-bootstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { Link, useNavigate, useParams } from 'react-router';

import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { createUser, getRoles, getUser, reset, updateUser } from './user-management.reducer';

export const UserManagementUpdate = () => {
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
          <h1 data-cy="UserManagementCreateUpdateHeading">Créer ou éditer un utilisateur</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm onSubmit={saveUser} defaultValues={user}>
              {user.id && <ValidatedField type="text" name="id" data-cy="id" required readOnly label="ID" validate={{ required: true }} />}
              <ValidatedField
                type="text"
                name="login"
                data-cy="login"
                label="Login"
                validate={{
                  required: {
                    value: true,
                    message: "Votre nom d'utilisateur est obligatoire.",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/,
                    message: "Votre nom d'utilisateur est invalide.",
                  },
                  minLength: {
                    value: 1,
                    message: "Votre nom d'utilisateur doit contenir au moins un caractère.",
                  },
                  maxLength: {
                    value: 50,
                    message: "Votre nom d'utilisateur ne peut pas contenir plus de 50 caractères.",
                  },
                }}
              />
              <ValidatedField
                type="text"
                name="firstName"
                data-cy="firstName"
                label="Prénom"
                validate={{
                  maxLength: {
                    value: 50,
                    message: 'Ce champ doit faire au maximum 50 caractères.',
                  },
                }}
              />
              <ValidatedField
                type="text"
                name="lastName"
                data-cy="lastName"
                label="Nom"
                validate={{
                  maxLength: {
                    value: 50,
                    message: 'Ce champ doit faire au maximum 50 caractères.',
                  },
                }}
              />
              <FormText>This field cannot be longer than 50 characters.</FormText>
              <ValidatedField
                name="email"
                data-cy="email"
                label="Email"
                placeholder="Votre email"
                type="email"
                validate={{
                  required: {
                    value: true,
                    message: 'Votre email est requis.',
                  },
                  minLength: {
                    value: 5,
                    message: 'Votre email doit comporter au moins 5 caractères.',
                  },
                  maxLength: {
                    value: 254,
                    message: 'Votre email ne doit pas comporter plus de 50 caractères.',
                  },
                  validate: v => isEmail(v) || "Votre email n'est pas valide.",
                }}
              />
              <ValidatedField type="checkbox" name="activated" data-cy="activated" check value={true} disabled={!user.id} label="Activé" />
              <ValidatedField type="select" name="authorities" data-cy="profiles" multiple label="Droits">
                {authorities.map(role => (
                  <option value={role} key={role}>
                    {role}
                  </option>
                ))}
              </ValidatedField>
              <Button as={Link as any} to="/admin/user-management" replace variant="info" data-cy="entityCreateCancelButton">
                <FontAwesomeIcon icon={faArrowLeft} />
                &nbsp;
                <span className="d-none d-md-inline">Retour</span>
              </Button>
              &nbsp;
              <Button variant="primary" type="submit" disabled={updating} data-cy="entityCreateSaveButton">
                <FontAwesomeIcon icon={faSave} />
                &nbsp; Sauvegarder
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default UserManagementUpdate;
