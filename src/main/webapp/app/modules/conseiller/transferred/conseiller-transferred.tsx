import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faFilter, faSearch, faCommentDots, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
import { getFileUrl } from 'app/modules/chat/file-upload.utils';
import ConseillerSidebar from 'app/shared/layout/sidebar/conseiller-sidebar';

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
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  transferredBy?: {
    id: number;
    login: string;
    firstName?: string;
    lastName?: string;
  };
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
}

const ConseillerTransferred = () => {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [filterNiveau, setFilterNiveau] = useState<string>('ALL');
  const [filterStatut, setFilterStatut] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransferredReclamations();
  }, []);

  const fetchTransferredReclamations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reclamations');
      // Filter to show only reclamations assigned to current cc
      const transferred = response.data.filter((rec: Reclamation) => rec.assignedTo != null);
      setReclamations(transferred);
    } catch (error) {
      console.error('Error fetching transferred reclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (niveau?: string) => {
    const priorityMap = {
      NIVEAU_1: { label: 'Normal', color: 'bg-slate-100 text-slate-700 border-slate-300' },
      NIVEAU_2: { label: 'Urgent', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      NIVEAU_3: { label: 'Critique', color: 'bg-red-100 text-red-700 border-red-300' },
    };

    const priority = priorityMap[niveau as keyof typeof priorityMap] || {
      label: niveau || '-',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${priority.color}`}>
        {niveau === 'NIVEAU_3' && <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />}
        {priority.label}
      </span>
    );
  };

  const getStatusBadge = (statut: string) => {
    const statusMap = {
      PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      RESOLVED: { label: 'Résolue', color: 'bg-green-100 text-green-700 border-green-300' },
      CLOSED: { label: 'Fermée', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    };

    const status = statusMap[statut as keyof typeof statusMap] || {
      label: statut,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>{status.label}</span>;
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleContactClient = (reclamation: Reclamation) => {
    // Navigate to chat with the client who created this reclamation
    if (reclamation.createdBy) {
      navigate(`/chat?user=${reclamation.createdBy}`);
    }
  };

  const filteredReclamations = reclamations.filter(rec => {
    const matchesNiveau = filterNiveau === 'ALL' || rec.niveau === filterNiveau;
    const matchesStatut = filterStatut === 'ALL' || rec.statut === filterStatut;
    const matchesSearch =
      searchTerm === '' ||
      rec.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.idReclamation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.createdBy && rec.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesNiveau && matchesStatut && matchesSearch;
  });

  const stats = {
    total: reclamations.length,
    niveau1: reclamations.filter(r => r.niveau === 'NIVEAU_1').length,
    niveau2: reclamations.filter(r => r.niveau === 'NIVEAU_2').length,
    niveau3: reclamations.filter(r => r.niveau === 'NIVEAU_3').length,
    pending: reclamations.filter(r => r.statut === 'PENDING').length,
    inProgress: reclamations.filter(r => r.statut === 'IN_PROGRESS').length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ConseillerSidebar />
      <main className="flex-1 ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Demandes transférées</h1>
            <p className="text-slate-600">Réclamations qui vous ont été assignées par l&apos;administrateur</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total assigné</div>
              <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">En attente</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">En cours</div>
              <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Critiques</div>
              <div className="text-3xl font-bold text-red-600">{stats.niveau3}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="ID, titre ou client..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Priorité
                </label>
                <select
                  value={filterNiveau}
                  onChange={e => setFilterNiveau(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Toutes</option>
                  <option value="NIVEAU_3">Critique</option>
                  <option value="NIVEAU_2">Urgent</option>
                  <option value="NIVEAU_1">Normal</option>
                </select>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                <select
                  value={filterStatut}
                  onChange={e => setFilterStatut(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Tous</option>
                  <option value="PENDING">En attente</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="RESOLVED">Résolue</option>
                  <option value="CLOSED">Fermée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Titre</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Priorité</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Transféré par</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredReclamations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          {reclamations.length === 0
                            ? 'Aucune réclamation transférée pour le moment'
                            : 'Aucune réclamation trouvée avec ces filtres'}
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
                                <div className="text-sm font-medium text-slate-800 truncate">{reclamation.titre}</div>
                                {reclamation.entreprise && <div className="text-xs text-slate-500 mt-1">{reclamation.entreprise.nom}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4">{getPriorityBadge(reclamation.niveau)}</td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-600">
                                {reclamation.transferredBy
                                  ? `${reclamation.transferredBy.firstName || ''} ${reclamation.transferredBy.lastName || ''}`.trim() ||
                                    reclamation.transferredBy.login
                                  : 'Admin'}
                              </span>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(reclamation.statut)}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleRowExpansion(reclamation.id)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Voir détails"
                                >
                                  <FontAwesomeIcon icon={expandedRow === reclamation.id ? faChevronUp : faChevronDown} />
                                </button>
                                <button
                                  onClick={() => handleContactClient(reclamation)}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  title="Contacter le client"
                                >
                                  <FontAwesomeIcon icon={faCommentDots} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRow === reclamation.id && (
                            <tr className="bg-slate-50">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Détails de la réclamation</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Description</p>
                                      <p className="text-sm text-slate-800 mt-1">{reclamation.description || 'Aucune description'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Créé par</p>
                                      <p className="text-sm text-slate-800 mt-1">{reclamation.createdBy || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Date de création</p>
                                      <p className="text-sm text-slate-800 mt-1">
                                        {reclamation.createdDate ? new Date(reclamation.createdDate).toLocaleString('fr-FR') : '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Score</p>
                                      <p className="text-sm text-slate-800 mt-1">
                                        {reclamation.score !== undefined ? reclamation.score : '-'}
                                      </p>
                                    </div>
                                    {reclamation.pieceJointe && (
                                      <div>
                                        <p className="text-sm font-medium text-slate-600">Pièce jointe</p>
                                        <a
                                          href={getFileUrl(reclamation.pieceJointe)}
                                          className="text-sm text-blue-600 hover:underline mt-1"
                                        >
                                          Télécharger
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-slate-200">
                                    <button
                                      onClick={() => handleContactClient(reclamation)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                      <FontAwesomeIcon icon={faCommentDots} />
                                      Contacter le client
                                    </button>
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
            )}
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-slate-600 text-center">
            Affichage de {filteredReclamations.length} sur {reclamations.length} réclamations transférées
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConseillerTransferred;
