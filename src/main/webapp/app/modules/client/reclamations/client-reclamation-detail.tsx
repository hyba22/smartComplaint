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
import Sidebar from 'app/shared/layout/sidebar/client-sidebar';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
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

const ClientReclamationDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [reclamation, setReclamation] = useState<Reclamation | null>(null);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error('Error fetching reclamation:', error);
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
      REJECTED: { color: 'bg-red-100 text-red-800', icon: faExclamationCircle, labelKey: 'reclamations.rejected' },
    };

    const config = statusConfig[statut] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        <FontAwesomeIcon icon={config.icon} />
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
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <span className="text-[10px]">{config.icon}</span>
        {t(config.labelKey)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
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
        <Sidebar />
        <main className="flex-1 ml-[280px] p-6">
          <div className="text-center py-12">
            <p className="text-slate-600">{t('reclamations.notFound')}</p>
            <button onClick={() => navigate('/client/reclamations')} className="mt-4 text-blue-600 hover:underline">
              {t('reclamations.backToList')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/client/reclamations')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>{t('reclamations.backToList')}</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reclamations.details')}</h1>
              <p className="text-slate-600">
                {t('reclamations.id')}: {reclamation.idReclamation}
              </p>
            </div>
            <button
              onClick={() => navigate(`/chat?reclamation=${reclamation.idReclamation}`)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faComments} />
              <span>{t('reclamations.openChat')}</span>
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

            {/* Attachments */}
            {reclamation.pieceJointe && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPaperclip} className="text-blue-600" />
                  {t('reclamations.attachment')}
                </h3>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-2xl" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{t('common.attachedDocument')}</p>
                    <p className="text-xs text-slate-600 mt-1">{t('common.clickToDownloadView')}</p>
                  </div>
                  <a
                    href={getFileUrl(reclamation.pieceJointe)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {t('common.open')}
                  </a>
                </div>
              </div>
            )}

            {/* Feedback */}
            {reclamation.feedbackComment && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('reclamations.yourComment')}</h3>
                <p className="text-slate-600">{reclamation.feedbackComment}</p>
                {reclamation.score && (
                  <div className="mt-4">
                    <span className="text-sm text-slate-600">{t('reclamations.rating')}: </span>
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
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('common.information')}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">{t('reclamations.status')}</p>
                  {getStatusBadge(reclamation.statut)}
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">{t('reclamations.priority')}</p>
                  {getPriorityBadge(reclamation.niveau)}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('common.date')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCalendar} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">{t('reclamations.dateDepot')}</p>
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
                      <p className="text-xs text-slate-600">{t('reclamations.dateResolution')}</p>
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
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('reclamations.assignedTo')}</h3>
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
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('common.company')}</h3>
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

export default ClientReclamationDetail;
