import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ENDPOINTS } from "../../config";
import ThemeToggle from "../../common/ThemeToggle";
import logoSrc from "../../../assets/logo-cober.webp";
// Definición de roles
const ROLES = {
  VENDEDOR: 1,
  SUPERVISOR: 2,
  ADMIN: 3,
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar cambios en el tema
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    };

    // Configurar un intervalo para detectar cambios en localStorage
    const interval = setInterval(handleThemeChange, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlert = (icon, title, text) => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "#754ffe",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      console.log("Enviando datos:", formData); // Debug
      const response = await axios.post(`${ENDPOINTS.AUTH}/login`, formData);
      console.log("Respuesta exitosa:", response.data); // Debug
      
      const { token, role } = response.data;
      localStorage.setItem("token", token);

      // Guardar hora de inicio de sesión
      const loginTime = new Date().toISOString();
      localStorage.setItem("loginTime", loginTime);

      // POST a /sessions/start
      try {
        const sessionRes = await axios.post(
          `${ENDPOINTS.AUTH}/sessions/start`,
          {
            login_time: loginTime,
            ip: "", // El backend puede obtener la IP real
            user_agent: navigator.userAgent
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        localStorage.setItem("sessionId", sessionRes.data.sessionId);
         // Guardar información del usuario
    localStorage.setItem('user_id', response.data.user.id);
    localStorage.setItem('user_name', response.data.user.first_name);
    localStorage.setItem('user_lastname', response.data.user.last_name);
    localStorage.setItem('user_role', response.data.user.role);
    localStorage.setItem('user_email', response.data.user.email);

      } catch (sessionError) {
        // Si falla el registro de sesión, puedes mostrar un mensaje o continuar
        console.error("Error registrando sesión:", sessionError);
      }

      await showAlert("success", "¡Bienvenido!", "Has iniciado sesión correctamente");

      if (role === ROLES.ADMIN) {
        navigate("/admin-dashboard");
      } else if (role === ROLES.SUPERVISOR) {
        navigate("/supervisor-dashboard");
      } else if (role === ROLES.VENDEDOR) {
        navigate("/prospectos-dashboard");
      }
    } catch (error) {
      console.error("Error completo:", error); // Debug detallado
      console.error("Respuesta del servidor:", error.response?.data); // Debug del backend
      console.error("Status code:", error.response?.status); // Debug del código de estado
      
      const errorMessage = error.response?.data?.message || "Error en el inicio de sesión";
      showAlert("error", "Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light position-relative">
      {/* Toggle de tema en la esquina superior derecha */}
      <div className="position-absolute top-0 end-0 m-3">
        <ThemeToggle />
      </div>
      
      <div className="card shadow-lg rounded-4 w-100" style={{ maxWidth: "500px" }}>
        <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
          <div className="d-flex flex-column align-items-center">
            <div className="mb-3" style={{ height: "60px", display: "flex", alignItems: "center" }}>
              <img 
                src={logoSrc} 
                alt="Cober Logo" 
                className="auth-logo"
                style={{ 
                  height: "60px", 
                  width: "auto",
                  maxWidth: "200px",
                  objectFit: "contain",
                  display: "block",
                  filter: "brightness(0) invert(1)", // Siempre blanco en el header primario
                  transition: "filter 0.3s ease"
                }} 
                onLoad={() => console.log("Logo cargado exitosamente")}
                onError={(e) => {
                  console.error("Error cargando logo desde assets:", logoSrc);
                  // Intentar con la ruta pública como fallback
                  e.target.src = "/logo-cober.svg";
                  e.target.onerror = () => {
                    console.error("Error cargando logo desde public también");
                    // Como último recurso, mostrar un placeholder
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: white;">COBER</div>';
                  };
                }}
              />
            </div>
            <h4 className="mb-0">Iniciar Sesión</h4>
          </div>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                onChange={handleChange} 
                placeholder="ejemplo@correo.com"
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                onChange={handleChange} 
                placeholder="Ingresa tu contraseña"
                required 
              />
            </div>
            
            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg rounded-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Iniciando sesión...
                  </>
                ) : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="mb-2">¿No tienes una cuenta? <Link to="/register" className="text-decoration-none">Regístrate</Link></p>
            <p>¿Olvidaste tu contraseña? <Link to="/reset" className="text-decoration-none">Recupérala aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;