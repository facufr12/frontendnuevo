import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import Login from "./components/features/auth/Login";
import Register from "./components/features/auth/Register";
import AdminDashboard from "./components/features/admin/AdminDashboard";
import ProspectosDashboard from "./components/features/vendedor/ProspectosDashboard";
import SupervisorDashboard from "./components/features/supervisor/SupervisorDashboard";
import UnknownRole from "./components/UnknownRole";
import ResetPassword from "./components/features/auth/ResetPassword"; 
import RequestReset from "./components/features/auth/RequestReset"; // Importar el componente ResetPassword
import VerifyEmail from "./components/features/auth/VerifyEmail";
import FormularioLead from "./components/features/lead/FormularioLead"; // Agrega este import
import SupervisorResumen from "./components/features/supervisor/SupervisorResumen";
import ProspectoDetalle from "./components/features/vendedor/ProspectoDetalle";


function App() {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Detecta sesión expirada o token inválido
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403) &&
          (
            error.response.data?.message === "Token no proporcionado" ||
            error.response.data?.message === "Token inválido"
          )
        ) {
          Swal.fire({
            icon: "warning",
            title: "Sesión expirada",
            text: "Tu sesión ha finalizado. Por favor, inicia sesión nuevamente.",
            confirmButtonText: "Ir al login"
          }).then(() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          });
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor-resumen" element={<SupervisorResumen />} />
        <Route path="/prospectos-dashboard" element={<ProspectosDashboard />} />
        <Route path="/unknown-role" element={<UnknownRole />} />
        <Route path="/reset" element={<RequestReset/>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />  {/* Nueva ruta */}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/formulario-lead" element={<FormularioLead />} /> {/* Nueva ruta */}
        <Route path="/prospectos" element={<ProspectosDashboard />} />
        <Route path="/prospectos/:id" element={<ProspectoDetalle />} />
      </Routes>
    </Router>
  );
}

export default App;
