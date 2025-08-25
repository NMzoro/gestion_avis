import { useEffect, useState } from "react";
import axios from "axios";
import { Star, User, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import custom from "./custom";

export default function AvisList({ slug }) {
  const [avis, setAvis] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const avisPerPage = 4;

  useEffect(() => {

    const fetchAvis = async () => {
      try {
        setLoading(true);
        if (!slug) {
          console.error('Slug is undefined');
          setLoading(false);
          return;
        }
        
        const res = await custom.get(`/clients/${slug}/avis`);
    document.title = res.data[0].nom;

      // favicon
      const favicon =
        document.querySelector("link[rel='icon']") ||
        document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.href = res.data[0].logo
        ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${res.data[0].logo}`
        : "/default-favicon.png";
      document.head.appendChild(favicon);
        setAvis(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching avis:', err);
        setLoading(false);
        if (err.response) {
          // The request was made and the server responded with a status code
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          console.error('Response headers:', err.response.headers);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
        } else {
          // Something happened in setting up the request
          console.error('Error setting up request:', err.message);
        }
      }
    };
    fetchAvis();
  }, [slug]);

  // Pagination
  const indexOfLast = currentPage * avisPerPage;
  const indexOfFirst = indexOfLast - avisPerPage;
  const currentAvis = avis.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(avis.length / avisPerPage);

  // Calcul de la moyenne
  const moyenne = avis.length
    ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
    : 0;

  // Distribution des notes
  const noteDistribution = [3, 2, 1].map(note => ({
    note,
    count: avis.filter(a => a.note === note).length,
    percentage: avis.length ? (avis.filter(a => a.note === note).length / avis.length) * 100 : 0
  }));

  const renderStars = (rating, size = "w-5 h-5") => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`${size} ${
          idx < Math.round(rating) 
            ? "text-amber-400 fill-amber-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                  <div className="w-8 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-8 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="avis-section" className="max-w-4xl mx-auto py-12 px-4">
      {/* En-tête avec titre et stats */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <TrendingUp className="w-4 h-4" />
          Avis Clients Vérifiés
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Avis des consommateurs
        </h2>
        <p className="text-gray-600 text-lg">
          Découvrez les retours d'expérience de notre communauté
        </p>
      </div>

      {/* Statistiques globales */}
      {avis.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Note moyenne */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="text-5xl font-bold text-amber-500">{moyenne}</div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(moyenne)}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Basé sur {avis.length} avis client{avis.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribution des notes */}
            <div className="space-y-2">
              {noteDistribution.map(({ note, count, percentage }) => (
                <div key={note} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-gray-600">{note}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-500 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      {avis.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun avis pour le moment
            </h3>
            <p className="text-gray-500">
              Soyez le premier à partager votre expérience !
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {currentAvis.map((a, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              <div className="p-6">
                {/* En-tête de l'avis */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {renderStars(a.note, "w-5 h-5")}
                    </div>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      {a.note}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(a.date_soumission).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Commentaire */}
                {a.commentaire && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {a.commentaire}
                    </p>
                  </div>
                )}

                {/* Auteur */}
                {a.contact && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-600 font-medium">{a.contact}</span>
                    <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                      ✓ Vérifié
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination améliorée */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
            }`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Précédent
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isActive = currentPage === pageNum;
              
              return (
                <button
                  key={i}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
            }`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}