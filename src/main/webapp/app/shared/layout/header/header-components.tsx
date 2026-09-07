import React from 'react';
import { NavItem, NavLink, NavbarBrand } from 'react-bootstrap';
import { NavLink as Link } from 'react-router';

export const BrandIcon = props => (
  <div {...props} className="brand-icon">
    <img src="content/images/logospeedcomplaint.png" alt="Speed Complaint" />
  </div>
);

export const Brand = () => (
  <NavbarBrand as={Link as any} to="/" className="brand-logo">
    <BrandIcon />
    <span className="brand-title">Speed Complaint</span>
  </NavbarBrand>
);

export const Home = () => (
  <NavItem>
    <NavLink as={Link as any} to="/login" className="d-flex align-items-center">
      <span></span>
    </NavLink>
    <NavLink as={Link as any} to="/register" className="d-flex align-items-center">
      <span></span>
    </NavLink>
  </NavItem>
);
