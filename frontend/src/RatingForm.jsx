import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

export default function RatingForm({ slug, place_id, onNewAvis, lang, text }) {
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

  // Clique sur une étoile
  const handleNoteClick = async (n) => {
    setNote(n);
    setHover(null);

    if (n >= 4) {
      toast.success("Merci ! Redirection vers Google Review...");
      setTimeout(() => {
        window.location.reload();
        const googleMapsUrl = `https://search.google.com/local/writereview?placeid=${place_id}`;
        window.open(googleMapsUrl, "_blank");
      }, 1200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (note <= 3 && !commentaire.trim()) {
        setError("Merci de laisser un commentaire pour nous aider à nous améliorer.");
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
          "Erreur lors de l'envoi de votre avis"
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <Toaster />

      {/* Étape 1 : Choix de la note */}
      {note === 0 && (
        <div className="bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-xl text-center border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {lang}
          </h2>
          <p className="text-slate-500 mb-8">
            {text}
          </p>

          {/* Étoiles */}
          <div className="flex justify-center gap-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleNoteClick(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  className="focus:outline-none transition-transform hover:scale-125"
                >
                  <span
                    className={`text-5xl transition-colors ${
                      n <= (hover || note) ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                </button>
                {hover === n && (
                  <span className="absolute top-12 text-xs text-white bg-yellow-500 px-2 py-1 rounded-md shadow-lg animate-fade-in">
                    {tooltips[n]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Si la note est supérieure à 4, afficher une alerte */}
      {note > 3 && (
        <div className="bg-green-100 p-4 rounded-lg text-center mb-4">
          <p className="text-lg text-green-700">Merci beaucoup pour votre évaluation !</p>
          <p className="text-sm text-gray-500">Vous serez redirigé vers la page de Google Reviews.</p>
        </div>
      )}

      {/* Étape 2 : Formulaire si note <= 3 */}
      {note > 0 && note <= 3 && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl mt-8 border border-slate-200"
        >
          {/* Retour */}
          <button
            type="button"
            onClick={() => setNote(0)}
            className="text-blue-600 text-sm mb-4 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la notation
          </button>

          {/* Titre */}
          <h3 className="text-xl font-semibold text-slate-800 mb-6">
            Aidez-nous à nous améliorer 🙏
          </h3>

          {/* Commentaire */}
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows="4"
            placeholder="Dites-nous ce qui n'a pas fonctionné..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 mb-4"
            required
          />

          {/* Contact */}
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Votre nom ou contact (optionnel)"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 mb-4"
          />

          {/* Erreur */}
          {error && (
            <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Envoyer mes commentaires
          </button>
        </form>
      )}
    </div>
  );
}
