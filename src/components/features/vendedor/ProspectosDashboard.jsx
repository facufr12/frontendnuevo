import { useEffect, useState } from "react";
import axios from "axios";
import { ENDPOINTS } from "../../config";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaWhatsapp, FaSearch, FaPlus, FaUserPlus, FaFilter, FaListAlt, FaTachometerAlt, FaUsers, FaSignOutAlt, FaStore, FaBars, FaChevronLeft, FaEdit, FaEye, FaUserCheck, FaComment, FaUser, FaEnvelope, FaPhone, FaHome, FaIdBadge, FaCalendarAlt, FaMoneyBillWave, FaList, FaThLarge } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import PromocionesModal from "./PromocionesModal";
import ThemeToggle from "../../common/ThemeToggle";
import logoSrc from "../../../assets/logo-cober.webp";
import { Container, Row, Col, Button, Modal, Offcanvas, ListGroup, Spinner, Badge, Form, Table, Card, ButtonGroup, ProgressBar } from "react-bootstrap";

const drawerWidth = 220;

// Función para capitalizar la primera letra de cada palabra
const capitalizeName = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ProspectosDashboard = () => {
  const [prospectos, setProspectos] = useState([]);
  const [tiposAfiliacion, setTiposAfiliacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspecto, setSelectedProspecto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    tipo_afiliacion_id: "",
    sueldo_bruto: "",
    categoria_monotributo: "",
    estado: "Lead",
    comentario: "",
  });
  const [editValues, setEditValues] = useState({});
  const [familiares, setFamiliares] = useState([]);
  const [nuevoFamiliar, setNuevoFamiliar] = useState({
    vinculo: "",
    nombre: "",
    edad: "",
    tipo_afiliacion_id: "",
    sueldo_bruto: "",
    categoria_monotributo: ""
  });
  const [categoriasMonotributo] = useState(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]);
  const [showPromocionesModal, setShowPromocionesModal] = useState(false);
  const [prospectoSeleccionado, setProspectoSeleccionado] = useState(null);
  const [promociones, setPromociones] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [vista, setVista] = useState("prospectos");
  const [tipoVista, setTipoVista] = useState("tarjetas"); // "tabla" o "tarjetas"
  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    estado: "",
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);

  const navigate = useNavigate();

  const vinculos = [
    { value: "pareja/conyuge", label: "Pareja/Conyuge" },
    { value: "hijo/a", label: "Hijo/a" },
    { value: "familiar a cargo", label: "Familiar a cargo" }
  ];

  useEffect(() => {
    fetchProspectos();
    fetchTiposAfiliacion();
    fetchPromociones();
  }, []);

  const fetchProspectos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${ENDPOINTS.PROSPECTOS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProspectos(response.data);
    } catch (error) {
      console.error("Error al obtener los prospectos:", error);
      Swal.fire("Error", "No se pudieron cargar los prospectos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposAfiliacion = async () => {
    try {
      const response = await axios.get(`${ENDPOINTS.TIPOS_AFILIACION}`);
      setTiposAfiliacion(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de afiliación:", error);
      Swal.fire("Error", "No se pudieron cargar los tipos de afiliación.", "error");
    }
  };

  const fetchPromociones = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("https://wspflows.cober.online/api/vendedor/promociones", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromociones(data);
    } catch (error) {
      console.error("Error al obtener promociones:", error);
    }
  };

  const fetchHistorial = async (prospectoId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`https://wspflows.cober.online/api/prospectos/${prospectoId}/historial`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistorial(data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      setHistorial([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "tipo_afiliacion_id") {
      const tipo = tiposAfiliacion.find(t => t.id === Number(value));
      if (tipo?.requiere_sueldo !== 1) newFormData.sueldo_bruto = "";
      if (tipo?.requiere_categoria !== 1) newFormData.categoria_monotributo = "";
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = {
      ...formData,
      familiares: familiares.map(fam => ({
        vinculo: fam.vinculo,
        nombre: fam.nombre,
        edad: fam.edad ? Number(fam.edad) : null,
        tipo_afiliacion_id: fam.tipo_afiliacion_id ? Number(fam.tipo_afiliacion_id) : null,
        sueldo_bruto: fam.sueldo_bruto ? Number(fam.sueldo_bruto) : null,
        categoria_monotributo: fam.categoria_monotributo || null,
      })),
    };

    try {
      await axios.post(`${ENDPOINTS.PROSPECTOS}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Éxito", "Prospecto creado y cotizado correctamente.", "success");
      setShowFormModal(false);
      fetchProspectos();
      setFormData({
        nombre: "",
        apellido: "",
        edad: "",
        tipo_afiliacion_id: "",
        sueldo_bruto: "",
        categoria_monotributo: "",
        numero_contacto: "",
        correo: "",
        localidad: "",
        estado: "Lead",
        comentario: "",
      });
      setFamiliares([]);
    } catch (error) {
      console.error("Error al guardar el prospecto:", error);
      
      // Verificar si hay errores de validación específicos
      if (error.response && error.response.data && error.response.data.errores) {
        // Crear una lista HTML con los errores
        const erroresList = error.response.data.errores.map(err => `• ${err}`).join('<br>');
        
        Swal.fire({
          title: "Error de validación",
          html: `Por favor, corrige los siguientes errores:<br><br>${erroresList}`,
          icon: "warning",
          confirmButtonText: "Entendido"
        });
      } else {
        // Mensaje genérico para otros tipos de errores
        Swal.fire("Error", 
                  error.response?.data?.message || "No se pudo guardar el prospecto.", 
                  "error");
      }
    }
  };

  const handleCardChange = (id, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleCardSave = async (prospecto) => {
    const token = localStorage.getItem("token");
    const values = editValues[prospecto.id] || {};

    // Validación: si cambia el estado, debe haber comentario
    const estadoCambiado = values.estado !== undefined && values.estado !== prospecto.estado;
    const comentarioActual = values.comentario !== undefined ? values.comentario : prospecto.comentario;

    if (estadoCambiado && (!comentarioActual || comentarioActual.trim() === "")) {
      Swal.fire("Atención", "Debes agregar un comentario al cambiar el estado.", "warning");
      return;
    }

    try {
      await axios.put(
        `${ENDPOINTS.PROSPECTOS}/${prospecto.id}`,
        {
          ...prospecto,
          estado: values.estado !== undefined ? values.estado : prospecto.estado,
          comentario: comentarioActual,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Éxito", "Prospecto actualizado correctamente.", "success");
      fetchProspectos();
      setEditValues((prev) => ({ ...prev, [prospecto.id]: {} }));
    } catch (error) {
      console.error("Error al actualizar el prospecto:", error);
      
      // Verificar si hay errores de validación específicos
      if (error.response && error.response.data && error.response.data.errores) {
        // Crear una lista HTML con los errores
        const erroresList = error.response.data.errores.map(err => `• ${err}`).join('<br>');
        
        Swal.fire({
          title: "Error de validación",
          html: `Por favor, corrige los siguientes errores:<br><br>${erroresList}`,
          icon: "warning",
          confirmButtonText: "Entendido"
        });
      } else {
        // Mensaje genérico para otros tipos de errores
        Swal.fire("Error", 
                  error.response?.data?.message || "No se pudo actualizar el prospecto.", 
                  "error");
      }
    }
  };

  const estadoPorcentaje = {
    "Lead": 10,
    "1º Contacto": 25,
    "Calificado Cotización": 50,
    "Calificado Póliza": 75,
    "Calificado Pago": 90,
    "Venta": 100,
    "Fuera de zona": 0,
    "Fuera de edad": 0,
    "Preexistencia": 0,
    "Reafiliación": 0,
    "No contesta": 0,
    "prueba interna": 0,
    "Ya es socio": 0,
    "Busca otra Cobertura": 0,
    "Teléfono erróneo": 0,
    "No le interesa (económico)": 0,
    "No le interesa cartilla": 0
  };

  const handleFamiliarChange = e => {
    setNuevoFamiliar({ ...nuevoFamiliar, [e.target.name]: e.target.value });
  };

  const agregarFamiliar = () => {
    if (
      nuevoFamiliar.vinculo &&
      nuevoFamiliar.nombre &&
      nuevoFamiliar.edad &&
      (
        nuevoFamiliar.vinculo !== "pareja/conyuge" ||
        (
          nuevoFamiliar.tipo_afiliacion_id &&
          (
            (tiposAfiliacion.find(t => t.id === Number(nuevoFamiliar.tipo_afiliacion_id))?.requiere_sueldo !== 1 || nuevoFamiliar.sueldo_bruto) &&
            (tiposAfiliacion.find(t => t.id === Number(nuevoFamiliar.tipo_afiliacion_id))?.requiere_categoria !== 1 || nuevoFamiliar.categoria_monotributo)
          )
        )
      )
    ) {
      setFamiliares([...familiares, nuevoFamiliar]);
      setNuevoFamiliar({ vinculo: "", nombre: "", edad: "", tipo_afiliacion_id: "", sueldo_bruto: "", categoria_monotributo: "" });
    } else {
      Swal.fire("Atención", "Completa todos los datos requeridos del familiar.", "warning");
    }
  };

  const handleOpenPromocionesModal = (prospectoId) => {
    setProspectoSeleccionado(prospectoId);
    setShowPromocionesModal(true);
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleOpenHistorial = (prospecto) => {
    setSelectedProspecto(prospecto);
    fetchHistorial(prospecto.id);
    setModalHistorial(true);
  };

  // Filtrado dinámico
  const prospectosFiltrados = prospectos.filter((p) => {
    return (
      (filtros.nombre === "" || p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
      (filtros.apellido === "" || p.apellido.toLowerCase().includes(filtros.apellido.toLowerCase())) &&
      (filtros.edad === "" || String(p.edad) === filtros.edad) &&
      (filtros.estado === "" || p.estado.toLowerCase().includes(filtros.estado.toLowerCase()))
    );
  });

  // Drawer/Sidebar content
  const drawerContent = (
    <div style={{ width: drawerWidth }}>
      <div className="d-flex flex-column align-items-center p-3 border-bottom">
        <div className="mb-2" style={{ height: "40px", display: "flex", alignItems: "center", marginBottom: "60px" }}>
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
              e.target.src = "/logo-cober.svg";
              e.target.onerror = () => {
                console.error("Error cargando logo desde public también");
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="width: 40px; height: 40px; background: rgba(117, 79, 254, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; color: #754ffe;">COBER</div>';
              };
            }}
          />
        </div>
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className="fw-bold fs-5">Vendedor</span>
          <Button variant="light" size="sm" onClick={() => setOpenDrawer(false)}>
            <FaChevronLeft />
          </Button>
        </div>
      </div>
      <ListGroup variant="flush">
        <ListGroup.Item action active={vista === "prospectos"} onClick={() => setVista("prospectos")}>
          <FaTachometerAlt className="me-2" /> Prospectos
        </ListGroup.Item>
        <ListGroup.Item action onClick={() => setShowFormModal(true)}>
          <FaUserPlus className="me-2" /> Nuevo Prospecto
        </ListGroup.Item>
        <ListGroup.Item action onClick={handleLogout}>
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
    <div className="d-flex vendor-main-container" style={{ minHeight: "100vh" }}>
      {/* Sidebar fijo para escritorio */}
      <div
        className="d-none d-md-block vendor-sidebar border-end"
        style={{ width: drawerWidth, minHeight: "100vh", position: "fixed", zIndex: 1030 }}
      >
        {drawerContent}
      </div>
      {/* Offcanvas para móvil */}
      <Offcanvas
        show={openDrawer}
        onHide={() => setOpenDrawer(false)}
        backdrop={false}
        scroll={true}
        style={{ width: drawerWidth }}
        className="d-md-none"
      >
        {drawerContent}
      </Offcanvas>
      {/* Contenido principal */}
      <div style={{ flex: 1, marginLeft: window.innerWidth >= 768 ? drawerWidth : 0 }}>
        {/* Topbar */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom vendor-topbar" style={{ minHeight: 56 }}>
          <div className="d-flex align-items-center">
            <Button variant="light" className="d-md-none me-2" onClick={() => setOpenDrawer(true)}>
              <FaBars />
            </Button>
            <span className="fw-bold fs-5 d-none d-md-block">Gestión de Prospectos</span>
            <span className="fw-bold fs-6 d-md-none">Prospectos</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <ButtonGroup className="d-none d-lg-flex">
              <Button 
                variant={tipoVista === "tabla" ? "primary" : "outline-primary"} 
                size="sm"
                onClick={() => setTipoVista("tabla")}
                title="Vista de tabla"
              >
                <FaList />
              </Button>
              <Button 
                variant={tipoVista === "tarjetas" ? "primary" : "outline-primary"} 
                size="sm"
                onClick={() => setTipoVista("tarjetas")}
                title="Vista de tarjetas"
              >
                <FaThLarge />
              </Button>
            </ButtonGroup>
            <Button variant="primary" size="sm" className="rounded-3" onClick={() => setShowFormModal(true)}>
              <FaPlus className="me-1 d-none d-sm-inline" /> 
              <span className="d-none d-md-inline">Nuevo Prospecto</span>
              <span className="d-md-none">Nuevo</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <Container fluid className="py-3">
          {/* Formulario de filtros */}
          <div className="vendor-content shadow-sm p-3 mb-3">
            <Row className="g-2">
              <Col lg={3} md={4} sm={6}>
                <Form.Control
                  placeholder="Filtrar por nombre"
                  name="nombre"
                  value={filtros.nombre}
                  onChange={handleFiltroChange}
                  size="sm"
                />
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Control
                  placeholder="Filtrar por apellido"
                  name="apellido"
                  value={filtros.apellido}
                  onChange={handleFiltroChange}
                  size="sm"
                />
              </Col>
              <Col lg={2} md={4} sm={6}>
                <Form.Control
                  placeholder="Edad"
                  name="edad"
                  value={filtros.edad}
                  onChange={handleFiltroChange}
                  size="sm"
                  type="number"
                  min="0"
                />
              </Col>
              <Col lg={3} sm={6}>
                <Form.Control
                  placeholder="Estado"
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                  size="sm"
                />
              </Col>
              <Col lg={1} sm={12} className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-3"
                  onClick={() => setFiltros({ nombre: "", apellido: "", edad: "", estado: "" })}
                >
                  Limpiar
                </Button>
                <Button 
                  variant={tipoVista === "tabla" ? "primary" : "outline-primary"} 
                  size="sm" 
                  className="rounded-3 d-none d-sm-inline-block"
                  onClick={() => setTipoVista("tabla")}
                >
                  <FaList />
                </Button>
                <Button 
                  variant={tipoVista === "tarjetas" ? "primary" : "outline-primary"} 
                  size="sm" 
                  className="rounded-3"
                  onClick={() => setTipoVista("tarjetas")}
                >
                  <FaThLarge />
                </Button>
              </Col>
            </Row>
          </div>

          {/* Vista de tabla */}
          {tipoVista === "tabla" && (
            <div className="vendor-content shadow-sm p-3 mb-4">
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Edad</th>
                    <th>Contacto</th>
                    <th>Tipo Afiliación</th>
                    <th>Estado</th>
                    <th>Progreso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prospectosFiltrados.map((prospecto) => {
                    const values = editValues[prospecto.id] || {};
                    const estadoActual = values.estado !== undefined ? values.estado : prospecto.estado;
                    return (
                      <tr key={prospecto.id}>
                        <td>{prospecto.id}</td>
                        <td>{capitalizeName(prospecto.nombre)}</td>
                        <td>{capitalizeName(prospecto.apellido)}</td>
                        <td>{prospecto.edad}</td>
                        <td>
                          {prospecto.numero_contacto}
                          {prospecto.numero_contacto && (
                            <a
                              href={`https://wa.me/${prospecto.numero_contacto.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ms-2 text-success"
                              title="Contactar por WhatsApp"
                            >
                              <FaWhatsapp />
                            </a>
                          )}
                        </td>
                        <td>{tiposAfiliacion.find(t => t.id === Number(prospecto.tipo_afiliacion_id))?.etiqueta || "Sin datos"}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={estadoActual}
                            onChange={(e) => handleCardChange(prospecto.id, "estado", e.target.value)}
                          >
                            <option value="Lead">Lead</option>
                            <option value="1º Contacto">1º Contacto</option>
                            <option value="Calificado Cotización">Calificado Cotización</option>
                            <option value="Calificado Póliza">Calificado Póliza</option>
                            <option value="Calificado Pago">Calificado Pago</option>
                            <option value="Venta">Venta</option>
                            <option value="Fuera de zona">Fuera de zona</option>
                            <option value="Fuera de edad">Fuera de edad</option>
                            <option value="Preexistencia">Preexistencia</option>
                            <option value="Reafiliación">Reafiliación</option>
                            <option value="No contesta">No contesta</option>
                            <option value="prueba interna">prueba interna</option>
                            <option value="Ya es socio">Ya es socio</option>
                            <option value="Busca otra Cobertura">Busca otra Cobertura</option>
                            <option value="Teléfono erróneo">Teléfono erróneo</option>
                            <option value="No le interesa (económico)">No le interesa (económico)</option>
                            <option value="No le interesa cartilla">No le interesa cartilla</option>
                          </select>
                        </td>
                        <td>
                          <div className="progress" style={{ height: "12px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${estadoPorcentaje[estadoActual] || 0}%`
                              }}
                              aria-valuenow={estadoPorcentaje[estadoActual] || 0}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {estadoPorcentaje[estadoActual] || 0}%
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="success"
                              title="Guardar cambios"
                              onClick={() => handleCardSave(prospecto)}
                              disabled={
                                (values.estado === undefined || values.estado === prospecto.estado) &&
                                (values.comentario === undefined || values.comentario === prospecto.comentario)
                              }
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="info"
                              title="Ver historial"
                              onClick={() => handleOpenHistorial(prospecto)}
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="warning"
                              title="Aplicar promoción"
                              onClick={() => handleOpenPromocionesModal(prospecto.id)}
                            >
                              <FaMoneyBillWave />
                            </Button>
                            <Link
                              to={`/prospectos/${prospecto.id}`}
                              className="btn btn-primary btn-sm"
                              title="Ver detalles"
                            >
                              <FaUserCheck />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}

          {/* Vista de tarjetas */}
          {tipoVista === "tarjetas" && (
            <Row>
              {prospectosFiltrados.map((prospecto) => {
                const values = editValues[prospecto.id] || {};
                const estadoActual = values.estado !== undefined ? values.estado : prospecto.estado;
                const progreso = estadoPorcentaje[estadoActual] || 0;
                return (
                  <Col xl={4} lg={6} md={12} key={prospecto.id} className="mb-3">
                    <Card className="h-100 shadow-sm vendor-content">
                      <Card.Header className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h5 className="fw-bold mb-1 text-truncate">
                            {capitalizeName(prospecto.nombre)} {capitalizeName(prospecto.apellido)}
                          </h5>
                          <small className="text-muted">{prospecto.edad} años</small>
                        </div>
                        <Badge bg={
                          progreso === 100 ? "success" : 
                          progreso > 50 ? "primary" : 
                          progreso > 0 ? "warning" : 
                          "danger"
                        } className="ms-2">
                          {prospecto.estado}
                        </Badge>
                      </Card.Header>
                      <Card.Body className="p-3">
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">Tipo de Afiliación:</small>
                          <small className="fw-medium">
                            {tiposAfiliacion.find(t => t.id === Number(prospecto.tipo_afiliacion_id))?.etiqueta || "Sin datos"}
                          </small>
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">Contacto:</small>
                          <div className="d-flex align-items-center flex-wrap">
                            <div className="d-flex align-items-center me-2 mb-1">
                              <FaPhone className="me-1 text-muted" size={12} /> 
                              <small>{prospecto.numero_contacto || "No disponible"}</small>
                              {prospecto.numero_contacto && (
                                <a
                                  href={`https://wa.me/${prospecto.numero_contacto.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ms-1 text-success"
                                  title="Contactar por WhatsApp"
                                >
                                  <FaWhatsapp size={16} />
                                </a>
                              )}
                            </div>
                          </div>
                          {prospecto.correo && (
                            <div className="d-flex align-items-center mb-1">
                              <MdEmail className="me-1 text-muted" size={12} /> 
                              <small className="text-truncate">{prospecto.correo}</small>
                            </div>
                          )}
                          {prospecto.localidad && (
                            <div className="d-flex align-items-center mb-1">
                              <FaHome className="me-1 text-muted" size={12} /> 
                              <small>{prospecto.localidad}</small>
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">Comentario:</small>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="comentario"
                            value={values.comentario !== undefined ? values.comentario : prospecto.comentario || ""}
                            onChange={(e) => handleCardChange(prospecto.id, "comentario", e.target.value)}
                            placeholder="Agrega un comentario..."
                            className="mb-1"
                            size="sm"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Estado:</small>
                          <Form.Select 
                            className="mb-2"
                            size="sm"
                            value={estadoActual}
                            onChange={(e) => handleCardChange(prospecto.id, "estado", e.target.value)}
                          >
                            <option value="Lead">Lead</option>
                            <option value="1º Contacto">1º Contacto</option>
                            <option value="Calificado Cotización">Calificado Cotización</option>
                            <option value="Calificado Póliza">Calificado Póliza</option>
                            <option value="Calificado Pago">Calificado Pago</option>
                            <option value="Venta">Venta</option>
                            <option value="Fuera de zona">Fuera de zona</option>
                            <option value="Fuera de edad">Fuera de edad</option>
                            <option value="Preexistencia">Preexistencia</option>
                            <option value="Reafiliación">Reafiliación</option>
                            <option value="No contesta">No contesta</option>
                            <option value="prueba interna">prueba interna</option>
                            <option value="Ya es socio">Ya es socio</option>
                            <option value="Busca otra Cobertura">Busca otra Cobertura</option>
                            <option value="Teléfono erróneo">Teléfono erróneo</option>
                            <option value="No le interesa (económico)">No le interesa (económico)</option>
                            <option value="No le interesa cartilla">No le interesa cartilla</option>
                          </Form.Select>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Progreso:</small>
                          <ProgressBar 
                            now={progreso} 
                            label={`${progreso}%`} 
                            variant={
                              progreso === 100 ? "success" : 
                              progreso > 50 ? "primary" : 
                              progreso > 0 ? "warning" : 
                              "danger"
                            }
                          />
                        </div>
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted">ID: {prospecto.id}</small>
                        </div>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="success"
                            className="rounded-3"
                            title="Guardar cambios"
                            onClick={() => handleCardSave(prospecto)}
                            disabled={
                              (values.estado === undefined || values.estado === prospecto.estado) &&
                              (values.comentario === undefined || values.comentario === prospecto.comentario)
                            }
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="info"
                            className="rounded-3"
                            title="Ver historial"
                            onClick={() => handleOpenHistorial(prospecto)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            className="rounded-3"
                            title="Aplicar promoción"
                            onClick={() => handleOpenPromocionesModal(prospecto.id)}
                          >
                            <FaMoneyBillWave />
                          </Button>
                          <Link
                            to={`/prospectos/${prospecto.id}`}
                            className="btn btn-primary btn-sm rounded-3"
                            title="Ver detalles"
                          >
                            <FaUserCheck />
                          </Link>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
              {prospectosFiltrados.length === 0 && (
                <Col className="text-center py-5">
                  <p className="text-muted">No se encontraron prospectos con los filtros aplicados.</p>
                </Col>
              )}
            </Row>
          )}
        </Container>
      </div>

      {/* Modal para crear prospectos */}
      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Prospecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Edad</Form.Label>
                  <Form.Control
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleChange}
                    min={0}
                    max={120}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Afiliación</Form.Label>
                  <Form.Select
                    name="tipo_afiliacion_id"
                    value={formData.tipo_afiliacion_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona...</option>
                    {tiposAfiliacion.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.etiqueta}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {/* Campo SUELDO BRUTO solo si requiere_sueldo */}
            {tiposAfiliacion.find(t => t.id === Number(formData.tipo_afiliacion_id))?.requiere_sueldo === 1 && (
              <Form.Group className="mb-3">
                <Form.Label>Sueldo Bruto</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="sueldo_bruto"
                  value={formData.sueldo_bruto}
                  onChange={handleChange}
                  min={0}
                  max={99999999.99}
                  required
                />
              </Form.Group>
            )}

            {/* Campo CATEGORÍA solo si requiere_categoria */}
            {tiposAfiliacion.find(t => t.id === Number(formData.tipo_afiliacion_id))?.requiere_categoria === 1 && (
              <Form.Group className="mb-3">
                <Form.Label>Categoría Monotributo</Form.Label>
                <Form.Select
                  name="categoria_monotributo"
                  value={formData.categoria_monotributo || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona...</option>
                  {Array.isArray(tiposAfiliacion.find(t => t.id === Number(formData.tipo_afiliacion_id)).categorias)
                    ? tiposAfiliacion.find(t => t.id === Number(formData.tipo_afiliacion_id)).categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    // Si categorias viene como string JSON:
                    : Array.isArray(JSON.parse(tiposAfiliacion.find(t => t.id === Number(formData.tipo_afiliacion_id)).categorias || "[]")) &&
                      JSON.parse(tiposAfiliacion.find(t => t.id === Number(formData.tipo_afiliacion_id)).categorias || "[]").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                  }
                </Form.Select>
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de contacto</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_contacto"
                    value={formData.numero_contacto || ""}
                    onChange={handleChange}
                    required
                    maxLength={30}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={formData.correo || ""}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Localidad</Form.Label>
              <Form.Control
                type="text"
                name="localidad"
                value={formData.localidad || ""}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                name="comentario"
                value={formData.comentario}
                onChange={handleChange}
                maxLength={500}
                placeholder="Agrega un comentario sobre el prospecto"
                rows={3}
              />
            </Form.Group>

            {/* Bloque para agregar familiares */}
            <Card className="mb-3 mt-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Familiares</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vínculo</Form.Label>
                      <Form.Select
                        name="vinculo"
                        value={nuevoFamiliar.vinculo}
                        onChange={handleFamiliarChange}
                      >
                        <option value="">Selecciona...</option>
                        {vinculos.map(v => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={nuevoFamiliar.nombre}
                        onChange={handleFamiliarChange}
                        maxLength={100}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Edad</Form.Label>
                      <Form.Control
                        type="number"
                        name="edad"
                        value={nuevoFamiliar.edad}
                        onChange={handleFamiliarChange}
                        min={0}
                        max={120}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                {/* Si vínculo es pareja/conyuge, mostrar tipo de afiliación y campos adicionales */}
                {nuevoFamiliar.vinculo === "pareja/conyuge" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Afiliación</Form.Label>
                      <Form.Select
                        name="tipo_afiliacion_id"
                        value={nuevoFamiliar.tipo_afiliacion_id}
                        onChange={handleFamiliarChange}
                        required
                      >
                        <option value="">Selecciona...</option>
                        {tiposAfiliacion.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.etiqueta}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    {/* Sueldo bruto si corresponde */}
                    {tiposAfiliacion.find(t => t.id === Number(nuevoFamiliar.tipo_afiliacion_id))?.requiere_sueldo === 1 && (
                      <Form.Group className="mb-3">
                        <Form.Label>Sueldo Bruto</Form.Label>
                        <Form.Control
                          type="number"
                          name="sueldo_bruto"
                          value={nuevoFamiliar.sueldo_bruto}
                          onChange={handleFamiliarChange}
                          min={0}
                        />
                      </Form.Group>
                    )}
                    
                    {/* Categoría monotributo si corresponde */}
                    {tiposAfiliacion.find(t => t.id === Number(nuevoFamiliar.tipo_afiliacion_id))?.requiere_categoria === 1 && (
                      <Form.Group className="mb-3">
                        <Form.Label>Categoría Monotributo</Form.Label>
                        <Form.Select
                          name="categoria_monotributo"
                          value={nuevoFamiliar.categoria_monotributo}
                          onChange={handleFamiliarChange}
                        >
                          <option value="">Selecciona...</option>
                          {categoriasMonotributo.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    )}
                  </>
                )}
                
                <Button
                  variant="primary"
                  onClick={agregarFamiliar}
                  className="mt-2"
                >
                  Agregar Familiar
                </Button>
                
                {familiares.length > 0 && (
                  <div className="mt-3">
                    <h6>Familiares agregados:</h6>
                    <ListGroup>
                      {familiares.map((fam, idx) => (
                        <ListGroup.Item key={idx}>
                          <strong>{fam.vinculo}:</strong> {fam.nombre} ({fam.edad} años)
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowFormModal(false)} className="me-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Crear Prospecto
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de historial */}
      <Modal show={modalHistorial} onHide={() => setModalHistorial(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Historial de acciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {historial.length === 0 ? (
              <div className="text-center text-muted py-4">
                No hay registros de historial para este prospecto
              </div>
            ) : (
              historial.map((accion, index) => (
                <Card key={index} className="mb-2 border-left-info">
                  <Card.Body className="py-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Badge bg={accion.accion === 'APLICAR_PROMOCION' ? 'success' : 'info'}>
                        {accion.accion}
                      </Badge>
                      <small className="text-muted">{new Date(accion.fecha).toLocaleString()}</small>
                    </div>
                    <div>{accion.descripcion}</div>
                    <div className="mt-1">
                      <small>Por: {accion.first_name} {accion.last_name}</small>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de promociones */}
      <PromocionesModal
        prospectoId={prospectoSeleccionado}
        show={showPromocionesModal}
        onClose={() => setShowPromocionesModal(false)}
        onPromocionAplicada={fetchProspectos}
      />
    </div>
  );
};

export default ProspectosDashboard;