import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import custom from "./custom";

const VerifyOtp = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await custom.post("/admin/verify-otp", {
        email,
        otp,
      });

      toast.success(res.data.message || "OTP vérifié avec succès !");
      if (onSuccess) onSuccess(); // Callback pour rediriger vers ResetPassword
    } catch (err) {
      toast.error(err.response?.data?.error || "Code OTP invalide.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      <div className="max-w-md w-full space-y-8">
        {/* Header avec icône */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                d="M12 11c0-.667.2-1.167.6-1.5.4-.333.9-.5 1.5-.5s1.1.167 1.5.5c.4.333.6.833.6 1.5M9 20h6m-3-4v4m6-11a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Vérification OTP
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Un code a été envoyé à <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleVerify}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6"
        >
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Code OTP
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full text-center tracking-widest text-lg py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg font-medium text-white transition-all ${
              isLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
            }`}
          >
            {isLoading ? "Vérification..." : "Vérifier le code"}
          </button>

          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Renvoyer un autre code
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
