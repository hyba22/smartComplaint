import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faComments, faSearch, faExclamationCircle, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import ConseillerSidebar from 'app/shared/layout/sidebar/conseiller-sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router';

interface Reclamation {
  id: number;
  idReclamation: string;
  titre: string;
  description: string;
  statut: string;
  niveau: string;
  dateDepot: string;
  createdBy?: string;
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  entreprise?: {
    nom: string;
  };
}

const ConseillerReclamations = () => {
  const { t } = useTranslation();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReclamations();
  }, []);

  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reclamations', {
        params: {
          page: 0,
          size: 100,
          sort: 'dateDepot,desc',
        },
      });
      // resolved and closed reclamations go to archive
      const activeReclamations = response.data.filter(rec => rec.statut !== 'RESOLVED' && rec.statut !== 'CLOSED');
      setReclamations(activeReclamations);
    } catch (error) {
      console.error('Error fetching reclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: faClock, labelKey: 'reclamations.pending' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: faClock, labelKey: 'reclamations.inProgress' },
      RESOLVED: { color: 'bg-green-100 text-green-800', icon: faCheckCircle, labelKey: 'reclamations.resolved' },
      CLOSED: { color: 'bg-gray-100 text-gray-800', icon: faCheckCircle, labelKey: 'reclamations.closed' },
    };

    const config = statusConfig[statut] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <FontAwesomeIcon icon={config.icon} className="text-xs" />
        {t(config.labelKey)}
      </span>
    );
  };

  const getPriorityBadge = (niveau: string) => {
    const priorityConfig = {
      NIVEAU_1: { color: 'bg-green-100 text-green-800', labelKey: 'reclamations.normal' },
      NIVEAU_2: { color: 'bg-orange-100 text-orange-800', labelKey: 'reclamations.urgent' },
      NIVEAU_3: { color: 'bg-red-100 text-red-800', labelKey: 'reclamations.critical' },
    };

    const config = priorityConfig[niveau] || priorityConfig.NIVEAU_1;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
        {t(config.labelKey)}
      </span>
    );
  };

  const handleViewDetails = (reclamation: Reclamation) => {
    // Navigate to reclamation details page
    navigate(`/conseiller/reclamations/${reclamation.id}`);
  };

  const handleOpenChat = (reclamation: Reclamation) => {
    if (!reclamation.createdBy) {
      console.error('No client information available for this reclamation');
      return;
    }
    // Navigate to chat page with the client's login and reclam id
    navigate(`/chat?user=${reclamation.createdBy}&reclamationId=${reclamation.id}`);
  };

  const filteredReclamations = reclamations.filter(rec => {
    const matchesSearch =
      rec.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.idReclamation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || rec.statut === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || rec.niveau === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <ConseillerSidebar />
      <main className="flex-1 ml-[280px] p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reclamations.myComplaints')}</h1>
          <p className="text-slate-600">{t('reclamations.manageAssigned')}</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('reclamations.idOrTitle')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">{t('common.allStatuses')}</option>
                <option value="PENDING">{t('reclamations.pending')}</option>
                <option value="IN_PROGRESS">{t('reclamations.inProgress')}</option>
                <option value="RESOLVED">{t('reclamations.resolved')}</option>
                <option value="CLOSED">{t('reclamations.closed')}</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">{t('common.allPriorities')}</option>
                <option value="NIVEAU_1">{t('reclamations.normal')}</option>
                <option value="NIVEAU_2">{t('reclamations.urgent')}</option>
                <option value="NIVEAU_3">{t('reclamations.critical')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">{t('common.total')}</div>
            <div className="text-2xl font-bold text-slate-800">{filteredReclamations.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">{t('reclamations.pending')}</div>
            <div className="text-2xl font-bold text-yellow-600">{filteredReclamations.filter(r => r.statut === 'PENDING').length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">{t('reclamations.inProgress')}</div>
            <div className="text-2xl font-bold text-blue-600">{filteredReclamations.filter(r => r.statut === 'IN_PROGRESS').length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">{t('reclamations.resolved')}</div>
            <div className="text-2xl font-bold text-green-600">{filteredReclamations.filter(r => r.statut === 'RESOLVED').length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('reclamations.id')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('reclamations.titre')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('reclamations.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('reclamations.priority')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('common.date')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">{t('common.loading')}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReclamations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      {t('reclamations.noReclamations')}
                    </td>
                  </tr>
                ) : (
                  filteredReclamations.map(reclamation => (
                    <tr key={reclamation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">{reclamation.idReclamation}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{reclamation.titre}</div>
                        <div className="text-sm text-slate-500 truncate max-w-xs">{reclamation.description}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(reclamation.statut)}</td>
                      <td className="px-6 py-4">{getPriorityBadge(reclamation.niveau)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {new Date(reclamation.dateDepot).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(reclamation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('reclamations.viewDetails')}
                          >
                            <FontAwesomeIcon icon={faEye} className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleOpenChat(reclamation)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t('reclamations.openChat')}
                          >
                            <FontAwesomeIcon icon={faComments} className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConseillerReclamations;
