import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import custom from "./custom";

const ResetPassword = ({ email }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return toast.error("Les mots de passe ne correspondent pas.");
    }

    setIsLoading(true);
    try {
      const res = await custom.post("/admin/reset-password", {
        email,
        newPassword: password,
      });

      toast.success(res.data.message || "Mot de passe changé avec succès !");
      setPassword("");
      setConfirm("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors du changement du mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.21 1.79-4 4-4s4 1.79 4 4v4h-2v-4a2 2 0 10-4 0v4H8v-4a4 4 0 118 0" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Nouveau mot de passe</h2>
          <p className="mt-2 text-sm text-gray-600">Pour le compte : <span className="font-semibold">{email}</span></p>
        </div>

        <form
          onSubmit={handleReset}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg font-medium text-white transition-all ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {isLoading ? "Changement..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
