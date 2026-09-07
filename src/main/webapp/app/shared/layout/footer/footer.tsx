import './footer.scss';

import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-text">
            &copy; {new Date().getFullYear()} Speed Complaint. {t('footer.rights')}.
          </p>
        </div>
        <div className="footer-section">
          <a href="/privacy" className="footer-link">
            {t('footer.privacy')}
          </a>
          <span className="footer-separator">|</span>
          <a href="/terms" className="footer-link">
            {t('footer.terms')}
          </a>
          <span className="footer-separator">|</span>
          <a href="/contact" className="footer-link">
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
