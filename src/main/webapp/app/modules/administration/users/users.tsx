import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Sidebar from 'app/shared/layout/sidebar/sidebar';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createUser, getUsersAsAdmin, updateUser, deleteUser } from '../user-management/user-management.reducer';

const Users = () => {
  const dispatch = useAppDispatch();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const account = useAppSelector(state => state.authentication.account);
  const adminEntrepriseId = account?.entrepriseId;

  const users = useAppSelector(state => state.userManagement.users);
  const loading = useAppSelector(state => state.userManagement.loading);
  const updating = useAppSelector(state => state.userManagement.updating);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    activated: true,
    role: 'CONSEILLER',
    authorities: ['ROLE_USER', 'ROLE_CONSEILLER'],
    entrepriseId: adminEntrepriseId,
  });

  const generateLogin = (firstName: string, lastName: string) => {
    const first = firstName.toLowerCase().trim().replace(/\s+/g, '');
    const last = lastName.toLowerCase().trim().replace(/\s+/g, '');
    return `${first}${last}`;
  };

  const getAuthoritiesForRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return ['ROLE_USER', 'ROLE_ADMIN'];
      case 'CONSEILLER':
        return ['ROLE_USER', 'ROLE_CONSEILLER'];
      case 'RESPONSABLE':
        return ['ROLE_USER', 'ROLE_RESPONSABLE', 'ROLE_ADMIN'];
      default:
        return ['ROLE_USER', 'ROLE_CONSEILLER'];
    }
  };

  useEffect(() => {
    dispatch(getUsersAsAdmin({}));
  }, [dispatch]);

  const handleAddUser = () => {
    const authorities = getAuthoritiesForRole(newUser.role);
    const generatedLogin = generateLogin(newUser.firstName, newUser.lastName);

    const userDTO = {
      ...newUser,
      login: generatedLogin,
      authorities,
      entrepriseId: adminEntrepriseId,
    };
    dispatch(createUser(userDTO));
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      activated: true,
      role: 'CONSEILLER',
      authorities: ['ROLE_USER', 'ROLE_CONSEILLER'],
      entrepriseId: adminEntrepriseId,
    });
    setShowAddModal(false);
  };

  const handleDeleteUser = login => {
    setUserToDelete(login);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleEditUser = user => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    dispatch(updateUser(editingUser));
    setShowEditModal(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(
    user =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestion des Utilisateurs</h1>
            <p className="text-slate-500">Gérer les utilisateurs et assigner le rôle conseiller</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            Ajouter un Utilisateur
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Chargement des utilisateurs...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Identifiant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Prénom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Activé</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-600">{user.login}</td>
                    <td className="px-6 py-4 text-slate-800">{user.firstName}</td>
                    <td className="px-6 py-4 text-slate-800">{user.lastName}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {user.role || 'UTILISATEUR'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.activated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.activated ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.login)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Confirmer la Suppression</h2>
              <p className="text-slate-600 mb-6">
                Êtes-vous sûr de vouloir supprimer l&apos;utilisateur <strong>{userToDelete}</strong> ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDeleteUser}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Modifier l&apos;Utilisateur</h2>
              <div className="overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Identifiant</label>
                    <input
                      type="text"
                      value={editingUser.login}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
                      placeholder="Identifiant (non modifiable)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={editingUser.firstName}
                      onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={editingUser.lastName}
                      onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez le nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez l'adresse email"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={editingUser.address}
                      onChange={e => setEditingUser({ ...editingUser, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez l'adresse"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-activated"
                      checked={editingUser.activated}
                      onChange={e => setEditingUser({ ...editingUser, activated: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="edit-activated" className="text-sm font-medium text-slate-700">
                      Activé
                    </label>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rôle</label>
                    <select
                      value={editingUser.role}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CONSEILLER">CONSEILLER</option>
                      <option value="RESPONSABLE">RESPONSABLE</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-8 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={updating}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Ajouter un Nouvel Utilisateur</h2>
              <div className="overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez le nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez l'adresse email"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={newUser.address}
                      onChange={e => setNewUser({ ...newUser, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez l'adresse"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rôle *</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CONSEILLER">Conseiller</option>
                      <option value="RESPONSABLE">Responsable</option>
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activated"
                      checked={newUser.activated}
                      onChange={e => setNewUser({ ...newUser, activated: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="activated" className="text-sm font-medium text-slate-700">
                      Activé
                    </label>
                  </div>
                  <div className="col-span-1 sm:col-span-2 bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700">
                      <strong>Note:</strong> L&apos;identifiant sera généré automatiquement à partir du prénom et nom (ex: sourourrachdii).
                      Les nouveaux utilisateurs recevront le rôle sélectionné et le même ID entreprise que l&apos;administrateur. Ils
                      recevront un email avec leur mot de passe temporaire.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-8 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={updating}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Création...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
