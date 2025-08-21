import { useEffect, useState } from "react";
import RatingForm from "./RatingForm";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function PublicPage() {
  const { slug } = useParams();
  const [place_id,setPlace ] = useState('null');
  const [avis, setAvis] = useState([]);
  const [client, setClient] = useState(null);
  const [langue, setLangue] = useState("fr"); // langue sélectionnée

  const messagesByLang = {
    fr: {
      pageTitre: "Page publique de",
      avisVides: "Aucun avis pour le moment.",
      avisRecents: "Avis récents :",
      donnerAvis: "💬 Donnez votre avis",
      aideAvis: "Votre opinion nous aide à améliorer nos services",
      serviceClient: "⭐ Service client",
      enLigne: "🟢 En ligne",
      lang:"Donnez une note :"
    },
    en: {
      pageTitre: "Public page of",
      avisVides: "No reviews yet.",
      avisRecents: "Recent reviews:",
      donnerAvis: "💬 Give your review",
      aideAvis: "Your opinion helps us improve our services",
      serviceClient: "⭐ Customer Service",
      enLigne: "🟢 Online",
      lang:"Give a rating :"
    },
    ar: {
      pageTitre: "الصفحة العامة لـ",
      avisVides: "لا توجد تعليقات حتى الآن.",
      avisRecents: "آخر التعليقات:",
      donnerAvis: "💬 أضف رأيك",
      aideAvis: "رأيك يساعدنا على تحسين خدماتنا",
      serviceClient: "⭐ خدمة العملاء",
      enLigne: "🟢 متصل",
      lang: "أعطِ تقييماً"
    }
  };

  const fetchClient = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/public/${slug}`);
        setPlace(res.data.place_id)
      setClient(res.data);
      setLangue(res.data.langue);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvis = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/clients/${slug}/avis`);
      setAvis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClient();
    fetchAvis();
  }, [slug]);

  if (!client) return <p>Chargement du client...</p>;

  const msg = messagesByLang[langue] || messagesByLang.fr;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8`}
      dir={langue === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Dropdown de langue */}
        <div className={`flex ${langue === "ar" ? "justify-start" : "justify-end"} mb-4`}>
          <select
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* Header avec logo et titre */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className={`flex flex-col lg:flex-row items-center gap-8 ${langue === "ar" ? "lg:flex-row-reverse" : ""}`}>

            {/* Logo */}
            {client.logo && (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4 shadow-lg">
                  <img
                    src={`http://localhost:5000/uploads/${client.logo}`}
                    alt={client.nom}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Titre et informations */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                {msg.pageTitre}{" "}
                <span className="block lg:inline text-blue-600 mt-2 lg:mt-0 lg:ml-2">
                  {client.nom}
                </span>
              </h1>

              {/* Badges */}
              <div className={`flex flex-wrap ${langue === "ar" ? "justify-center lg:justify-end" : "justify-center lg:justify-start"} gap-2 mt-4`}>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {msg.serviceClient}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {msg.enLigne}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'évaluation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{msg.donnerAvis}</h2>
              <p className="text-gray-600">{msg.aideAvis}</p>
            </div>
            <RatingForm place_id={place_id} lang={msg.lang} slug={slug} onNewAvis={fetchAvis} />
          </div>
        </div>



      </div>
    </div>
  );
}
