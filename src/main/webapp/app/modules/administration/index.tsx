import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import AdminDashboard from './dashboard/admin-dashboard';
import Configuration from './configuration/configuration';
import Docs from './docs/docs';
import Health from './health/health';
import Logs from './logs/logs';
import Metrics from './metrics/metrics';
import Tracker from './tracker/tracker';
import UserManagement from './user-management';
import UserRoutes from './users';
import AdminReclamations from '../admin/reclamations/admin-reclamations';
import AdminArchive from './archive/admin-archive';
import SettingsPage from 'app/modules/account/settings/settings';

const AdministrationRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route index element={<AdminDashboard />} />
      <Route path="reclamations" element={<AdminReclamations />} />
      <Route path="archive" element={<AdminArchive />} />
      <Route path="users/*" element={<UserRoutes />} />
      <Route path="user-management/*" element={<UserManagement />} />
      <Route path="tracker" element={<Tracker />} />
      <Route path="health" element={<Health />} />
      <Route path="metrics" element={<Metrics />} />
      <Route path="configuration" element={<Configuration />} />
      <Route path="logs" element={<Logs />} />
      <Route path="docs" element={<Docs />} />
      <Route path="settings" element={<SettingsPage />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default AdministrationRoutes;
