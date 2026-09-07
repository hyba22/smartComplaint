import React from 'react';
import { Route } from 'react-router';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import ConseillerTransferred from './conseiller-transferred';

const TransferredRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<ConseillerTransferred />} />
  </ErrorBoundaryRoutes>
);

export default TransferredRoutes;
