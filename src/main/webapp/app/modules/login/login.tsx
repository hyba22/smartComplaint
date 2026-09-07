import React, { useEffect } from 'react';

import { useAppSelector } from 'app/config/store';

import LoginForm from './login-form';

export const Login = () => {
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const account = useAppSelector(state => state.authentication.account);

  useEffect(() => {
    if (isAuthenticated && account) {
      // Redirect based on user role using immediate redirect
      const role = account.role;
      if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else if (role === 'CLIENT') {
        window.location.href = '/client';
      } else if (role === 'CONSEILLER') {
        window.location.href = '/conseiller';
      } else if (role === 'RESPONSABLE') {
        window.location.href = '/responsable';
      }
    }
  }, [isAuthenticated, account]);

  return <LoginForm />;
};

export default Login;
