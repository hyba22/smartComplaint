import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileText, faHistory } from '@fortawesome/free-solid-svg-icons';
import Sidebar from 'app/shared/layout/sidebar/client-sidebar';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';

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

const ClientHistorique = () => {
  const [reclamations, setReclamations] = useState<IReclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadReclamations();
  }, []);

  const loadReclamations = async () => {
    try {
      setLoading(true);
      const response = await axios.get<IReclamation[]>('/api/reclamations');
      // Filter only resolved and closed reclamations
      const historique = response.data.filter(rec => rec.statut === 'RESOLVED' || rec.statut === 'CLOSED');
      setReclamations(historique);
    } catch (error) {
      console.error('Error loading reclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut?: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      RESOLVED: { label: 'Résolu', className: 'bg-green-100 text-green-800' },
      CLOSED: { label: 'Fermé', className: 'bg-gray-100 text-gray-800' },
    };

    const status = statusMap[statut || 'RESOLVED'] || { label: statut || 'Inconnu', className: 'bg-gray-100 text-gray-800' };

    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>{status.label}</span>;
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FontAwesomeIcon icon={faHistory} className="text-slate-600 text-2xl" />
            <h1 className="text-3xl font-bold text-slate-800">Historique</h1>
          </div>
          <p className="text-slate-600">Réclamations résolues et fermées</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Chargement...</p>
            </div>
          ) : reclamations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faFileText} className="text-slate-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucune réclamation dans l&apos;historique</h3>
              <p className="text-slate-600">Les réclamations résolues ou fermées apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Titre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Entreprise</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date de résolution</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
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
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(reclamation.dateResolution)}</td>
                      <td className="px-6 py-4">{getStatusBadge(reclamation.statut)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(reclamation)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientHistorique;
