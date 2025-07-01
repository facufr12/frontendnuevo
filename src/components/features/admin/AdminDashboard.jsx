import { useState, useEffect } from "react";
import { Container, Row, Col, Button, ListGroup, Navbar, Offcanvas, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaMoneyBillWave, 
  FaSignOutAlt, 
  FaBars, 
  FaChevronLeft,
  FaTachometerAlt,
  FaChartLine,
  FaCog,
  FaClipboardList
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import UsuariosAdmin from "./UsuariosAdmin";
import ListaPreciosAdmin from "./ListaPreciosAdmin";
import ThemeToggle from "../../common/ThemeToggle";
import logoSrc from "../../../assets/logo-cober.webp";
import { API_URL } from "../../config";

const drawerWidth = 220;

const AdminDashboard = () => {
  const [vista, setVista] = useState("usuarios");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cerrar drawer en pantallas pequeñas por defecto, mantener abierto en grandes
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setOpenDrawer(false); // En pantallas grandes, el sidebar es fijo
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Inicializar
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const sessionId = localStorage.getItem("sessionId");
      const loginTime = localStorage.getItem("loginTime");
      
      if (token && sessionId) {
        // Calcular tiempo de sesión
        const sessionTime = Math.floor((new Date() - new Date(loginTime)) / 1000); // en segundos
        
        // Registrar cierre de sesión
        await axios.post(
          `${API_URL}/sessions/end`,
          {
            session_id: sessionId,
            logout_time: new Date().toISOString(),
            session_time: sessionTime
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_lastname");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_email");
      
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        navigate('/');
      });
    }
  };

  // Contenido del sidebar
  const drawerContent = (
    <div style={{ width: drawerWidth }}>
      <div className="d-flex flex-column align-items-center p-3 border-bottom">
        <div className="mb-6" style={{ height: "40px", display: "flex", alignItems: "center", marginBottom: "60px" }}>
          <img 
            src={logoSrc} 
            alt="Cober Logo" 
            className="auth-logo"
            style={{ 
              height: "40px", 
              width: "auto",
              maxWidth: "120px",
              objectFit: "contain",
              display: "block",
              filter: "none",
              transition: "filter 0.3s ease"
            }} 
            onError={(e) => {
              console.error("Error cargando logo desde assets:", logoSrc);
              e.target.src = "/logo-cober.webp";
              e.target.onerror = () => {
                console.error("Error cargando logo desde public también");
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="width: 40px; height: 40px; background: rgba(117, 79, 254, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; color: #754ffe;">COBER</div>';
              };
            }}
          />
        </div>
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className="fw-bold fs-5">Administración</span>
          <Button variant="light" size="sm" onClick={() => setOpenDrawer(false)} className="d-lg-none">
            <FaChevronLeft />
          </Button>
        </div>
      </div>
      <ListGroup variant="flush">
        <ListGroup.Item 
          action 
          active={vista === "usuarios"} 
          onClick={() => setVista("usuarios")}
          className="border-0"
          style={{ transition: "all 0.2s ease" }}
        >
          <FaUsers className="me-2" /> Usuarios
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          active={vista === "precios"} 
          onClick={() => setVista("precios")}
          className="border-0"
          style={{ transition: "all 0.2s ease" }}
        >
          <FaMoneyBillWave className="me-2" /> Lista de Precios
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          active={vista === "estadisticas"} 
          onClick={() => setVista("estadisticas")}
          className="border-0"
          style={{ transition: "all 0.2s ease" }}
        >
          <FaChartLine className="me-2" /> Estadísticas
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          active={vista === "configuracion"} 
          onClick={() => setVista("configuracion")}
          className="border-0"
          style={{ transition: "all 0.2s ease" }}
        >
          <FaCog className="me-2" /> Configuración
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          onClick={handleLogout}
          className="border-0"
          style={{ transition: "all 0.2s ease" }}
        >
          <FaSignOutAlt className="me-2 text-danger" /> Cerrar sesión
        </ListGroup.Item>
      </ListGroup>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="d-flex admin-main-container" style={{ minHeight: "100vh" }}>
      {/* Sidebar fijo para escritorio */}
      <div
        className="d-none d-lg-block admin-sidebar border-end"
        style={{ width: drawerWidth, minHeight: "100vh", position: "fixed", zIndex: 1030 }}
      >
        {drawerContent}
      </div>
      
      {/* Offcanvas para móvil y tablet */}
      <Offcanvas
        show={openDrawer}
        onHide={() => setOpenDrawer(false)}
        backdrop={false}
        scroll={true}
        style={{ width: drawerWidth }}
        className="d-lg-none"
      >
        {drawerContent}
      </Offcanvas>
      
      {/* Contenido principal */}
      <div style={{ flex: 1, marginLeft: window.innerWidth >= 992 ? drawerWidth : 0 }}>
        {/* Barra superior */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom admin-topbar" style={{ minHeight: 56 }}>
          <div className="d-flex align-items-center">
            <Button 
              variant="light" 
              className="d-lg-none me-2" 
              onClick={() => setOpenDrawer(true)}
            >
              <FaBars />
            </Button>
            <span className="fw-bold fs-5">
              {vista === "usuarios" && "Gestión de Usuarios"}
              {vista === "precios" && "Lista de Precios"}
              {vista === "estadisticas" && "Estadísticas"}
              {vista === "configuracion" && "Configuración"}
            </span>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Contenido dinámico */}
        <Container fluid className="py-3 admin-content">
          {vista === "usuarios" && <UsuariosAdmin />}
          {vista === "precios" && <ListaPreciosAdmin />}
          {vista === "estadisticas" && (
            <div className="text-center py-5">
              <div className="text-muted">
                <FaChartLine size={48} className="mb-3 opacity-50" />
                <h4 className="mb-3">Módulo de Estadísticas</h4>
                <p className="text-muted">Esta funcionalidad estará disponible próximamente.</p>
              </div>
            </div>
          )}
          {vista === "configuracion" && (
            <div className="text-center py-5">
              <div className="text-muted">
                <FaCog size={48} className="mb-3 opacity-50" />
                <h4 className="mb-3">Módulo de Configuración</h4>
                <p className="text-muted">Esta funcionalidad estará disponible próximamente.</p>
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;