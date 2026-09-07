import React, { useLayoutEffect } from 'react';

import { useAppDispatch } from 'app/config/store';
import { logout } from 'app/shared/reducers/authentication';

export const Logout = () => {
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(logout());
    // Redirect immediately to home page
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }, [dispatch]);

  return <div style={{ display: 'none' }} />;
};

export default Logout;
