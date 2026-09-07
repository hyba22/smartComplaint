import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import 'app/config/dayjs';
import 'app/config/i18n';

import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { BrowserRouter, useLocation } from 'react-router';

import { ToastContainer } from 'react-toastify';

import { useAppDispatch } from 'app/config/store';
import AppRoutes from 'app/routes';
import ErrorBoundary from 'app/shared/error/error-boundary';
import Footer from 'app/shared/layout/footer/footer';
import Header from 'app/shared/layout/header/header';
import { getProfile } from 'app/shared/reducers/application-profile';
import { getSession } from 'app/shared/reducers/authentication';

const baseHref = document.querySelector('base')?.getAttribute('href')?.replace(/\/$/, '') ?? '';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(getSession());
    dispatch(getProfile());
  }, []);

  const shouldShowHeader =
    !location.pathname.startsWith('/admin') &&
    !location.pathname.startsWith('/client') &&
    !location.pathname.startsWith('/conseiller') &&
    !location.pathname.startsWith('/responsable') &&
    !location.pathname.startsWith('/files') &&
    !location.pathname.startsWith('/chat') &&
    !location.pathname.startsWith('/account/settings');

  const paddingTop = shouldShowHeader ? '60px' : '0px';
  const shouldShowCard = shouldShowHeader;

  return (
    <div className="app-container" style={{ paddingTop }}>
      <ToastContainer position="top-left" className="toastify-container" toastClassName="toastify-toast" />
      {shouldShowHeader && (
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
      )}
      {shouldShowCard ? (
        <>
          <div className="container-fluid view-container" id="app-view-container">
            <Card className="jh-card">
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </Card>
          </div>
          <Footer />
        </>
      ) : (
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter basename={baseHref}>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
