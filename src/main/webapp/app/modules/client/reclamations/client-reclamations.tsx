import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileText, faPlus } from '@fortawesome/free-solid-svg-icons';
import Sidebar from 'app/shared/layout/sidebar/client-sidebar';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import AddReclamationModal from './add-reclamation-modal';

interface IReclamation {
  id: number;
  idReclamation: string;
  titre: string;
  description?: string;
  dateDepot?: string;
  dateResolution?: string;
  statut?: string;
  niveau?: string;
  score?: number;
  entreprise?: {
    id: number;
    nom: string;
  };
}

const ClientReclamations = () => {
  const { t } = useTranslation();
  const [reclamations, setReclamations] = useState<IReclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadReclamations();
  }, []);

  const loadReclamations = async () => {
    try {
      setLoading(true);
      const response = await axios.get<IReclamation[]>('/api/reclamations');
      // Filter out resolved and closed reclamations (they go to historique)
      const activeReclamations = response.data.filter(rec => rec.statut !== 'RESOLVED' && rec.statut !== 'CLOSED');
      setReclamations(activeReclamations);
    } catch (error) {
      console.error('Error loading reclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut?: string) => {
    const statusMap: Record<string, { labelKey: string; className: string }> = {
      PENDING: { labelKey: 'reclamations.pending', className: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { labelKey: 'reclamations.inProgress', className: 'bg-blue-100 text-blue-800' },
      RESOLVED: { labelKey: 'reclamations.resolved', className: 'bg-green-100 text-green-800' },
      REJECTED: { labelKey: 'reclamations.rejected', className: 'bg-red-100 text-red-800' },
    };

    const status = statusMap[statut || 'PENDING'] || { labelKey: 'reclamations.unknown', className: 'bg-gray-100 text-gray-800' };

    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>{t(status.labelKey)}</span>;
  };

  const getPriorityBadge = (niveau?: string) => {
    const priorityMap: Record<string, { labelKey: string; className: string; icon: string }> = {
      NIVEAU_1: { labelKey: 'reclamations.normal', className: 'bg-slate-100 text-slate-700 border border-slate-300', icon: '●' },
      NIVEAU_2: { labelKey: 'reclamations.urgent', className: 'bg-orange-100 text-orange-700 border border-orange-300', icon: '●●' },
      NIVEAU_3: { labelKey: 'reclamations.critical', className: 'bg-red-100 text-red-700 border border-red-300', icon: '●●●' },
    };

    const priority = priorityMap[niveau || 'NIVEAU_1'] || {
      labelKey: 'reclamations.unclassified',
      className: 'bg-gray-100 text-gray-600',
      icon: '○',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${priority.className}`}>
        <span className="text-[10px]">{priority.icon}</span>
        {t(priority.labelKey)}
      </span>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const handleViewDetails = (reclamation: IReclamation) => {
    navigate(`/client/reclamations/${reclamation.id}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reclamations.myComplaints')}</h1>
            <p className="text-slate-600">{t('reclamations.manageAndTrack')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t('common.newComplaint')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">{t('common.loading')}</p>
            </div>
          ) : reclamations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faFileText} className="text-slate-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{t('common.noComplaintsCreated')}</h3>
              <p className="text-slate-600 mb-6">{t('common.noComplaintsYet')}</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('common.createFirstComplaint')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.id')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.titre')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('common.company')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.creationDate')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.status')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">{t('reclamations.priority')}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reclamations.map(reclamation => (
                    <tr key={reclamation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{reclamation.idReclamation}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{reclamation.titre}</div>
                        {reclamation.description && (
                          <div className="text-sm text-slate-500 truncate max-w-xs">{reclamation.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{reclamation.entreprise?.nom || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(reclamation.dateDepot)}</td>
                      <td className="px-6 py-4">{getStatusBadge(reclamation.statut)}</td>
                      <td className="px-6 py-4">{getPriorityBadge(reclamation.niveau)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(reclamation)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('reclamations.viewDetails')}
                        >
                          <FontAwesomeIcon icon={faEye} />
                          {t('common.details')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Reclamation Modal */}
        <AddReclamationModal
          showModal={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadReclamations();
          }}
        />
      </main>
    </div>
  );
};

export default ClientReclamations;
