import React from 'react';
import { Navigate, PathRouteProps, useLocation } from 'react-router';

import { useAppSelector } from 'app/config/store';
import ErrorBoundary from 'app/shared/error/error-boundary';

interface IOwnProps extends PathRouteProps {
  hasAnyAuthorities?: string[];
  children: React.ReactNode;
}

const PrivateRoute = ({ children, hasAnyAuthorities = [], ...rest }: IOwnProps) => {
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const sessionHasBeenFetched = useAppSelector(state => state.authentication.sessionHasBeenFetched);
  const account = useAppSelector(state => state.authentication.account);
  const isAuthorized = hasAnyAuthority(account.authorities, hasAnyAuthorities, account.role);
  const pageLocation = useLocation();

  if (!children) {
    throw new Error(`A component needs to be specified for private route for path ${rest.path}`);
  }

  if (!sessionHasBeenFetched) {
    return <div></div>;
  }

  if (isAuthenticated) {
    if (isAuthorized) {
      return <ErrorBoundary>{children}</ErrorBoundary>;
    }

    return (
      <div className="insufficient-authority">
        <div className="alert alert-danger">Vous n&apos;avez pas les droits pour accéder à cette page.</div>
      </div>
    );
  }

  return (
    <Navigate
      to={{
        pathname: '/login',
        search: pageLocation.search,
      }}
      replace
      state={{ from: pageLocation }}
    />
  );
};

export const hasAnyAuthority = (authorities: string[] | null | undefined, hasAnyAuthorities?: string[] | null, role?: string) => {
  if (!hasAnyAuthorities || hasAnyAuthorities.length === 0) {
    return true;
  }

  // Check authorities array
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.some(auth => authorities.includes(auth))) {
      return true;
    }
  }

  // Check role field - convert role to ROLE_XXX format for comparison
  if (role) {
    const roleAuthority = `ROLE_${role}`;
    if (hasAnyAuthorities.includes(roleAuthority)) {
      return true;
    }
  }

  return false;
};

export default PrivateRoute;
