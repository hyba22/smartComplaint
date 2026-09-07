import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faFilter,
  faSearch,
  faExchangeAlt,
  faTimes,
  faChevronDown,
  faChevronUp,
  faPaperclip,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { getFileUrl } from 'app/modules/chat/file-upload.utils';
import Sidebar from 'app/shared/layout/sidebar/sidebar';

interface Reclamation {
  id: number;
  idReclamation: string;
  titre: string;
  description: string;
  statut: string;
  niveau: string;
  dateDepot: string;
  classificationMethod?: string;
  classificationConfidence?: number;
  assignedTo?: {
    id: number;
    login: string;
    firstName?: string;
    lastName?: string;
  };
  entreprise?: {
    id: number;
    nom: string;
  };
  pieceJointe?: string;
  score?: number;
  createdBy?: string;
  createdDate?: string;
}

interface Conseiller {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  online: boolean;
  activeReclamationsCount: number;
}

const AdminReclamations = () => {
  const { t } = useTranslation();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [filterNiveau, setFilterNiveau] = useState<string>('ALL');
  const [filterStatut, setFilterStatut] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);
  const [conseillers, setConseillers] = useState<Conseiller[]>([]);
  const [selectedConseiller, setSelectedConseiller] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetchReclamations();
  }, []);

  const fetchReclamations = async () => {
    try {
      const response = await axios.get('/api/reclamations');
      setReclamations(response.data);
    } catch (error) {
      console.error('Error fetching reclamations:', error);
    }
  };

  const fetchConseillers = async () => {
    try {
      const response = await axios.get('/api/reclamations/conseillers');
      setConseillers(response.data);
    } catch (error) {
      console.error('Error fetching conseillers:', error);
    }
  };

  const handleTransferClick = (reclamation: Reclamation) => {
    setSelectedReclamation(reclamation);
    setSelectedConseiller(null);
    setShowTransferModal(true);
    fetchConseillers();
  };

  const handleTransferConfirm = async () => {
    if (!selectedReclamation || !selectedConseiller) return;

    try {
      setTransferring(true);
      await axios.put(`/api/reclamations/${selectedReclamation.id}/transfer/${selectedConseiller}`);
      await fetchReclamations();
      setShowTransferModal(false);
      setSelectedReclamation(null);
      setSelectedConseiller(null);
    } catch (error) {
      console.error('Error transferring reclamation:', error);
      alert(t('reclamations.transferError'));
    } finally {
      setTransferring(false);
    }
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getPriorityBadge = (niveau?: string) => {
    const priorityMap = {
      NIVEAU_1: { labelKey: 'reclamations.normal', color: 'bg-slate-100 text-slate-700 border-slate-300' },
      NIVEAU_2: { labelKey: 'reclamations.urgent', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      NIVEAU_3: { labelKey: 'reclamations.critical', color: 'bg-red-100 text-red-700 border-red-300' },
    };

    const priority = priorityMap[niveau as keyof typeof priorityMap] || {
      labelKey: 'reclamations.unclassified',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${priority.color}`}>
        {niveau === 'NIVEAU_3' && <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />}
        {t(priority.labelKey)}
      </span>
    );
  };

  const getStatusBadge = (statut: string) => {
    const statusMap = {
      PENDING: { labelKey: 'reclamations.pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      IN_PROGRESS: { labelKey: 'reclamations.inProgress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      RESOLVED: { labelKey: 'reclamations.resolved', color: 'bg-green-100 text-green-700 border-green-300' },
      CLOSED: { labelKey: 'reclamations.closed', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    };

    const status = statusMap[statut as keyof typeof statusMap] || {
      labelKey: 'reclamations.unknown',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${status.color}`}>{t(status.labelKey)}</span>
    );
  };

  const getMethodBadge = (method?: string, confidence?: number) => {
    if (!method) return <span className="text-xs text-slate-400">-</span>;

    const methodMap = {
      KEYWORD: { labelKey: 'common.keyword', color: 'bg-green-50 text-green-700', icon: '🔤' },
      AI: { labelKey: 'common.ai', color: 'bg-purple-50 text-purple-700', icon: '🤖' },
      MANUAL: { labelKey: 'common.manual', color: 'bg-blue-50 text-blue-700', icon: '👤' },
    };

    const methodInfo = methodMap[method as keyof typeof methodMap] || {
      labelKey: 'common.unknown',
      color: 'bg-gray-50 text-gray-700',
      icon: '❓',
    };

    return (
      <div className="flex flex-col gap-1">
        <span className={`px-2 py-1 rounded text-xs font-medium ${methodInfo.color}`}>
          {methodInfo.icon} {t(methodInfo.labelKey)}
        </span>
        {confidence && <span className="text-xs text-slate-500">{confidence.toFixed(1)}%</span>}
      </div>
    );
  };

  const filteredReclamations = reclamations.filter(rec => {
    const matchesNiveau = filterNiveau === 'ALL' || rec.niveau === filterNiveau;
    const matchesStatut = filterStatut === 'ALL' || rec.statut === filterStatut;
    const matchesSearch =
      searchTerm === '' ||
      rec.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.idReclamation.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesNiveau && matchesStatut && matchesSearch;
  });

  const stats = {
    total: reclamations.length,
    niveau1: reclamations.filter(r => r.niveau === 'NIVEAU_1').length,
    niveau2: reclamations.filter(r => r.niveau === 'NIVEAU_2').length,
    niveau3: reclamations.filter(r => r.niveau === 'NIVEAU_3').length,
    pending: reclamations.filter(r => r.statut === 'PENDING').length,
    keywordClassified: reclamations.filter(r => r.classificationMethod === 'KEYWORD').length,
    aiClassified: reclamations.filter(r => r.classificationMethod === 'AI').length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('reclamations.management')}</h1>
            <p className="text-slate-600">{t('reclamations.aiOverview')}</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">{t('common.total')}</div>
              <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">{t('reclamations.pending')}</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">{t('reclamations.critical')}</div>
              <div className="text-3xl font-bold text-red-600">{stats.niveau3}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">{t('reclamations.aiClassification')}</div>
              <div className="text-sm text-slate-500 mt-2">
                🔤 {stats.keywordClassified} | 🤖 {stats.aiClassified}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  {t('reclamations.searchBy')}
                </label>
                <input
                  type="text"
                  placeholder={t('reclamations.idOrTitle')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  {t('reclamations.priority')}
                </label>
                <select
                  value={filterNiveau}
                  onChange={e => setFilterNiveau(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">{t('common.all')}</option>
                  <option value="NIVEAU_3">{t('reclamations.critical')}</option>
                  <option value="NIVEAU_2">{t('reclamations.urgent')}</option>
                  <option value="NIVEAU_1">{t('reclamations.normal')}</option>
                </select>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('reclamations.status')}</label>
                <select
                  value={filterStatut}
                  onChange={e => setFilterStatut(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">{t('common.all')}</option>
                  <option value="PENDING">{t('reclamations.pending')}</option>
                  <option value="IN_PROGRESS">{t('reclamations.inProgress')}</option>
                  <option value="RESOLVED">{t('reclamations.resolved')}</option>
                  <option value="CLOSED">{t('reclamations.closed')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
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
                      {t('reclamations.priority')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {t('reclamations.status')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {t('reclamations.classification')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {t('reclamations.assignedTo')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {t('common.date')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredReclamations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        {t('reclamations.noReclamations')}
                      </td>
                    </tr>
                  ) : (
                    filteredReclamations.map(reclamation => (
                      <React.Fragment key={reclamation.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-slate-600">{reclamation.idReclamation}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm font-medium text-slate-800 truncate flex items-center gap-2">
                                {reclamation.titre}
                                {reclamation.pieceJointe && (
                                  <FontAwesomeIcon
                                    icon={faPaperclip}
                                    className="text-blue-600 text-xs"
                                    title={t('reclamations.attachment')}
                                  />
                                )}
                              </div>
                              {reclamation.entreprise && <div className="text-xs text-slate-500 mt-1">{reclamation.entreprise.nom}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4">{getPriorityBadge(reclamation.niveau)}</td>
                          <td className="px-6 py-4 min-w-[120px]">{getStatusBadge(reclamation.statut)}</td>
                          <td className="px-6 py-4">
                            {getMethodBadge(reclamation.classificationMethod, reclamation.classificationConfidence)}
                          </td>
                          <td className="px-6 py-4">
                            {reclamation.assignedTo ? (
                              <span className="text-sm text-slate-600">
                                {reclamation.assignedTo.firstName} {reclamation.assignedTo.lastName}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400 italic">{t('common.notAssigned')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{new Date(reclamation.dateDepot).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleRowExpansion(reclamation.id)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title={t('reclamations.viewDetails')}
                              >
                                <FontAwesomeIcon icon={expandedRow === reclamation.id ? faChevronUp : faChevronDown} />
                              </button>
                              <button
                                onClick={() => handleTransferClick(reclamation)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title={t('reclamations.transfer')}
                              >
                                <FontAwesomeIcon icon={faExchangeAlt} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === reclamation.id && (
                          <tr className="bg-slate-50">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('reclamations.details')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">{t('common.description')}</p>
                                    <p className="text-sm text-slate-800 mt-1">{reclamation.description || t('common.noDescription')}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">{t('reclamations.createdBy')}</p>
                                    <p className="text-sm text-slate-800 mt-1">{reclamation.createdBy || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">{t('reclamations.creationDate')}</p>
                                    <p className="text-sm text-slate-800 mt-1">
                                      {reclamation.createdDate ? new Date(reclamation.createdDate).toLocaleString('fr-FR') : '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">{t('common.score')}</p>
                                    <p className="text-sm text-slate-800 mt-1">
                                      {reclamation.score !== undefined ? reclamation.score : '-'}
                                    </p>
                                  </div>
                                  {reclamation.pieceJointe && (
                                    <div className="col-span-2">
                                      <p className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPaperclip} className="text-blue-600" />
                                        {t('reclamations.attachment')}
                                      </p>
                                      <a
                                        href={getFileUrl(reclamation.pieceJointe)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                      >
                                        <FontAwesomeIcon icon={faPaperclip} />
                                        {t('common.openDocument')}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-slate-600 text-center">
            {t('reclamations.showingCount', { count: filteredReclamations.length, total: reclamations.length })}
          </div>
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">{t('reclamations.transferComplaint')}</h2>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedReclamation && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-600">{t('reclamations.title')}</p>
                  <p className="text-lg font-semibold text-slate-800">{selectedReclamation.titre}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {t('reclamations.id')}: {selectedReclamation.idReclamation}
                  </p>
                </div>
              )}

              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('reclamations.selectAdvisor')}</h3>

              <div className="space-y-2">
                {conseillers.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">{t('reclamations.noAdvisorAvailable')}</p>
                ) : (
                  conseillers.map(conseiller => (
                    <div
                      key={conseiller.id}
                      onClick={() => setSelectedConseiller(conseiller.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedConseiller === conseiller.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-medium ${conseiller.online ? 'text-green-600' : 'text-slate-800'}`}>
                              {conseiller.firstName} {conseiller.lastName}
                            </span>
                            {conseiller.online && (
                              <span className="flex items-center">
                                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{conseiller.email}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {t('common.activeComplaintsCount', { count: conseiller.activeReclamationsCount })}
                          </p>
                        </div>
                        {selectedConseiller === conseiller.id && (
                          <div className="ml-4">
                            <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={transferring}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleTransferConfirm}
                disabled={!selectedConseiller || transferring}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  !selectedConseiller || transferring
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {transferring ? t('reclamations.transferInProgress') : t('reclamations.confirmTransfer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReclamations;
