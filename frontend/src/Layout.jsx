import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Home, UserPlus, List, Menu, ChevronLeft, ChevronRight, User, LogOut, ChevronDown, Settings, ActivitySquare } from "lucide-react";
import axios from "axios";
import api from "./api";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [nom, setNom] = useState(null);
  const navigate = useNavigate('');

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // Gestion responsive
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/me");
        setNom(res.data.nom);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fermeture dropdown au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobile ? 'fixed' : 'relative'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarOpen && !isMobile ? 'w-64' : 'w-20'}
        ${isMobile && sidebarOpen ? 'w-64' : ''}
        bg-gradient-to-b from-slate-800 to-slate-900 transition-all duration-300 ease-in-out z-50 h-full shadow-xl
      `}>
        {/* Header Sidebar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className={`${(sidebarOpen && !isMobile) || (isMobile && sidebarOpen) ? "block" : "hidden"}`}>
            <h2 className="text-white font-bold text-xl flex items-center">
              <span className="bg-blue-500 p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                </svg>
              </span>
              ClientVoice
            </h2>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-2 rounded-md hover:bg-slate-700/50 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-1">
            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="relative flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
            >
              <Home className="w-5 h-5" />
              <span className={`${sidebarOpen ? "block" : "hidden"} font-medium`}>Dashboard</span>
              {!sidebarOpen && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-sm font-medium rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  Dashboard
                </span>
              )}
            </Link>

            {/* Ajouter Client */}
            <Link
              to="/addClient"
              className="relative flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
            >
              <UserPlus className="w-5 h-5" />
              <span className={`${sidebarOpen ? "block" : "hidden"} font-medium`}>Ajouter Client</span>
              {!sidebarOpen && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-sm font-medium rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  Ajouter Client
                </span>
              )}
            </Link>

            {/* Liste Clients */}
            <Link
              to="/list"
              className="relative flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
            >
              <List className="w-5 h-5" />
              <span className={`${sidebarOpen ? "block" : "hidden"} font-medium`}>Liste Clients</span>
              {!sidebarOpen && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-sm font-medium rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  Liste Clients
                </span>
              )}
            </Link>

            {/* Avis */}
            <Link
              to="/admin/avis"
              className="relative flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
            >
              <ActivitySquare className="w-5 h-5" />
              <span className={`${sidebarOpen ? "block" : "hidden"} font-medium`}>Avis</span>
              {!sidebarOpen && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-sm font-medium rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  Avis
                </span>
              )}
            </Link>
            
            {/* Paramètres */}
            <Link
              to="/setting"
              className="relative flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
            >
              <Settings className="w-5 h-5" />
              <span className={`${sidebarOpen ? "block" : "hidden"} font-medium`}>Paramètres</span>
              {!sidebarOpen && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-sm font-medium rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  Paramètres
                </span>
              )}
            </Link>
          </div>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="px-4 py-3 border-t border-slate-700/50 mt-auto">
          <p className="text-slate-500 text-xs text-center">
            ClientVoice v1.0 © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200/80 flex items-center justify-between px-6">
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md mr-4 md:hidden transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-800">Suivi et gestion des avis clients</h1>
          </div>

          {/* Dropdown Admin */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="font-medium text-gray-800 text-sm">{nom}</span>
                <span className="text-xs text-gray-500">Administrateur</span>
              </div>
              
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white font-medium shadow-sm">
                {nom?.charAt(0).toUpperCase() || 'A'}
              </div>
              
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden py-1">
                <Link 
                  to="/setting" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Mon profil</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200/70">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}