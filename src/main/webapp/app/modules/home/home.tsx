import './home.scss';

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { Authority } from 'app/shared/jhipster/constants';
import LanguageToggle from 'app/shared/layout/language/language-toggle';

export const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const account = useAppSelector(state => state.authentication.account);
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const isAdmin = hasAnyAuthority(account?.authorities, [Authority.ADMIN]);
  const isUser = hasAnyAuthority(account?.authorities, [Authority.USER]);
  const isConseiller = hasAnyAuthority(account?.authorities, [Authority.CONSEILLER]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isConseiller) {
        navigate('/conseiller', { replace: true });
      } else if (isUser) {
        navigate('/client', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isConseiller, isUser, navigate]);

  const sections = [
    {
      titleKey: 'home.serviceListeningTitle',
      descriptionKey: 'home.serviceListeningDesc',
      image: '/content/images/undraw_reviews_bmgj.svg',
      imageAlt: t('home.serviceListeningTitle'),
    },
    {
      titleKey: 'home.trackingTitle',
      descriptionKey: 'home.trackingDesc',
      image: '/content/images/undraw_device-sync_d9ei.svg',
      imageAlt: t('home.trackingTitle'),
    },
    {
      titleKey: 'home.communicationTitle',
      descriptionKey: 'home.communicationDesc',
      image: '/content/images/undraw_text-messages_p6bk.svg',
      imageAlt: t('home.communicationTitle'),
    },
    {
      titleKey: 'home.afterSalesTitle',
      descriptionKey: 'home.afterSalesDesc',
      image: '/content/images/undraw_message-sent_iyz6.svg',
      imageAlt: t('home.afterSalesTitle'),
    },
  ];

  return (
    <div className="home-container">
      <header className="home-hero relative">
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>
        <h1>{t('home.heroTitle')}</h1>
        <p className="home-hero__intro">{t('home.heroIntro')}</p>
        <p className="home-hero__intro">{t('home.afterSalesIntro')}</p>
      </header>

      <div className="home-sections">
        {sections.map((section, index) => (
          <section key={section.titleKey} className={`home-section ${index % 2 === 1 ? 'home-section--reverse' : ''}`}>
            <div className="home-section__text">
              <h2>{t(section.titleKey)}</h2>
              <p>{t(section.descriptionKey)}</p>
            </div>
            <div className="home-section__image">
              <img src={section.image} alt={section.imageAlt} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
