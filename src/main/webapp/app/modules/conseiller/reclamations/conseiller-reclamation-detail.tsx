import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faComments,
  faCalendar,
  faUser,
  faBuilding,
  faExclamationCircle,
  faCheckCircle,
  faClock,
  faPaperclip,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import ConseillerSidebar from 'app/shared/layout/sidebar/conseiller-sidebar';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import { getFileUrl } from 'app/modules/chat/file-upload.utils';

interface Reclamation {
  id: number;
  idReclamation: string;
  titre: string;
  description: string;
  statut: string;
  niveau: string;
  dateDepot: string;
  dateResolution?: string;
  pieceJointe?: string;
  score?: number;
  feedbackComment?: string;
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  entreprise?: {
    id: number;
    nom: string;
  };
  createdBy?: string;
}

const ConseillerReclamationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [reclamation, setReclamation] = useState<Reclamation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchReclamation();
    }
  }, [id]);

  const fetchReclamation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reclamations/${id}`);
      setReclamation(response.data);
      setNewStatus(response.data.statut);
    } catch (error) {
      console.error('Error fetching reclamation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!reclamation || newStatus === reclamation.statut) return;

    try {
      setUpdating(true);
      await axios.put(`/api/reclamations/${id}`, {
        ...reclamation,
        statut: newStatus,
        dateResolution: newStatus === 'RESOLVED' || newStatus === 'CLOSED' ? new Date().toISOString() : reclamation.dateResolution,
      });
      await fetchReclamation();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: faClock, label: 'En attente' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: faClock, label: 'En cours' },
      RESOLVED: { color: 'bg-green-100 text-green-800', icon: faCheckCircle, label: 'Résolu' },
      CLOSED: { color: 'bg-gray-100 text-gray-800', icon: faCheckCircle, label: 'Fermé' },
    };

    const config = statusConfig[statut] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (niveau: string) => {
    const priorityConfig = {
      NIVEAU_1: { color: 'bg-green-100 text-green-800', label: 'Normal' },
      NIVEAU_2: { color: 'bg-orange-100 text-orange-800', label: 'Urgent' },
      NIVEAU_3: { color: 'bg-red-100 text-red-800', label: 'Critique' },
    };

    const config = priorityConfig[niveau] || priorityConfig.NIVEAU_1;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        <FontAwesomeIcon icon={faExclamationCircle} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <ConseillerSidebar />
        <main className="flex-1 ml-[280px] p-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!reclamation) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <ConseillerSidebar />
        <main className="flex-1 ml-[280px] p-6">
          <div className="text-center py-12">
            <p className="text-slate-600">Réclamation non trouvée</p>
            <button onClick={() => navigate('/conseiller/reclamations')} className="mt-4 text-blue-600 hover:underline">
              Retour à la liste
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <ConseillerSidebar />
      <main className="flex-1 ml-[280px] p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/conseiller/reclamations')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Retour aux réclamations</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Détails de la réclamation</h1>
              <p className="text-slate-600">ID: {reclamation.idReclamation}</p>
            </div>
            <button
              onClick={() => navigate(`/chat?reclamation=${reclamation.idReclamation}`)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faComments} />
              <span>Ouvrir le chat</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{reclamation.titre}</h2>
              <p className="text-slate-600 leading-relaxed">{reclamation.description}</p>
            </div>

            {/* Status Update */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Mettre à jour le statut</h3>
              <div className="flex items-center gap-4">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">En attente</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="RESOLVED">Résolu</option>
                  <option value="CLOSED">Fermé</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === reclamation.statut}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </div>

            {/* Attachments */}
            {reclamation.pieceJointe && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPaperclip} className="text-blue-600" />
                  Pièce jointe
                </h3>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-2xl" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Document attaché</p>
                    <p className="text-xs text-slate-600 mt-1">Cliquez pour télécharger ou visualiser</p>
                  </div>
                  <a
                    href={getFileUrl(reclamation.pieceJointe)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Ouvrir
                  </a>
                </div>
              </div>
            )}

            {/* Feedback */}
            {reclamation.feedbackComment && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Commentaire du client</h3>
                <p className="text-slate-600">{reclamation.feedbackComment}</p>
                {reclamation.score && (
                  <div className="mt-4">
                    <span className="text-sm text-slate-600">Note: </span>
                    <span className="text-lg font-semibold text-yellow-600">{reclamation.score}/5</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Informations</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Statut</p>
                  {getStatusBadge(reclamation.statut)}
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Priorité</p>
                  {getPriorityBadge(reclamation.niveau)}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCalendar} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Date de dépôt</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(reclamation.dateDepot).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {reclamation.dateResolution && (
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    <div>
                      <p className="text-xs text-slate-600">Date de résolution</p>
                      <p className="text-sm font-medium text-slate-800">
                        {new Date(reclamation.dateResolution).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned To */}
            {reclamation.assignedTo && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Assigné à</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {reclamation.assignedTo.firstName} {reclamation.assignedTo.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{reclamation.assignedTo.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enterprise */}
            {reclamation.entreprise && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Entreprise</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faBuilding} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{reclamation.entreprise.nom}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConseillerReclamationDetail;
