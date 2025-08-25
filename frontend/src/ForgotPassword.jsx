import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";
import custom from "./custom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await custom.post("/admin/forgot-password", { email });
      toast.success(res.data.message || "OTP envoyé avec succès !");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'envoi de l'OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <VerifyOtp
        email={email}
onSuccess={() => setStep("reset")} 
      />
    );
  }
    if (step === "reset") {
    return <ResetPassword email={email} />; // ✅ affiche ResetPassword
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="max-w-md w-full space-y-8">
        {/* Header avec icône */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Mot de passe oublié ?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Entrez votre email pour recevoir un code de vérification
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={sendOtp}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                autoComplete="email"
              />
            </div>
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
            {isLoading ? "Envoi en cours..." : "Envoyer le code OTP"}
          </button>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Retour à la connexion
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
