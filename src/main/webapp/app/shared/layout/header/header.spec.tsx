/* eslint-disable spaced-comment */
/// <reference types="jest" />
/* eslint-enable spaced-comment */
import React from 'react';
import { MemoryRouter } from 'react-router';

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import initStore from '../../../config/store';

import Header from './header';

describe('Header', () => {
  let mountedWrapper: string | undefined;
  const devProps = {
    isAuthenticated: true,
    isAdmin: true,
    ribbonEnv: 'dev',
    isInProduction: false,
    isOpenAPIEnabled: true,
  };
  const prodProps = {
    ...devProps,
    ribbonEnv: 'prod',
    isInProduction: true,
    isOpenAPIEnabled: false,
  };
  const userProps = {
    ...prodProps,
    isAdmin: false,
  };
  const guestProps = {
    ...prodProps,
    isAdmin: false,
    isAuthenticated: false,
  };

  const wrapper = (props = devProps) => {
    if (!mountedWrapper) {
      const store = initStore();
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <Header {...props} />
          </MemoryRouter>
        </Provider>,
      );
      mountedWrapper = container.innerHTML;
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here
  it('Renders a Header component in dev profile with LoadingBar, Navbar, Nav.', () => {
    const html = wrapper();

    expect(html).toContain('navbar');
    expect(html).toContain('app-header');
    expect(html).toContain('header.login');
    expect(html).toContain('header.register');
    expect(html).not.toContain('admin-menu');
    expect(html).not.toContain('entity-menu');
    expect(html).not.toContain('account-menu');
    expect(html).not.toContain('ribbon');
  });

  it('Renders a Header component in prod profile with LoadingBar, Navbar, Nav.', () => {
    const html = wrapper(prodProps);

    expect(html).toContain('navbar');
    expect(html).toContain('app-header');
    expect(html).toContain('header.login');
    expect(html).toContain('header.register');
    expect(html).not.toContain('admin-menu');
    expect(html).not.toContain('entity-menu');
    expect(html).not.toContain('account-menu');
    expect(html).not.toContain('ribbon');
  });

  it('Renders a Header component in prod profile with logged in User', () => {
    const html = wrapper(userProps);

    expect(html).toContain('navbar');
    expect(html).toContain('app-header');
    expect(html).toContain('header.login');
    expect(html).toContain('header.register');
    expect(html).not.toContain('admin-menu');
    expect(html).not.toContain('entity-menu');
    expect(html).not.toContain('account-menu');
    expect(html).not.toContain('ribbon');
  });

  it('Renders a Header component in prod profile with no logged in User', () => {
    const html = wrapper(guestProps);

    expect(html).toContain('navbar');
    expect(html).toContain('app-header');
    expect(html).toContain('header.login');
    expect(html).toContain('header.register');
    expect(html).not.toContain('admin-menu');
    expect(html).not.toContain('entity-menu');
    expect(html).not.toContain('account-menu');
    expect(html).not.toContain('ribbon');
  });
});
