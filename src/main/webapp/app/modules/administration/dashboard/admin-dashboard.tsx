import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faArrowUp,
  faSearch,
  faDownload,
  faComments,
  faClipboardList,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Sidebar from 'app/shared/layout/sidebar/sidebar';
import NotificationBell from 'app/shared/layout/notification/notification-bell';
import ThemeToggle from 'app/shared/layout/theme/theme-toggle';
import LanguageToggle from 'app/shared/layout/language/language-toggle';

interface DashboardStatistics {
  totalReclamations: number;
  pendingReclamations: number;
  inProgressReclamations: number;
  resolvedReclamations: number;
  closedReclamations: number;
  totalUsers: number;
  totalClients: number;
  totalConseillers: number;
  totalAdmins: number;
  activeUsers: number;
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  reclamationsByLevel: Record<string, number>;
  reclamationsByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  reclamationsOverTime: Record<string, number>;
  conversationsOverTime: Record<string, number>;
}

const getStatusColor = (status: string): string => {
  if (status === 'PENDING') return '#f97316';
  if (status === 'IN_PROGRESS') return '#3b82f6';
  if (status === 'RESOLVED') return '#22c55e';
  return '#6b7280';
};

const getRoleColor = (role: string): string => {
  if (role === 'CLIENT') return '#3b82f6';
  if (role === 'CONSEILLER') return '#22c55e';
  if (role === 'RESPONSABLE') return '#a855f7';
  return '#f97316';
};

const getLevelColor = (level: string): string => {
  if (level === 'Level 1') return '#22c55e';
  if (level === 'Level 2') return '#f97316';
  return '#ef4444';
};

const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-500">{t('dashboard.loadingStats')}</div>
        </div>
      </main>
    </div>
  );
};

const ErrorState = ({ error }: { error: string | null }) => (
  <div className="flex min-h-screen bg-slate-100">
    <Sidebar />
    <main className="flex-1 ml-[280px] p-6">
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    </main>
  </div>
);

const StatCard = ({ title, value, icon, color, percentage, subtitle }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon} className={`${color.replace('bg-', 'text-')} text-xl`} />
      </div>
      {percentage && (
        <span className="text-green-500 text-sm font-medium">
          <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
          {percentage}
        </span>
      )}
      {subtitle && !percentage && <span className="text-orange-500 text-sm font-medium">{subtitle}</span>}
    </div>
    <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
    <p className="text-slate-500">{title}</p>
  </div>
);

const StatusChart = ({ statistics }: { statistics: DashboardStatistics }) => {
  const { t } = useTranslation();
  return (
    <div className="h-64 flex items-center justify-around">
      {statistics?.reclamationsByStatus && Object.keys(statistics.reclamationsByStatus).length > 0 ? (
        Object.entries(statistics.reclamationsByStatus).map(([status, count]) => (
          <div key={status} className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: getStatusColor(status), color: 'white' }}
            >
              <span className="text-xl font-bold">{count}</span>
            </div>
            <p className="text-sm text-slate-600">{status}</p>
          </div>
        ))
      ) : (
        <p className="text-slate-400">{t('dashboard.noDataAvailable')}</p>
      )}
    </div>
  );
};

const RoleChart = ({ statistics }: { statistics: DashboardStatistics }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {statistics?.usersByRole && Object.keys(statistics.usersByRole).length > 0 ? (
        Object.entries(statistics.usersByRole).map(([role, count]) => (
          <div key={role} className="flex items-center justify-between">
            <span className="text-slate-700">{role}</span>
            <div className="flex items-center gap-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(count / statistics.totalUsers) * 100}px`,
                  backgroundColor: getRoleColor(role),
                }}
              />
              <span className="text-slate-600 font-medium">{count}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-slate-400 text-center">{t('dashboard.noDataAvailable')}</p>
      )}
    </div>
  );
};

const LevelChart = ({ statistics }: { statistics: DashboardStatistics }) => {
  const { t } = useTranslation();
  return (
    <div className="h-64 flex items-center justify-around">
      {statistics?.reclamationsByLevel && Object.keys(statistics.reclamationsByLevel).length > 0 ? (
        Object.entries(statistics.reclamationsByLevel).map(([level, count]) => (
          <div key={level} className="text-center">
            <div className="w-20 flex flex-col justify-end items-center" style={{ height: '180px' }}>
              <div
                className="w-8 rounded-t"
                style={{
                  height: `${Math.min((count / statistics.totalReclamations) * 100, 100)}%`,
                  backgroundColor: getLevelColor(level),
                }}
              />
            </div>
            <p className="text-sm text-slate-600 mt-2">{level}</p>
            <p className="text-xs text-slate-500">{count}</p>
          </div>
        ))
      ) : (
        <p className="text-slate-400">{t('dashboard.noDataAvailable')}</p>
      )}
    </div>
  );
};

