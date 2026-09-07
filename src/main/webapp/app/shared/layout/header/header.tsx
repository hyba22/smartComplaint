import './header.scss';

import React from 'react';
import { Button, Navbar } from 'react-bootstrap';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import LoadingBar from 'react-redux-loading-bar';

import { Brand } from './header-components';

type HeaderProps = {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  ribbonEnv?: string;
  isInProduction?: boolean;
  isOpenAPIEnabled?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Header = (_?: HeaderProps) => {
  const { t } = useTranslation();
  return (
    <header id="app-header" className="sc-header">
      <LoadingBar className="loading-bar" />
      <div className="sc-nav-shell">
        <Navbar data-cy="navbar" data-bs-theme="dark" expand="md" fixed="top" className="jh-navbar glass-nav" collapseOnSelect>
          <div className="d-flex w-100 align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <Brand />
            </div>
            <Navbar.Toggle aria-controls="header-tabs" aria-label="Menu" className="sc-navbar-toggle" />
          </div>
          <Navbar.Collapse id="header-tabs">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3 ms-auto mt-3 mt-md-0" data-cy="header-actions">
              <Button as={Link as any} to="/login" variant="outline-light" size="sm" className="sc-outline-btn w-100 w-md-auto">
                {t('header.login')}
              </Button>
              <Button as={Link as any} to="/account/register" variant="primary" size="sm" className="sc-solid-btn w-100 w-md-auto">
                {t('header.register')}
              </Button>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>
    </header>
  );
};

export default Header;
