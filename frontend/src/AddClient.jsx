import { useState } from "react";
import api from "./api";
import { Toaster, toast } from "react-hot-toast";
import { Info } from "lucide-react";

export default function AddClient() {
  const [form, setForm] = useState({
    nom: "",
    logo: null,
    langue: "",
    place_id: "",
    statut: "actif",
    business_statut: "verifie",
    contact_nom: "",
    contact_email: "",
    contact_tel: "",
    notes_admin: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setForm({ ...form, logo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      for (let key in form) {
        if (form[key] !== null) data.append(key, form[key]);
      }

      const res = await api.post("/clients", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success(`${res.data.message}`);

      // Réinitialiser le formulaire
      setForm({
        nom: "",
        logo: null,
        langue: "",
        place_id: "",
        google_sheet_url: "",
        statut: "actif",
        business_statut: "verifie",
        contact_nom: "",
        contact_email: "",
        contact_tel: "",
        notes_admin: ""
      });

      // Réinitialiser également l'input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(`${err.response.data.error}`);
      } else {
        toast.error("Une erreur est survenue lors de l'ajout du client");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div><Toaster position="top-right" /></div>
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nouveau Client</h2>
            <p className="text-gray-600">Ajoutez un nouveau client à votre système de gestion</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200/70 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Informations du client</h3>
          <p className="text-sm text-gray-600 mt-1">Tous les champs marqués d'un astérisque (*) sont obligatoires</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nom de l'entreprise */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nom" 
                placeholder="Ex: Entreprise XYZ" 
                value={form.nom} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Logo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de l'entreprise
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Cliquez pour uploader</span> ou glisser-déposer
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, SVG (MAX. 5MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    name="logo" 
                    onChange={handleChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </label>
              </div>
              {form.logo && (
                <p className="mt-2 text-sm text-green-600">
                  Fichier sélectionné: {form.logo.name}
                </p>
              )}
            </div>

            {/* Langue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue <span className="text-red-500">*</span>
              </label>
              <select 
                name="langue" 
                value={form.langue} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white text-gray-800"
              >
                <option value="">Sélectionnez une langue</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇺🇸 English</option>
                <option value="ar">🇲🇦 العربية</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select 
                name="statut" 
                value={form.statut} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white text-gray-800"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="en_attente">En attente</option>
              </select>
            </div>


            {/* Business Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Statut
              </label>
              <select 
                name="business_statut" 
                value={form.business_statut} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white text-gray-800"
              >
                <option value="actif">verifie</option>
                <option value="inactif">no verifie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex">
                  Place Id <span className="text-red-500">*</span>  <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank"><Info className="whitespace-nowrap break-words ml-2 text-gray-400" /></a>
                </div>
                
              </label>
              <input 
                type="text" 
                name="place_id" 
                placeholder="Place Id " 
                value={form.place_id} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Contact Information Header */}
            <div className="md:col-span-2 mt-4 mb-2">
              <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Informations de contact</h4>
            </div>

            {/* Nom contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du contact
              </label>
              <input 
                type="text" 
                name="contact_nom" 
                placeholder="Ex: Jean Dupont" 
                value={form.contact_nom} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Email contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du contact
              </label>
              <input 
                type="email" 
                name="contact_email" 
                placeholder="contact@entreprise.com" 
                value={form.contact_email} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Téléphone contact */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone du contact
              </label>
              <input 
                type="tel" 
                name="contact_tel" 
                placeholder="+212 6 XX XX XX XX" 
                value={form.contact_tel} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Notes admin */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes administratives
              </label>
              <textarea 
                name="notes_admin" 
                placeholder="Notes internes, commentaires, informations supplémentaires..." 
                value={form.notes_admin} 
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 placeholder-gray-400 resize-vertical"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
              onClick={() => window.history.back()}
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>Ajouter le Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}