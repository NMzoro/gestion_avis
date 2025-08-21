import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "./api";
import { Trash2, Eye, X, Search, Filter, Star, Calendar, User, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Composant pour afficher les étoiles (mémoïsé)
const StarRating = ({ note, size = 16 }) => {
  return (
    <div className="flex mr-2">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < note ? "text-yellow-400" : "text-gray-300"}>
          <Star size={size} fill={i < note ? "currentColor" : "none"} />
        </span>
      ))}
    </div>
  );
};

// Composant pour la carte d'avis (mémoïsé)
const AvisCard = React.memo(({ avis, onView, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-400" />
            {avis.client_nom || "Client Anonyme"}
          </h3>
          <div className="flex items-center mt-1">
            <StarRating note={avis.note} />
            <span className="text-sm font-medium text-gray-700">{avis.note}/5</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(avis)}
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(avis)}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{avis.commentaire || "Pas de commentaire."}</p>

      <div className="text-sm text-gray-500 flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(avis.date_soumission).toLocaleDateString("fr-FR")}
        </div>
        {avis.contact && (
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-1" />
            {avis.contact}
          </div>
        )}
      </div>
    </div>
  );
});

AvisCard.displayName = 'AvisCard';

// Composant pour les statistiques (mémoïsé)
const StatsCard = React.memo(({ title, value, icon: Icon, bgColor, textColor }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-lg mr-4`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default function AdminAvisAllClients() {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAvis, setSelectedAvis] = useState(null);
  const [filterClient, setFilterClient] = useState("");
  const [filterNote, setFilterNote] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avisToDelete, setAvisToDelete] = useState(null);

  // Chargement des données
  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const res = await api.get("/avis");
        setAvis(res.data);
        setError(null);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les avis");
        toast.error("Impossible de charger les avis");
      } finally {
        setLoading(false);
      }
    };
    fetchAvis();
  }, []);

  // Filtrage optimisé avec useMemo
  const filteredAvis = useMemo(() => {
    let result = avis;
    
    if (filterClient) {
      const searchTerm = filterClient.toLowerCase();
      result = result.filter(a =>
        a.client_nom?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filterNote) {
      result = result.filter(a => a.note === Number(filterNote));
    }
    
    return result;
  }, [avis, filterClient, filterNote]);

  // Calcul des statistiques avec useMemo
  const stats = useMemo(() => ({
    total: avis.length,
    moyenne: avis.filter(a => a.note === 3).length,
    negatifs: avis.filter(a => a.note <= 2).length
  }), [avis]);

  // Gestionnaires d'événements mémoïsés
  const openDeleteModal = useCallback((avis) => {
    setAvisToDelete(avis);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setAvisToDelete(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!avisToDelete) return;
    
    try {
      await api.delete(`/avis/${avisToDelete.id}`);
      setAvis(prev => prev.filter(a => a.id !== avisToDelete.id));
      closeDeleteModal();
      setSelectedAvis(null);
      toast.success("Avis supprimé avec succès");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      toast.error("Erreur lors de la suppression de l'avis");
    }
  }, [avisToDelete, closeDeleteModal]);

  const handleViewAvis = useCallback((avis) => {
    setSelectedAvis(avis);
  }, []);

  const resetFilters = useCallback(() => {
    setFilterClient("");
    setFilterNote("");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Avis Clients</h1>
          <p className="text-gray-600">Consultez et gérez tous les avis laissés par vos clients</p>
        </div>

        {/* Carte de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total d'avis"
            value={stats.total}
            icon={Star}
            bgColor="bg-blue-100"
            textColor="text-blue-600"
          />
          
          <StatsCard
            title="Avis moyens (3★)"
            value={stats.moyenne}
            icon={Star}
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
          
          <StatsCard
            title="Avis négatifs (1-2★)"
            value={stats.negatifs}
            icon={Star}
            bgColor="bg-red-100"
            textColor="text-red-600"
          />
        </div>

        {/* Filtrage */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom de client"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterNote}
              onChange={(e) => setFilterNote(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Toutes les notes</option>
              {[3, 2, 1].map(n => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'étoile' : 'étoiles'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredAvis.length} avis{filteredAvis.length !== 1 ? 's' : ''} trouvé{filteredAvis.length !== 1 ? 's' : ''}
          </h3>
          
          {(filterClient || filterNote) && (
            <button 
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {filteredAvis.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis trouvé</h3>
            <p className="text-gray-500">
              {avis.length === 0 
                ? "Vous n'avez aucun avis pour le moment." 
                : "Aucun avis ne correspond à vos critères de recherche."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAvis.map(avis => (
              <AvisCard
                key={avis.id}
                avis={avis}
                onView={handleViewAvis}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        )}

        {/* Modale détails */}
        {selectedAvis && (
          <AvisDetailModal
            avis={selectedAvis}
            onClose={() => setSelectedAvis(null)}
            onDelete={openDeleteModal}
          />
        )}

        {/* Modale de suppression */}
        {showDeleteModal && (
          <DeleteModal
            avis={avisToDelete}
            onClose={closeDeleteModal}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

// Composants modales séparés pour éviter les re-rendus inutiles
const AvisDetailModal = React.memo(({ avis, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Détails de l'avis</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{avis.client_nom || "Client Anonyme"}</h3>
              <div className="flex items-center mt-1">
                <StarRating note={avis.note} size={20} />
                <span className="text-lg font-medium text-gray-700">{avis.note}/5</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Commentaire</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{avis.commentaire || "Pas de commentaire."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Contact</h4>
              <p className="text-gray-900 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {avis.contact || "Non renseigné"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Date de soumission</h4>
              <p className="text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {new Date(avis.date_soumission).toLocaleDateString("fr-FR", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onDelete(avis)}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AvisDetailModal.displayName = 'AvisDetailModal';

const DeleteModal = React.memo(({ avis, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Supprimer l'avis
        </h3>
        
        <p className="text-gray-700 text-center mb-6">
          Êtes-vous sûr de vouloir supprimer définitivement l'avis de <span className="font-semibold">{avis?.client_nom || "ce client"}</span> ? Cette action est irréversible.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
});

DeleteModal.displayName = 'DeleteModal';