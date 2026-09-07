import React, { Suspense } from 'react';
import { Route, useLocation } from 'react-router';

import { sendActivity } from 'app/config/websocket-middleware';
import EntitiesRoutes from 'app/entities/routes';
import Activate from 'app/modules/account/activate/activate';
import PasswordResetFinish from 'app/modules/account/password-reset/finish/password-reset-finish';
import PasswordResetInit from 'app/modules/account/password-reset/init/password-reset-init';
import Register from 'app/modules/account/register/register';
import RegisterForm from 'app/modules/account/register/register-form';
import RegisterEntrepriseForm from 'app/modules/account/register/register-entreprise-form';
import Home from 'app/modules/home/home';
import Login from 'app/modules/login/login';
import Logout from 'app/modules/login/logout';
import ChatPage from 'app/modules/chat/chat';
import FileManager from 'app/modules/file-manager/file-manager';
import PrivateRoute from 'app/shared/auth/private-route';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import PageNotFound from 'app/shared/error/page-not-found';
import { Authority } from 'app/shared/jhipster/constants';

const loading = <div style={{ display: 'none' }} />;

const Account = React.lazy(() => import(/* webpackChunkName: "account" */ 'app/modules/account'));

const Admin = React.lazy(() => import(/* webpackChunkName: "administration" */ 'app/modules/administration'));

const Client = React.lazy(() => import(/* webpackChunkName: "client" */ 'app/modules/client'));

const Conseiller = React.lazy(() => import(/* webpackChunkName: "conseiller" */ 'app/modules/conseiller'));

const Responsable = React.lazy(() => import(/* webpackChunkName: "responsable" */ 'app/modules/responsable'));

const AppRoutes = () => {
  const pageLocation = useLocation();
  React.useEffect(() => {
    sendActivity(pageLocation.pathname);
  }, [pageLocation]);
  return (
    <div className="view-routes">
      <Suspense fallback={loading}>
        <ErrorBoundaryRoutes>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="logout" element={<Logout />} />
          <Route
            path="chat"
            element={
              <PrivateRoute hasAnyAuthorities={[Authority.ADMIN, Authority.USER]}>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route path="account">
            <Route
              path="*"
              element={
                <PrivateRoute hasAnyAuthorities={[Authority.ADMIN, Authority.USER]}>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route path="register" element={<Register />} />
            <Route path="register/client" element={<RegisterForm />} />
            <Route path="register/entreprise" element={<RegisterEntrepriseForm />} />
            <Route path="activate" element={<Activate />} />
            <Route path="reset">
              <Route path="request" element={<PasswordResetInit />} />
              <Route path="finish" element={<PasswordResetFinish />} />
            </Route>
          </Route>
          <Route
            path="admin/*"
            element={
              <PrivateRoute hasAnyAuthorities={[Authority.ADMIN]}>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route
            path="client/*"
            element={
              <PrivateRoute hasAnyAuthorities={[Authority.USER]}>
                <Client />
              </PrivateRoute>
            }
          />
          <Route
            path="conseiller/*"
            element={
              <PrivateRoute hasAnyAuthorities={[Authority.CONSEILLER]}>
                <Conseiller />
              </PrivateRoute>
            }
          />
          <Route
            path="files"
            element={
              <PrivateRoute hasAnyAuthorities={[Authority.ADMIN, Authority.RESPONSABLE]}>
                <FileManager />
              </PrivateRoute>
            }
          />
          <Route
            path="responsable"
            element={
              <PrivateRoute hasAnyAuthorities={[Authority.RESPONSABLE]}>
                <Responsable />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={
              <PrivateRoute hasAnyAuthorities={[Authority.USER]}>
                <EntitiesRoutes />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </ErrorBoundaryRoutes>
      </Suspense>
    </div>
  );
};

export default AppRoutes;
