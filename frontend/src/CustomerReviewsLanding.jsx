import { Star, Users, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function CustomerReviewsLanding() {
  return (
    <div className="min-h-screen bg-blue-500">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-white/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 mb-8">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Plateforme de confiance pour +10,000 entreprises</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            <span className="block">Transformez vos</span>
            <span className="text-white">
              Avis Clients
            </span>
            <span className="block">en Succès</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Centralisez, analysez et optimisez tous vos avis clients en temps réel. 
            Boostez votre réputation en ligne et augmentez vos conversions grâce à 
            notre plateforme intelligente de gestion d'avis.
          </p>

          {/* Features highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-5 h-5 text-white fill-current" />
              <span className="text-white font-medium">Collecte automatisée</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Analytics avancés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Réponses intelligentes</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Multi-plateformes</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Link to="/login" className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-blue-500 bg-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/25 active:scale-95">
              <span className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-3">
                Se Connecter
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center group-hover:animate-spin">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </span>
            </Link>
            
            <p className="text-white/80 text-sm">
              • Sans engagement • Configuration en 2 minutes
            </p>
          </div>

        </div>
      </div>

      {/* Floating review cards animation */}
      <div className="absolute top-1/4 left-10 opacity-70 animate-float hidden lg:block">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-white">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-white text-sm">5.0</span>
          </div>
          <p className="text-white text-sm">"Service exceptionnel! L'équipe répond rapidement..."</p>
          <p className="text-white/70 text-xs mt-2">Marie L. - il y a 2h</p>
        </div>
      </div>

      <div className="absolute bottom-1/4 right-10 opacity-70 animate-float-delayed hidden lg:block">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-white">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-white text-sm">5.0</span>
          </div>
          <p className="text-white text-sm">"Interface intuitive, résultats immédiats..."</p>
          <p className="text-white/70 text-xs mt-2">Thomas R. - il y a 5h</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}