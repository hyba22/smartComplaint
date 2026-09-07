import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Users from './users';

const UserRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route index element={<Users />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default UserRoutes;
