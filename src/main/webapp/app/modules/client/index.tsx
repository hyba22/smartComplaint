import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import ClientDashboard from './dashboard/client-dashboard';
import ClientReclamations from './reclamations/client-reclamations';
import ClientReclamationDetail from './reclamations/client-reclamation-detail';
import ClientHistorique from './historique/client-historique';
import SettingsPage from 'app/modules/account/settings/settings';

const ClientRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route index element={<ClientDashboard />} />
      <Route path="reclamations" element={<ClientReclamations />} />
      <Route path="reclamations/:id" element={<ClientReclamationDetail />} />
      <Route path="historique" element={<ClientHistorique />} />
      <Route path="settings" element={<SettingsPage />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default ClientRoutes;
