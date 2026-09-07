import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

type RegisterCardProps = {
  type: 'client' | 'entreprise';
  title: string;
  description: string;
  icon: string;
  onChoose: () => void;
};

const RegisterCard = ({ type, title, description, icon, onChoose }: RegisterCardProps) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onChoose}
      className="group flex flex-col items-center justify-between rounded-3xl bg-white/80 p-10 text-left shadow-card ring-1 ring-white/40 backdrop-blur transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl hover:ring-sc-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-sc-accent"
      data-cy={`register-${type}-card`}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sc-primary/15 to-sc-accent/25 text-sc-primary">
        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="w-full text-center">
        <h3 className="font-semibold text-xl text-sc-primary">{title}</h3>
        <p className="mt-2 text-sm text-sc-muted">{description}</p>
        <span className="mt-6 inline-flex items-center text-sm font-semibold text-sc-accent transition-transform group-hover:translate-x-1">
          {t('home.chooseThisProfile')} &rarr;
        </span>
      </div>
    </button>
  );
};

type RegisterCardType = {
  type: 'client' | 'entreprise';
  icon: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
};

const RegisterPage = () => {
  const { t } = useTranslation();

  const cards: RegisterCardType[] = [
    {
      type: 'client',
      icon: '👤',
      titleKey: 'home.client',
      descriptionKey: 'home.clientDescription',
      path: '/account/register/client',
    },
    {
      type: 'entreprise',
      icon: '🏢',
      titleKey: 'home.company',
      descriptionKey: 'home.companyDescription',
      path: '/account/register/entreprise',
    },
  ];

  return (
    <div className="min-h-screen w-full px-6 py-20 sm:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sc-accent">{t('home.title')}</p>
          <h1 className="text-4xl font-semibold text-sc-primary sm:text-5xl">
            {t('home.welcomeTo')} {t('home.title')}
          </h1>
          <p className="text-lg text-sc-muted">{t('home.registerSubtitle')}</p>
        </div>

        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cards.map(card => (
            <RegisterCard
              key={card.type}
              type={card.type}
              title={t(card.titleKey)}
              description={t(card.descriptionKey)}
              icon={card.icon}
              onChoose={() => (window.location.href = card.path)}
            />
          ))}
        </div>

        <div className="text-sm text-sc-muted">
          {t('home.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-semibold text-sc-primary underline decoration-sc-accent decoration-2 underline-offset-4">
            {t('header.login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
