import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileText,
  faClock,
  faCheckCircle,
  faComments,
  faArrowUp,
  faArrowDown,
  faSearch,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Sidebar from 'app/shared/layout/sidebar/conseiller-sidebar';
import NotificationBell from 'app/shared/layout/notification/notification-bell';
import ThemeToggle from 'app/shared/layout/theme/theme-toggle';
import LanguageToggle from 'app/shared/layout/language/language-toggle';

const ConseillerDashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-96 pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              <FontAwesomeIcon icon={faDownload} className="text-xl" />
            </button>
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faFileText} className="text-blue-600 text-xl" />
              </div>
              <span className="text-green-500 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                12.5%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-1">156</h3>
            <p className="text-slate-500">{t('dashboard.assignedComplaints')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-purple-600 text-xl" />
              </div>
              <span className="text-green-500 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                8.2%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-1">00:18</h3>
            <p className="text-slate-500">{t('common.processingTime')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
              <span className="text-red-500 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowDown} className="mr-1" />
                3.1%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-1">142</h3>
            <p className="text-slate-500">{t('dashboard.resolvedReclamations')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faComments} className="text-orange-600 text-xl" />
              </div>
              <span className="text-green-500 text-sm font-medium">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                15.3%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-1">91%</h3>
            <p className="text-slate-500">{t('common.satisfactionRate')}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.complaintVolume')}</h3>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl">
              <p className="text-slate-400">{t('dashboard.lineChartPlaceholder')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.fileStatus')}</h3>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl">
              <p className="text-slate-400">{t('dashboard.donutChartPlaceholder')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.complaintsByCategory')}</h3>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl">
              <p className="text-slate-400">{t('dashboard.barChartPlaceholder')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.performance')}</h3>
            <div className="text-center">
              <h4 className="text-4xl font-bold text-slate-800 mb-2">{t('dashboard.excellent')}</h4>
              <p className="text-slate-500">{t('dashboard.globalRating')}</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.pendingComplaints')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileText} className="text-red-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-slate-700 font-medium">{t('reclamations.complaint')} #1234</span>
                    <p className="text-slate-500 text-sm">{t('reclamations.highUrgency')}</p>
                  </div>
                </div>
                <span className="text-red-600 text-sm font-medium">2h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileText} className="text-yellow-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-slate-700 font-medium">{t('reclamations.complaint')} #1233</span>
                    <p className="text-slate-500 text-sm">{t('reclamations.mediumUrgency')}</p>
                  </div>
                </div>
                <span className="text-yellow-600 text-sm font-medium">5h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileText} className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-slate-700 font-medium">{t('reclamations.complaint')} #1232</span>
                    <p className="text-slate-500 text-sm">{t('reclamations.lowUrgency')}</p>
                  </div>
                </div>
                <span className="text-blue-600 text-sm font-medium">24h</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.quickActions')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-700">{t('common.newComplaint')}</span>
                <span className="text-blue-600 font-medium">{t('common.create')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-700">{t('common.transferFile')}</span>
                <span className="text-slate-600 font-medium">{t('reclamations.transfer')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-700">{t('common.sendMessage')}</span>
                <span className="text-slate-600 font-medium">{t('common.send')}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-700">{t('common.generateReport')}</span>
                <span className="text-slate-600 font-medium">{t('common.generate')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConseillerDashboard;
