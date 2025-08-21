import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

export default function RatingForm({ slug,place_id,onNewAvis,lang }) {
  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const tooltips = {
    1: "Terrible",
    2: "Mauvais",
    3: "Moyen",
    4: "Bon",
    5: "Incroyable",
  };

  // Quand on clique sur une note
const handleNoteClick = async (n) => {
  setNote(n);
  setHover(null);

  if (n >= 4) {
    try {
      toast.success("Rédiger votre avis !");

      // Redirection après un petit délai
      setTimeout(() => {
        // const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${slug}`;
        const googleMapsUrl = `https://search.google.com/local/writereview?placeid=${place_id}`;
        window.open(googleMapsUrl, "_blank");
      }, 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Une erreur est survenue lors de l'envoi de votre avis"
      );
    }
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (note <= 3 && !commentaire.trim()) {
        setError("Commentaire obligatoire pour les notes faibles");
        return;
      }

      const res = await axios.post(
        `http://localhost:5000/clients/${slug}/avis`,
        { note, commentaire: commentaire.trim(), contact: contact.trim() }
      );

      toast.success(res.data.message);

      setCommentaire("");
      setNote(0);
      setContact("");
      setError("");
      if (onNewAvis) onNewAvis();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Une erreur est survenue lors de l'envoi de votre avis"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100"
    >
      <Toaster />

      {/* Section Note */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          ⭐ {lang}
        </label>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="relative flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleNoteClick(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                className="focus:outline-none"
              >
                <span
                  className={`text-3xl transition-colors ${
                    n <= (hover || note) ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              </button>
              {hover === n && (
                <span className="absolute top-10 text-sm text-white bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                  {tooltips[n]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire affiché seulement si note <= 3 */}
      {note > 0 && note <= 3 && (
        <>
          {/* Section Commentaire */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              💬 Commentaire:
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              required
              rows="4"
              placeholder="Dites-nous comment nous pouvons nous améliorer..."
              className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 placeholder-gray-400 bg-orange-50 resize-none"
            />
          </div>

          {/* Section Contact */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              👤 Contact{" "}
              <span className="text-gray-500 text-sm font-normal">(optionnel):</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Votre nom ou entreprise"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 placeholder-gray-400"
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-700 font-medium flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Bouton d'envoi */}
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transform hover:scale-[1.02] transition duration-200 shadow-lg"
          >
            ✨ Envoyer mon avis
          </button>
        </>
      )}
    </form>
  );
}
