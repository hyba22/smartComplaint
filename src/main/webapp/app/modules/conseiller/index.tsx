import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import ConseillerDashboard from './dashboard/conseiller-dashboard';
import ConseillerReclamations from './reclamations/conseiller-reclamations';
import ConseillerReclamationDetail from './reclamations/conseiller-reclamation-detail';
import ConseillerTransferred from './transferred/conseiller-transferred';
import ConseillerArchive from './archive/conseiller-archive';
import ConseillerPlanning from './planning/conseiller-planning';
import SettingsPage from 'app/modules/account/settings/settings';

const ConseillerRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route index element={<ConseillerDashboard />} />
      <Route path="reclamations" element={<ConseillerReclamations />} />
      <Route path="reclamations/:id" element={<ConseillerReclamationDetail />} />
      <Route path="transferred" element={<ConseillerTransferred />} />
      <Route path="archive" element={<ConseillerArchive />} />
      <Route path="planning" element={<ConseillerPlanning />} />
      <Route path="settings" element={<SettingsPage />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default ConseillerRoutes;
