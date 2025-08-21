import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "./api";
import { Toaster, toast } from "react-hot-toast";

const ClientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: "",
    langue: "fr",
    business_statut: "",
    place_id: "",
    statut: "Actif",
    contact_nom: "",
    contact_email: "",
    contact_tel: "",
    notes_admin: ""
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Charger les données du client à modifier
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api.get(`/clients/${id}`);
        const client = response.data;
        
        setFormData({
          nom: client.nom || "",
          langue: client.langue || "fr",
          business_statut: client.business_statut || "",
          place_id: client.place_id || "",
          statut: client.statut || "Actif",
          contact_nom: client.contact_nom || "",
          contact_email: client.contact_email || "",
          contact_tel: client.contact_tel || "",
          notes_admin: client.notes_admin || ""
        });
        
        if (client.logo) {
          setLogoPreview(`http://localhost:5000/uploads/${client.logo}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données du client");
        setLoading(false);
      }
    };
    
    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Le fichier doit faire moins de 2MB");
        return;
      }
      
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        toast.error("Veuillez sélectionner une image");
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("langue", formData.langue);
      formDataToSend.append("business_statut", formData.business_statut);
      formDataToSend.append("place_id", formData.place_id);
      formDataToSend.append("statut", formData.statut);
      formDataToSend.append("contact_nom", formData.contact_nom);
      formDataToSend.append("contact_email", formData.contact_email);
      formDataToSend.append("contact_tel", formData.contact_tel);
      formDataToSend.append("notes_admin", formData.notes_admin);
      
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }
      
      const response = await api.put(`/clients/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      toast.success("Client modifié avec succès !");
      setTimeout(() => {
        navigate("/list");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erreur lors de la modification du client");
      toast.error(err.response?.data?.error || "Erreur lors de la modification du client");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600">Chargement des données du client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-5 bg-blue-600 text-white">
            <h2 className="text-2xl font-bold">Modifier le client</h2>
            <p className="text-blue-100 opacity-90">Mettez à jour les informations de ce client</p>
          </div>
          
          <div className="p-6">
            <Toaster position="top-right" />
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne gauche */}
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold text-gray-900">Informations générales</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client*</label>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Entrez le nom du client"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Langue*</label>
                        <select
                          name="langue"
                          value={formData.langue}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut*</label>
                        <select
                          name="statut"
                          value={formData.statut}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="Actif">Actif</option>
                          <option value="En attente">En attente</option>
                          <option value="Suspendu">Suspendu</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Logo */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold text-gray-900">Logo</h3>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="h-40 w-40 object-contain rounded-xl border-2 border-dashed border-gray-300 p-1"
                          />
                        ) : (
                          <div className="h-40 w-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                            <span className="text-gray-400 text-sm">Aucun logo</span>
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full inline-flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center">Formats supportés: JPG, PNG, SVG (max 2MB)</p>
                    </div>
                  </div>
                </div>
                
                {/* Colonne droite */}
                <div className="space-y-6">
                  {/* Informations de contact */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold text-gray-900">Contact</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
                        <input
                          type="text"
                          name="contact_nom"
                          value={formData.contact_nom}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Nom complet du contact"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="contact_email"
                          value={formData.contact_email}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="email@exemple.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                          type="tel"
                          name="contact_tel"
                          value={formData.contact_tel}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* URLs */}
                  <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold text-gray-900">Statut & Place Id</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <select
                          name="business_statut"
                          value={formData.business_statut}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="verifie">verifie</option>
                          <option value="non verifie">non verifie</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Place Id</label>
                        <input
                          type="text"
                          name="place_id"
                          value={formData.place_id}
                          onChange={handleChange}
                          placeholder="https://docs.google.com/spreadsheets/..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes admin */}
                  <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <h3 className="ml-3 text-lg font-semibold text-gray-900">Notes administratives</h3>
                    </div>
                    
                    <textarea
                      name="notes_admin"
                      value={formData.notes_admin}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Notes internes sur ce client..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/clients")}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientEdit;