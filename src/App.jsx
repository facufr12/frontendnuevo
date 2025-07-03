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
    // Configurar interceptor de axios para manejo de errores y sesiones
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
            confirmButtonText: "Ir al login",
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
              container: 'mobile-friendly-swal'
            }
          }).then(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("sessionId");
            localStorage.removeItem("loginTime");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_lastname");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_email");
            window.location.href = "/";
          });
        }
        return Promise.reject(error);
      }
    );

    // Configurar headers por defecto para móviles
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    
    // Manejo de orientación en dispositivos móviles
    const handleOrientationChange = () => {
      // Pequeño delay para asegurar que el layout se ajuste
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    // Prevenir zoom en inputs en iOS
    const preventZoom = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        e.target.addEventListener('focus', () => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          }
        });
        
        e.target.addEventListener('blur', () => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
          }
        });
      }
    };

    // Event listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('focusin', preventZoom);

    return () => {
      axios.interceptors.response.eject(interceptor);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('focusin', preventZoom);
    };
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
