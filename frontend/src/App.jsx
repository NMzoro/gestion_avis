import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import AddClient from "./AddClient";
import ClientList from "./ClientList";
import PublicPage from "./PublicPage";
import AvisList from "./AvisList";
import Login from "./Login";
import Settings from "./Setting";
import ClientEdit from "./ClientEdit";
import AdminAvisAllClients from "./AdminAvisAllClients";
import CustomerReviewsLanding from "./CustomerReviewsLanding";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot/password" element={<ForgotPassword />} />
        <Route path="/verify/otp" element={<VerifyOtp />} />
        <Route path="/" element={<CustomerReviewsLanding />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/addClient" element={<ProtectedRoute><Layout><AddClient /></Layout></ProtectedRoute>} />
        <Route path="/list" element={<ProtectedRoute><Layout><ClientList /></Layout></ProtectedRoute>} />
        <Route path="/clients/edit/:id" element={<Layout><ClientEdit /></Layout>} />
        <Route path="/setting" element={<Layout><Settings /></Layout>} />
        <Route path="/public/:slug" element={<PublicPage />} />
        <Route 
  path="/admin/avis" 
  element={
    <ProtectedRoute>
      <Layout>
        <AdminAvisAllClients />
      </Layout>
    </ProtectedRoute>
  } 
/>

        <Route path="/public/:slug/avis" element={<AvisListWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

function AvisListWrapper() {
  const { slug } = useParams();
  return <AvisList slug={slug} />;
}

export default App;
