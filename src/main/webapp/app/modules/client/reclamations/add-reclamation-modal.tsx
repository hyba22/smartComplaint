import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faBuilding } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface IEntreprise {
  id: number;
  nomEntreprise: string;
  idEntreprise: string;
}

interface IAddReclamationModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddReclamationModal = ({ showModal, onClose, onSuccess }: IAddReclamationModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    entrepriseId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [entreprises, setEntreprises] = useState<IEntreprise[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEntreprises, setLoadingEntreprises] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showModal) {
      loadEntreprises();
    }
  }, [showModal]);

  const loadEntreprises = async () => {
    try {
      setLoadingEntreprises(true);
      const response = await axios.get<IEntreprise[]>('/api/entreprises/list');
      setEntreprises(response.data);
    } catch (err) {
      console.error('Error loading entreprises:', err);
    } finally {
      setLoadingEntreprises(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate unique ID for reclamation
      const idReclamation = `REC-${Date.now()}`;

      // Upload file first if selected
      let pieceJointeUrl = '';
      if (selectedFile) {
        console.error('Uploading file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);
        try {
          const uploadResponse = await axios.post('/api/files/upload', fileFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          pieceJointeUrl = uploadResponse.data.url || '';
          console.error('File uploaded successfully. URL:', pieceJointeUrl);
        } catch (uploadErr) {
          console.error('File upload failed:', uploadErr);
          if (axios.isAxiosError(uploadErr)) {
            console.error('Upload error details:', uploadErr.response?.data);
          }
          // Continue without file if upload fails
        }
      }

      const reclamationData = {
        idReclamation,
        titre: formData.titre,
        description: formData.description,
        pieceJointe: pieceJointeUrl,
        dateDepot: new Date().toISOString(),
        statut: 'PENDING',
        // niveau: removed - let backend AI classify automatically
        score: 0,
        entrepriseId: formData.entrepriseId ? parseInt(formData.entrepriseId, 10) : null,
      };

      console.error('Creating reclamation with data:', reclamationData);
      await axios.post('/api/reclamations', reclamationData);

      // Reset form
      setFormData({
        titre: '',
        description: '',
        entrepriseId: '',
      });
      setSelectedFile(null);

      // Show success toast
      toast.success(t('reclamations.createSuccess'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Close modal and trigger success callback
      onSuccess();
    } catch (err) {
      console.error('Error creating reclamation:', err);
      setError(t('reclamations.createError'));
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{t('common.newComplaint')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" type="button">
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label htmlFor="titre" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('common.title')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('reclamations.titlePlaceholder')}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('common.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                maxLength={5000}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={t('reclamations.descriptionPlaceholder')}
              />
              <p className="mt-1 text-sm text-slate-500">
                {formData.description.length}/5000 {t('common.characters')}
              </p>
            </div>

            {/* Entreprise */}
            <div>
              <label htmlFor="entrepriseId" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('common.company')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="entrepriseId"
                  name="entrepriseId"
                  value={formData.entrepriseId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pl-11 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  disabled={loadingEntreprises}
                >
                  <option value="">{t('common.selectCompany')}</option>
                  {entreprises.map(entreprise => (
                    <option key={entreprise.id} value={entreprise.id}>
                      {entreprise.nomEntreprise}
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Pièce jointe */}
            <div>
              <label htmlFor="pieceJointe" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('common.attachmentPhotoDoc')}
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="pieceJointe"
                  name="pieceJointe"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <FontAwesomeIcon icon={faUpload} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {t('common.optionalUpload')} {selectedFile && `(${selectedFile.name})`}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-800 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? t('reclamations.creating') : t('reclamations.createReclamation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReclamationModal;