const UserDetails = ({ statistics }: { statistics: DashboardStatistics }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <UserDetailItem
        icon={faUsers}
        color="bg-blue-100"
        iconColor="text-blue-600"
        label={t('dashboard.clients')}
        value={statistics?.totalClients || 0}
      />
      <UserDetailItem
        icon={faUsers}
        color="bg-green-100"
        iconColor="text-green-600"
        label={t('dashboard.advisors')}
        value={statistics?.totalConseillers || 0}
      />
      <UserDetailItem
        icon={faUsers}
        color="bg-purple-100"
        iconColor="text-purple-600"
        label={t('dashboard.admins')}
        value={statistics?.totalAdmins || 0}
      />
      <UserDetailItem
        icon={faCheckCircle}
        color="bg-orange-100"
        iconColor="text-orange-600"
        label={t('dashboard.activeUsers')}
        value={statistics?.activeUsers || 0}
      />
    </div>
  );
};

const UserDetailItem = ({ icon, color, iconColor, label, value }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon} className={`${iconColor} text-sm`} />
      </div>
      <span className="text-slate-700">{label}</span>
    </div>
    <span className="text-slate-600 font-medium">{value}</span>
  </div>
);

const ReclamationDetails = ({ statistics }: { statistics: DashboardStatistics }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <ReclamationDetailItem label={t('dashboard.pending')} value={statistics?.pendingReclamations || 0} />
      <ReclamationDetailItem label={t('dashboard.inProgress')} value={statistics?.inProgressReclamations || 0} />
      <ReclamationDetailItem label={t('dashboard.resolved')} value={statistics?.resolvedReclamations || 0} />
      <ReclamationDetailItem label={t('dashboard.closed')} value={statistics?.closedReclamations || 0} />
    </div>
  );
};

const ReclamationDetailItem = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100">
    <span className="text-slate-700">{label}</span>
    <span className="text-slate-600 font-medium">{value}</span>
  </div>
);

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStatistics();
  }, []);

  const fetchDashboardStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get<DashboardStatistics>('/api/dashboard/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!statistics) return <LoadingState />;

  const resolutionRate = ((statistics.resolvedReclamations / statistics.totalReclamations) * 100).toFixed(1);
  const activeUserRate = ((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        <TopBar />
        <StatsCards statistics={statistics} resolutionRate={resolutionRate} activeUserRate={activeUserRate} />
        <ChartsSection statistics={statistics} />
        <DetailsSection statistics={statistics} />
      </main>
    </div>
  );
};

const TopBar = () => {
  const { t } = useTranslation();
  return (
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
  );
};

const StatsCards = ({ statistics, resolutionRate, activeUserRate }: any) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      <StatCard
        title={t('dashboard.totalReclamations')}
        value={statistics?.totalReclamations || 0}
        icon={faClipboardList}
        color="bg-blue-100"
        percentage={resolutionRate}
      />
      <StatCard
        title={t('dashboard.pendingReclamations')}
        value={statistics?.pendingReclamations || 0}
        icon={faExclamationTriangle}
        color="bg-orange-100"
        subtitle={t('reclamations.pending')}
      />
      <StatCard
        title={t('dashboard.totalUsers')}
        value={statistics?.totalUsers || 0}
        icon={faUsers}
        color="bg-purple-100"
        percentage={activeUserRate}
      />
      <StatCard
        title={t('dashboard.activeConversations')}
        value={statistics?.activeConversations || 0}
        icon={faComments}
        color="bg-green-100"
        subtitle={t('chat.online')}
      />
    </div>
  );
};

const ChartsSection = ({ statistics }: { statistics: DashboardStatistics }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.reclamationsByStatus')}</h3>
          <StatusChart statistics={statistics} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.usersByRole')}</h3>
          <RoleChart statistics={statistics} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.reclamationsByLevel')}</h3>
          <LevelChart statistics={statistics} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.messagesStats')}</h3>
          <div className="text-center">
            <h4 className="text-4xl font-bold text-slate-800 mb-2">{statistics?.totalMessages || 0}</h4>
            <p className="text-slate-500">{t('dashboard.totalMessages')}</p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{statistics?.totalConversations || 0}</span> {t('dashboard.conversations')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DetailsSection = ({ statistics }: { statistics: DashboardStatistics }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.userDetails')}</h3>
        <UserDetails statistics={statistics} />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">{t('dashboard.reclamationDetails')}</h3>
        <ReclamationDetails statistics={statistics} />
      </div>
    </div>
  );
};

export default AdminDashboard;
