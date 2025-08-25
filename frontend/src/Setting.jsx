import { useEffect, useState } from "react";
import axios from "axios";
import { User, Lock, Save, Settings as SettingsIcon, Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import api from "./api";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("infos");
  const [form, setForm] = useState({ 
    nom: "", 
    email: "", 
    password: "",
    currentPassword: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger infos admin connecté
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/me");
        setForm({ ...form, nom: res.data.nom, email: res.data.email });
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des informations");
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Préparer les données selon l'onglet actif
      const dataToSend = activeTab === "infos" 
        ? { nom: form.nom, email: form.email }
        : { password: form.password, currentPassword: form.currentPassword };
      
      await api.put("/admin/me", dataToSend);
      
      toast.success("Informations mises à jour avec succès !");
      
      // Réinitialiser les champs de mot de passe après une mise à jour réussie
      if (activeTab === "password") {
        setForm({ ...form, password: "", currentPassword: "" });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Paramètres du compte</h2>
            <p className="text-gray-600">Gérez vos informations personnelles et votre mot de passe</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("infos")}
          className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all relative ${
            activeTab === "infos"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Informations personnelles</span>
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all relative ${
            activeTab === "password"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Lock className="w-5 h-5" />
          <span>Mot de passe</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200/70 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === "infos" ? "Modifier vos informations" : "Changer votre mot de passe"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab === "infos" 
              ? "Mettez à jour vos informations personnelles" 
              : "Assurez-vous d'utiliser un mot de passe fort et unique"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {activeTab === "infos" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                />
              </div>
            </>
          )}

          {activeTab === "password" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    required
                    placeholder="Entrez votre mot de passe actuel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="Choisissez un nouveau mot de passe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              </div>
            </>
          )}

          {/* Bouton de soumission */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Informations de sécurité */}
      {activeTab === "password" && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Conseils de sécurité
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Utilisez au moins 8 caractères</li>
            <li>• Combinez lettres, chiffres et caractères spéciaux</li>
            <li>• Évitez les mots de passe courants ou personnels</li>
            <li>• Changez votre mot de passe régulièrement</li>
          </ul>
        </div>
      )}
    </div>
  );
}