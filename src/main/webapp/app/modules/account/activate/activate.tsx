import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { activateAction, reset } from './activate.reducer';
import './activate.scss';

const successAlert = (
  <Alert variant="success">
    <strong>Félicitations !</strong> Votre compte a été activé avec succès. Vous pouvez maintenant vous{' '}
    <Link to="/login" className="alert-link">
      connecter
    </Link>
    .
  </Alert>
);

const failureAlert = (
  <Alert variant="danger">
    <strong>Votre compte utilisateur n&apos;a pas pu être activé.</strong> Utilisez le formulaire d&apos;enregistrement pour en créer un
    nouveau.
  </Alert>
);

export const ActivatePage = () => {
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const key = searchParams.get('key');

    dispatch(activateAction(key));
    return () => {
      dispatch(reset());
    };
  }, []);

  const { activationSuccess, activationFailure } = useAppSelector(state => state.activate);

  return (
    <div className="activate-page">
      <div className="activate-page__container">
        <h1>Activation</h1>
        {activationSuccess ? successAlert : undefined}
        {activationFailure ? failureAlert : undefined}
      </div>
    </div>
  );
};

export default ActivatePage;
