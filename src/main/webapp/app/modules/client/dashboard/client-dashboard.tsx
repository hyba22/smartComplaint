import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileText } from '@fortawesome/free-solid-svg-icons';
import Sidebar from 'app/shared/layout/sidebar/client-sidebar';
import { useAppSelector } from 'app/config/store';
import { useTranslation } from 'react-i18next';
import AddReclamationModal from '../reclamations/add-reclamation-modal';
import NotificationBell from 'app/shared/layout/notification/notification-bell';
import ThemeToggle from 'app/shared/layout/theme/theme-toggle';
import LanguageToggle from 'app/shared/layout/language/language-toggle';

const ClientDashboard = () => {
  const account = useAppSelector(state => state.authentication.account);
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        {/* Top Bar with Notification Bell */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {t('common.welcome')}, {account?.firstName || account?.login}!
            </h1>
            <p className="text-slate-600">{t('common.manageEasily')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>

        {/* Add Reclamation Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faFileText} className="text-blue-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('reclamations.createNew')}</h2>
            <p className="text-slate-600 mb-8">{t('reclamations.submitAndChoose')}</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-3"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('reclamations.add')}
            </button>
          </div>
        </div>

        {/* Add Reclamation Modal */}
        <AddReclamationModal
          showModal={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
          }}
        />
      </main>
    </div>
  );
};

export default ClientDashboard;
