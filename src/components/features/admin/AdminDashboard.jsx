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
import useScreenSize from "../../../hooks/useScreenSize";
import '../vendedor/mobile-styles.css';
import './admin-mobile-styles.css';

const drawerWidth = 220;

const AdminDashboard = () => {
  const { isMobile } = useScreenSize();
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

  // En móvil, cerrar automáticamente el drawer cuando se selecciona una vista
  const handleVistaChange = (nuevaVista) => {
    setVista(nuevaVista);
    if (isMobile) {
      setOpenDrawer(false);
    }
  };

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
    <div style={{ width: drawerWidth }} className={isMobile ? 'mobile-sidebar' : ''}>
      <div className={`d-flex flex-column align-items-center p-3 border-bottom ${isMobile ? 'mobile-sidebar-header' : ''}`}>
        <div className="mb-6" style={{ height: "40px", display: "flex", alignItems: "center", marginBottom: isMobile ? "30px" : "60px" }}>
          <img 
            src={logoSrc} 
            alt="Cober Logo" 
            className="auth-logo"
            style={{ 
              height: isMobile ? "30px" : "40px", 
              width: "auto",
              maxWidth: isMobile ? "100px" : "120px",
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
          <span className={`fw-bold ${isMobile ? 'fs-6' : 'fs-5'}`}>
            {isMobile ? "Admin" : "Administración"}
          </span>
          <Button 
            variant="light" 
            size="sm" 
            onClick={() => setOpenDrawer(false)} 
            className={`d-lg-none ${isMobile ? 'mobile-btn' : ''}`}
          >
            <FaChevronLeft />
          </Button>
        </div>
      </div>
      <ListGroup variant="flush" className={isMobile ? 'mobile-nav-list' : ''}>
        <ListGroup.Item 
          action 
          active={vista === "usuarios"} 
          onClick={() => handleVistaChange("usuarios")}
          className={`border-0 ${isMobile ? 'mobile-nav-item' : ''}`}
          style={{ transition: "all 0.2s ease" }}
        >
          <FaUsers className="me-2" /> Usuarios
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          active={vista === "precios"} 
          onClick={() => handleVistaChange("precios")}
          className={`border-0 ${isMobile ? 'mobile-nav-item' : ''}`}
          style={{ transition: "all 0.2s ease" }}
        >
          <FaMoneyBillWave className="me-2" /> {isMobile ? "Precios" : "Lista de Precios"}
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          active={vista === "estadisticas"} 
          onClick={() => handleVistaChange("estadisticas")}
          className={`border-0 ${isMobile ? 'mobile-nav-item' : ''}`}
          style={{ transition: "all 0.2s ease" }}
        >
          <FaChartLine className="me-2" /> Estadísticas
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          active={vista === "configuracion"} 
          onClick={() => handleVistaChange("configuracion")}
          className={`border-0 ${isMobile ? 'mobile-nav-item' : ''}`}
          style={{ transition: "all 0.2s ease" }}
        >
          <FaCog className="me-2" /> Configuración
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          onClick={handleLogout}
          className={`border-0 ${isMobile ? 'mobile-nav-item' : ''}`}
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
    <div className={`d-flex admin-main-container ${isMobile ? 'mobile-admin-container' : ''}`} style={{ minHeight: "100vh" }}>
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
        backdrop={isMobile ? true : false}
        scroll={true}
        style={{ width: drawerWidth }}
        className={`d-lg-none ${isMobile ? 'mobile-offcanvas' : ''}`}
      >
        {drawerContent}
      </Offcanvas>
      
      {/* Contenido principal */}
      <div style={{ flex: 1, marginLeft: window.innerWidth >= 992 ? drawerWidth : 0 }} className={isMobile ? 'mobile-main-content' : ''}>
        {/* Barra superior */}
        <div 
          className={`d-flex align-items-center justify-content-between px-3 py-2 border-bottom admin-topbar ${isMobile ? 'mobile-admin-topbar' : ''}`} 
          style={{ minHeight: isMobile ? 48 : 56 }}
        >
          <div className="d-flex align-items-center">
            <Button 
              variant="light" 
              className={`d-lg-none me-2 ${isMobile ? 'mobile-btn' : ''}`} 
              onClick={() => setOpenDrawer(true)}
            >
              <FaBars />
            </Button>
            <span className={`fw-bold ${isMobile ? 'fs-6' : 'fs-5'}`}>
              {vista === "usuarios" && (isMobile ? "Usuarios" : "Gestión de Usuarios")}
              {vista === "precios" && (isMobile ? "Precios" : "Lista de Precios")}
              {vista === "estadisticas" && "Estadísticas"}
              {vista === "configuracion" && "Configuración"}
            </span>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Contenido dinámico */}
        <Container fluid className={`py-3 admin-content ${isMobile ? 'mobile-admin-content' : ''}`}>
          {vista === "usuarios" && <UsuariosAdmin />}
          {vista === "precios" && <ListaPreciosAdmin />}
          {vista === "estadisticas" && (
            <div className="text-center py-5">
              <div className="text-muted">
                <FaChartLine size={isMobile ? 32 : 48} className="mb-3 opacity-50" />
                <h4 className={`mb-3 ${isMobile ? 'fs-5' : ''}`}>Módulo de Estadísticas</h4>
                <p className={`text-muted ${isMobile ? 'text-sm' : ''}`}>Esta funcionalidad estará disponible próximamente.</p>
              </div>
            </div>
          )}
          {vista === "configuracion" && (
            <div className="text-center py-5">
              <div className="text-muted">
                <FaCog size={isMobile ? 32 : 48} className="mb-3 opacity-50" />
                <h4 className={`mb-3 ${isMobile ? 'fs-5' : ''}`}>Módulo de Configuración</h4>
                <p className={`text-muted ${isMobile ? 'text-sm' : ''}`}>Esta funcionalidad estará disponible próximamente.</p>
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;