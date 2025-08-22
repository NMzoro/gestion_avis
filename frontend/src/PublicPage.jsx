import { useEffect, useState } from "react";
import RatingForm from "./RatingForm";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function PublicPage() {
  const { slug } = useParams();
  const [place_id, setPlace] = useState("null");
  const [client, setClient] = useState(null);
  const [langue, setLangue] = useState("fr");

  const messagesByLang = {
    fr: { lang: "Comment était votre expérience ?", text: "Votre avis nous aide à améliorer nos services." },
    en: { lang: "How was your experience?", text: "Your feedback helps us improve our services." },
    ar: { lang: "كيف كانت تجربتك؟", text: "ملاحظاتك تساعدنا في تحسين خدماتنا." }
  };

  const fetchClient = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/public/${slug}`);
      setPlace(res.data.place_id);

      // titre page
      document.title = res.data.nom;

      // favicon
      const favicon =
        document.querySelector("link[rel='icon']") ||
        document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.href = res.data.logo
        ? `http://localhost:5000/uploads/${res.data.logo}`
        : "/default-favicon.png";
      document.head.appendChild(favicon);

      setClient(res.data);
      setLangue(res.data.langue);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [slug]);

  if (!client) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-800">Chargement...</p>
      </div>
    </div>
  );

  const msg = messagesByLang[langue] || messagesByLang.fr;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between bg-white py-12 px-4 relative"
      dir={langue === "ar" ? "rtl" : "ltr"}
    >
      {/* Sélecteur langue en haut à droite */}
      <div className="absolute top-4 right-6">
        <select
          value={langue}
          onChange={(e) => setLangue(e.target.value)}
          className="px-4 py-2 rounded-xl border-none bg-white shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      {/* Logo rond centré */}
      {client.logo && (
        <div className="flex justify-center mb-10 mt-8">
          <div className="p-1 bg-white rounded-full shadow-lg border border-blue-100">
            <img
              src={`http://localhost:5000/uploads/${client.logo}`}
              alt={client.nom}
              className="w-40 h-40 object-cover rounded-full"
            />
          </div>
        </div>
      )}

      {/* Rating form */}
      <RatingForm
        place_id={place_id}
        lang={msg.lang}
        text={msg.text}
        slug={slug}
        onNewAvis={() => {}}
      />

      {/* Footer discret */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        {client.nom} © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
