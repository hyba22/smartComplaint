import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faArchive, faCheckCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import Sidebar from 'app/shared/layout/sidebar/sidebar';
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
  dateResolution?: string;
  createdBy?: string;
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  entreprise?: {
    nom: string;
  };
}

const AdminArchive = () => {
  const { t } = useTranslation();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArchivedReclamations();
  }, []);

  const fetchArchivedReclamations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reclamations', {
        params: {
          page: 0,
          size: 1000,
          sort: 'dateResolution,desc',
        },
      });
      const archived = response.data.filter(rec => rec.statut === 'RESOLVED' || rec.statut === 'CLOSED');
      setReclamations(archived);
    } catch (error) {
      console.error('Error fetching archived reclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      RESOLVED: { color: 'bg-green-100 text-green-800', icon: faCheckCircle, labelKey: 'reclamations.resolved' },
      CLOSED: { color: 'bg-gray-100 text-gray-800', icon: faCheckCircle, labelKey: 'reclamations.closed' },
    };

    const config = statusConfig[statut] || statusConfig.RESOLVED;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <FontAwesomeIcon icon={config.icon} className="text-xs" />
        {t(config.labelKey)}
      </span>
    );
  };

  const getPriorityBadge = (niveau: string) => {
    const priorityConfig = {
      NIVEAU_1: { color: 'bg-slate-100 text-slate-700 border border-slate-300', labelKey: 'reclamations.normal', icon: '●' },
      NIVEAU_2: { color: 'bg-orange-100 text-orange-700 border border-orange-300', labelKey: 'reclamations.urgent', icon: '●●' },
      NIVEAU_3: { color: 'bg-red-100 text-red-700 border border-red-300', labelKey: 'reclamations.critical', icon: '●●●' },
    };

    const config = priorityConfig[niveau] || priorityConfig.NIVEAU_1;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <span className="text-[10px]">{config.icon}</span>
        {t(config.labelKey)}
      </span>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (id: number) => {
    navigate(`/admin/reclamations/${id}`);
  };

  const filteredReclamations = reclamations.filter(
    rec =>
      rec.idReclamation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.entreprise?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.assignedTo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.assignedTo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FontAwesomeIcon icon={faArchive} className="text-slate-600 text-2xl" />
            <h1 className="text-3xl font-bold text-slate-800">{t('archive.companyArchiveTitle')}</h1>
          </div>
          <p className="text-slate-600">{t('archive.companyArchiveSubtitle')}</p>
        </div>

        <div className="mb-6 flex justify-end">
          <div className="relative w-96 flex items-center">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center pr-3">
              <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-sm" />
            </span>
            <input
              type="text"
              placeholder={t('archive.searchReclamations')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full ml-4 px-4 py-2.5 pl-10 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">{t('common.loading')}</p>
            </div>
          ) : filteredReclamations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faArchive} className="text-slate-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{searchTerm ? t('archive.noResults') : t('archive.noArchived')}</h3>
              <p className="text-slate-600">{searchTerm ? t('archive.modifySearch') : t('archive.resolvedClosedWillAppear')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.id')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.titre')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('common.company')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('common.advisor')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('archive.resolutionDate')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.status')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.priority')}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredReclamations.map(reclamation => (
                    <tr key={reclamation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{reclamation.idReclamation}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{reclamation.titre}</div>
                        {reclamation.description && (
                          <div className="text-sm text-slate-500 truncate max-w-xs">{reclamation.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{reclamation.entreprise?.nom || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {reclamation.assignedTo
                          ? `${reclamation.assignedTo.firstName} ${reclamation.assignedTo.lastName}`
                          : t('common.notAssigned')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(reclamation.dateResolution)}</td>
                      <td className="px-6 py-4">{getStatusBadge(reclamation.statut)}</td>
                      <td className="px-6 py-4">{getPriorityBadge(reclamation.niveau)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(reclamation.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('reclamations.viewDetails')}
                        >
                          <FontAwesomeIcon icon={faEye} />
                          {t('reclamations.viewDetails')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filteredReclamations.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <p>{t('archive.showingArchived', { count: filteredReclamations.length })}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminArchive;
