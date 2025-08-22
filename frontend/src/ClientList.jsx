import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import api from "./api";
import { BriefcaseBusiness, UserRoundPen } from "lucide-react";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const itemsPerPage = 5;

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data);
      setFilteredClients(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Impossible de récupérer les clients");
      setLoading(false);
    }
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const deleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await api.delete(`/clients/${clientToDelete.id}`);
      await fetchClients();
      closeDeleteModal();
      toast.success("Client supprimé avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression du client");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter((client) => {
      const matchesSearch =
        client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || client.statut === statusFilter;
      const matchesLanguage = languageFilter === "" || client.langue === languageFilter;
      return matchesSearch && matchesStatus && matchesLanguage;
    });

    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, languageFilter, clients]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const uniqueStatuses = [...new Set(clients.map((client) => client.statut).filter(Boolean))];
  const uniqueLanguages = [...new Set(clients.map((client) => client.langue).filter(Boolean))];

  const memoizedClients = useMemo(() => currentClients, [currentClients]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4 text-gray-600">
          <div className="animate-pulse rounded-full bg-slate-200 h-12 w-12"></div>
          <span className="text-lg font-medium">Chargement des clients...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 text-red-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <span className="font-medium block">{error}</span>
            <button
              onClick={fetchClients}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Liste des clients</h2>
        <p className="text-gray-600 text-lg">Gérez vos clients ({filteredClients.length} au total)</p>
      </div>

      <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Tous les statuts</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Toutes les langues</option>
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === "fr" ? "Français" : lang === "en" ? "English" : lang === "ar" ? "العربية" : lang}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 font-medium">Affichage:</span>
            <div className="flex bg-gray-100 rounded-xl p-1.5">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                  viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Vue tableau"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8H3m0 4h6" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                  viewMode === "cards" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Vue cartes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {currentClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-3">Aucun client trouvé</h3>
            <p className="text-gray-500 mb-4">Essayez de modifier vos filtres de recherche</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setLanguageFilter("");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "table" && (
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memoizedClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            {client.logo ? (
                              <img
                                className="h-12 w-12 rounded-full object-cover shadow-sm"
                                src={`http://localhost:5000/uploads/${client.logo}`}
                                alt={client.nom}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                                <span className="text-lg font-medium text-blue-700">{client.nom?.charAt(0)?.toUpperCase()}</span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{client.nom}</div>
                              <div className="text-sm text-gray-500">
                                {client.langue === "fr" ? "Français" : client.langue === "en" ? "English" : client.langue === "ar" ? "العربية" : client.langue}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.contact_nom || "Non renseigné"}</div>
                          <div className="text-sm text-gray-500">{client.contact_email || "Non renseigné"}</div>
                          <div className="text-sm text-gray-500">{client.contact_tel || "Non renseigné"}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              client.statut === "actif"
                                ? "bg-green-100 text-green-800"
                                : client.statut === "inactif"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {client.statut || "Non défini"}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                          <div className="space-y-2">
                                                      <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              client.business_statut === "verifie"
                                ? "bg-green-100 text-green-800"
                                : client.business_statut === "non verifie"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {client.business_statut || "Non défini"}
                          </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedClient(client)}
                              className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              aria-label="Voir les détails"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <Link
                              to={`/clients/edit/${client.id}`}
                              className="inline-flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                              aria-label="Modifier le client"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <a
                              href={`http://localhost:3000/public/${client.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Voir la page publique"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <button
                              onClick={() => openDeleteModal(client)}
                              className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              aria-label="Supprimer le client"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

{viewMode === "cards" && (
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
    {memoizedClients.map((client) => (
      <div key={client.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
        {/* En-tête de la carte */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {client.logo ? (
              <div className="flex-shrink-0">
                <img
                  className="h-14 w-14 rounded-lg object-cover border-2 border-gray-100 shadow-sm group-hover:shadow-md transition-shadow"
                  src={`http://localhost:5000/uploads/${client.logo}`}
                  alt={client.nom}
                />
              </div>
            ) : (
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-xl font-bold text-blue-700">{client.nom?.charAt(0)?.toUpperCase() || "C"}</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{client.nom}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {client.langue === "fr" ? "🇫🇷 Français" : client.langue === "en" ? "🇺🇸 English" : client.langue === "ar" ? "🇲🇦 العربية" : client.langue}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    client.statut === "actif"
                      ? "bg-green-100 text-green-800"
                      : client.statut === "inactif"
                      ? "bg-yellow-100 text-yellow-800"
                      : client.statut === "Suspendu"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client.statut || "Non défini"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setSelectedClient(client)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Voir les détails"
              title="Voir les détails"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <a
              href={`http://localhost:3000/public/${client.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Voir la page publique"
              title="Voir la page publique"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={() => openDeleteModal(client)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Supprimer le client"
              title="Supprimer le client"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={!client.contact_nom ? "text-gray-400" : ""}>
                  {client.contact_nom || "Non renseigné"}
                </span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {client.contact_email ? (
                  <a href={`mailto:${client.contact_email}`} className="text-blue-600 hover:text-blue-800 transition-colors break-all">
                    {client.contact_email}
                  </a>
                ) : (
                  <span className="text-gray-400">Non renseigné</span>
                )}
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {client.contact_tel ? (
                  <a href={`tel:${client.contact_tel}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                    {client.contact_tel}
                  </a>
                ) : (
                  <span className="text-gray-400">Non renseigné</span>
                )}
              </div>
            </div>
          </div>

          {/* Liens et actions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Statut
            </h4>
            <div className="space-y-2">
                <a
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700  transition-colors group/link"
                >
<UserRoundPen className="w-4 h-4 mr-1.5 text-gray-500 group-hover/link:text-gray-700" />
                  Statut Compte : {client.statut}
                </a>
                <a
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors group/link"
                >
<BriefcaseBusiness className="w-4 h-4 mr-1.5 text-gray-500 group-hover/link:text-gray-700" />
                  Statut Business : {client.business_statut}
                </a>
              <a
                href={`http://localhost:3000/public/${client.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors group/link"
              >
                <svg className="w-4 h-4 mr-1.5 text-gray-500 group-hover/link:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Page publique
              </a>
              <a
                href={`https://search.google.com/local/writereview?placeid=${client.place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors group/link"
              >
                <svg className="w-4 h-4 mr-1.5 text-gray-500 group-hover/link:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Map Form
              </a>
            </div>
          </div>
        </div>

        {/* Notes administratives */}
        {client.notes_admin && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-20 overflow-y-auto">
              {client.notes_admin}
            </p>
          </div>
        )}

        {/* Pied de carte - Métadonnées */}
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Créé le {new Date(client.created_at).toLocaleDateString("fr-FR")}</span>
            <span>Modifié le {new Date(client.updated_at).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Affichage {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredClients.length)} sur {filteredClients.length} clients
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Page précédente"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      currentPage === page ? "bg-blue-600 text-white shadow-sm" : "border border-gray-200 hover:bg-gray-50"
                    }`}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Page suivante"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}

{selectedClient && (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
      {/* En-tête */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Détails du client</h3>
        </div>
        <button
          onClick={() => setSelectedClient(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {/* En-tête du client */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          {selectedClient.logo && (
            <div className="flex-shrink-0">
              <img
                src={`http://localhost:5000/uploads/${selectedClient.logo}`}
                alt={selectedClient.nom}
                className="h-16 w-16 object-contain rounded-lg border-2 border-gray-100 shadow-sm"
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedClient.nom}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">ID : {selectedClient.id}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm font-mono text-gray-500">{selectedClient.slug}</span>
            </div>
          </div>
          <div className="md:ml-auto">
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                selectedClient.statut === "actif"
                  ? "bg-green-100 text-green-800"
                  : selectedClient.statut === "inactif"
                  ? "bg-yellow-100 text-yellow-800"
                  : selectedClient.statut === "Suspendu"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {selectedClient.statut || "Non défini"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne de gauche */}
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations générales
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Langue</label>
                  <p className="text-sm font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {selectedClient.langue === "fr"
                      ? "🇫🇷 Français"
                      : selectedClient.langue === "en"
                      ? "🇺🇸 English"
                      : selectedClient.langue === "ar"
                      ? "🇲🇦 العربية"
                      : selectedClient.langue}
                  </p>
                </div>
                <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">Business Statut</label>

         <p className="text-sm font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {selectedClient.business_statut}
                  </p>
                </div>

                                <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">Place Id</label>

         <p className="text-sm font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {selectedClient.place_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nom du contact</label>
                  <p className="text-sm font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {selectedClient.contact_nom || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {selectedClient.contact_email ? (
                      <a href={`mailto:${selectedClient.contact_email}`} className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedClient.contact_email}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">Non renseigné</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {selectedClient.contact_tel ? (
                      <a href={`tel:${selectedClient.contact_tel}`} className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedClient.contact_tel}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">Non renseigné</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite */}
          <div className="space-y-6">

            {/* Notes administratives */}
            {selectedClient.notes_admin && (
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notes administratives
                </h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedClient.notes_admin}</p>
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Métadonnées
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                  <p className="text-sm font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {new Date(selectedClient.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Dernière modification</label>
                  <p className="text-sm font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {new Date(selectedClient.updated_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button
          onClick={() => openDeleteModal(selectedClient)}
          className="inline-flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </button>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setSelectedClient(null)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Fermer
          </button>
          <a
            href={`http://localhost:3000/public/${selectedClient.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Page publique
          </a>
          <a
            href={`https://www.google.com/maps/place/${selectedClient.nom}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Google Maps
          </a>
        </div>
      </div>
    </div>
  </div>
)}
      {deleteModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Confirmer la suppression</h3>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 p-2 rounded-full bg-red-100 mr-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Êtes-vous sûr ?</h4>
                  <p className="text-gray-600 mt-1">
                    Cette action supprimera définitivement le client <span className="font-semibold">{clientToDelete?.nom}</span> et toutes ses données associées.
                  </p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm text-red-700">Cette action est irréversible. Toutes les données liées à ce client seront définitivement supprimées.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={deleteClient}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;