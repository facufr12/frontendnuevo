import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Offcanvas,
  ListGroup,
  Spinner,
  Badge,
  Form,
  Table,
  Card,
} from "react-bootstrap";
import {
  FaTachometerAlt,
  FaUsers,
  FaSignOutAlt,
  FaStore,
  FaBars,
  FaChevronLeft,
  FaEdit,
  FaEye,
  FaUserCheck,
  FaComment,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaIdBadge,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPeopleCarry,
  FaInfoCircle,
  FaUserFriends,
  FaChartBar,
  FaCoins,
} from "react-icons/fa";
import SupervisorResumen from "./SupervisorResumen";
import MetricasVendedor from "./MetricasVendedor";
import CotizacionesPorUsuario from "./CotizacionesPorUsuario";
import SupervisorCotizaciones from "./SupervisorCotizaciones";
import VendedoresSupervisor from "./VendedoresSupervisor"; // Importamos el nuevo componente
import ChatWidget from '../../common/ChatWidget';
import ThemeToggle from "../../common/ThemeToggle";
import { API_URL } from "../../config";

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

const SupervisorDashboard = () => {
  const [prospectos, setProspectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prospectoSeleccionado, setProspectoSeleccionado] = useState(null);
  const [vista, setVista] = useState("prospectos"); // "prospectos", "resumen", "cotizaciones", "metricas", "vendedores"
  const [historial, setHistorial] = useState([]);
  const [modalTipo, setModalTipo] = useState("detalle"); // "detalle" o "historial"
  const [filtros, setFiltros] = useState({
    vendedor: "",
    edad: "",
    estado: "",
    nombre: "",
    apellido: "",
  });
  const [cotizaciones, setCotizaciones] = useState([]); // <--- NUEVO
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspectos();
  }, []);

  const fetchProspectos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/supervisor/prospectos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProspectos(response.data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los prospectos.", "error");
      console.error("Error al obtener prospectos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async (prospectoId) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${API_URL}/prospectos/${prospectoId}/historial`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setHistorial(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Agrega el campo vendedor para filtro y visualización
  const prospectosConVendedor = prospectos.map(p => ({
    ...p,
    vendedor: (p.vendedor_nombre && p.vendedor_apellido)
      ? `${p.vendedor_nombre} ${p.vendedor_apellido}`
      : p.vendedor_nombre || p.vendedor_apellido || "Sin asignar",
    handleOpenModal: handleOpenModal,
    handleOpenHistorial: handleOpenHistorial
  }));

  function handleOpenModal(row) {
    setProspectoSeleccionado(row);
    setModalTipo("detalle");
    setModalOpen(true);
    fetchHistorial(row.id);
  }

  function handleOpenHistorial(row) {
    setProspectoSeleccionado(row);
    setModalTipo("historial");
    setModalOpen(true);
    fetchHistorial(row.id);
  }

  async function handleOpenCotizacion(row) {
    setProspectoSeleccionado(row);
    setModalTipo("cotizacion");
    setModalOpen(true);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/lead/${row.id}/cotizaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCotizaciones(data); // Usa la misma estructura de datos que en FormularioLead
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error);
      setCotizaciones([]);
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false);
    setProspectoSeleccionado(null);
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // Filtrado dinámico
  const prospectosFiltrados = prospectosConVendedor.filter((p) => {
    return (
      (filtros.vendedor === "" || p.vendedor.toLowerCase().includes(filtros.vendedor.toLowerCase())) &&
      (filtros.edad === "" || String(p.edad) === filtros.edad) &&
      (filtros.estado === "" || p.estado.toLowerCase().includes(filtros.estado.toLowerCase())) &&
      (filtros.nombre === "" || p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
      (filtros.apellido === "" || p.apellido.toLowerCase().includes(filtros.apellido.toLowerCase()))
    );
  });

  // Logo con fallback
  const logoSrc = "/logo-cober.webp";

  // Drawer/Sidebar content - añadir el logo y tema consistente
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
              filter: "none", // Sin filtro por defecto, se adapta al tema con CSS
              transition: "filter 0.3s ease"
            }} 
            onError={(e) => {
              console.error("Error cargando logo desde public:", logoSrc);
              e.target.src = "/logo-cober.svg";
              e.target.onerror = () => {
                console.error("Error cargando logo svg también");
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="width: 40px; height: 40px; background: rgba(117, 79, 254, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; color: #754ffe;">COBER</div>';
              };
            }}
          />
        </div>
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className="fw-bold fs-5">Supervisor</span>
          <Button variant="light" size="sm" onClick={() => setOpenDrawer(false)}>
            <FaChevronLeft />
          </Button>
        </div>
      </div>
      <ListGroup variant="flush">
        <ListGroup.Item action active={vista === "prospectos"} onClick={() => setVista("prospectos")}>
          <FaTachometerAlt className="me-2" /> Prospectos
        </ListGroup.Item>
        <ListGroup.Item action active={vista === "resumen"} onClick={() => setVista("resumen")}>
          <FaChartBar className="me-2" /> Resumen
        </ListGroup.Item>
        <ListGroup.Item action active={vista === "metricas"} onClick={() => setVista("metricas")}>
          <FaStore className="me-2" /> Métricas por Vendedor
        </ListGroup.Item>
        <ListGroup.Item action active={vista === "cotizaciones"} onClick={() => setVista("cotizaciones")}>
          <FaCoins className="me-2" /> Cotizaciones
        </ListGroup.Item>
        {/* Nueva opción para Vendedores */}
        <ListGroup.Item action active={vista === "vendedores"} onClick={() => setVista("vendedores")}>
          <FaUsers className="me-2" /> Vendedores
        </ListGroup.Item>
        <ListGroup.Item action onClick={handleLogout}>
          <FaSignOutAlt className="me-2 text-danger" /> Cerrar sesión
        </ListGroup.Item>
      </ListGroup>
    </div>
  );

  return (
    <div className="d-flex supervisor-main-container" style={{ minHeight: "100vh" }}>
      {/* Sidebar fijo para escritorio */}
      <div
        className="d-none d-md-block supervisor-sidebar border-end"
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
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom supervisor-topbar" style={{ minHeight: 56 }}>
          <div className="d-flex align-items-center">
            <Button variant="light" className="d-md-none me-2" onClick={() => setOpenDrawer(true)}>
              <FaBars />
            </Button>
            <span className="fw-bold fs-5">
              {vista === "prospectos" && "Dashboard - Prospectos"}
              {vista === "resumen" && "Resumen Ejecutivo"}
              {vista === "metricas" && "Métricas por Vendedor"}
              {vista === "cotizaciones" && "Gestión de Cotizaciones"}
              {vista === "vendedores" && "Gestión de Vendedores"}
            </span>
          </div>
          <ThemeToggle />
        </div>
        <Container fluid className="py-3 supervisor-content">
          {vista === "prospectos" && (
            <>
              <div className="d-flex align-items-center mb-4">
                <FaTachometerAlt className="me-2 text-primary" size={24} />
                <h4 className="mb-0 fw-bold">Dashboard de Prospectos</h4>
              </div>
              <SupervisorResumen />
              {/* Formulario de filtros */}
              <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-light border-0">
                  <h6 className="mb-0 fw-bold">Filtros de Búsqueda</h6>
                </Card.Header>
                <Card.Body className="p-3">
                  <Row className="g-3">
                    <Col md={2} sm={6}>
                      <Form.Label className="small fw-semibold text-muted">Vendedor</Form.Label>
                      <Form.Control
                        placeholder="Buscar vendedor..."
                        name="vendedor"
                        value={filtros.vendedor}
                        onChange={handleFiltroChange}
                        size="sm"
                        className="rounded-3"
                      />
                    </Col>
                    <Col md={2} sm={6}>
                      <Form.Label className="small fw-semibold text-muted">Edad</Form.Label>
                      <Form.Control
                        placeholder="Edad"
                        name="edad"
                        value={filtros.edad}
                        onChange={handleFiltroChange}
                        size="sm"
                        type="number"
                        min="0"
                        className="rounded-3"
                      />
                    </Col>
                    <Col md={2} sm={6}>
                      <Form.Label className="small fw-semibold text-muted">Estado</Form.Label>
                      <Form.Control
                        placeholder="Buscar estado..."
                        name="estado"
                        value={filtros.estado}
                        onChange={handleFiltroChange}
                        size="sm"
                        className="rounded-3"
                      />
                    </Col>
                    <Col md={2} sm={6}>
                      <Form.Label className="small fw-semibold text-muted">Nombre</Form.Label>
                      <Form.Control
                        placeholder="Buscar nombre..."
                        name="nombre"
                        value={filtros.nombre}
                        onChange={handleFiltroChange}
                        size="sm"
                        className="rounded-3"
                      />
                    </Col>
                    <Col md={2} sm={6}>
                      <Form.Label className="small fw-semibold text-muted">Apellido</Form.Label>
                      <Form.Control
                        placeholder="Buscar apellido..."
                        name="apellido"
                        value={filtros.apellido}
                        onChange={handleFiltroChange}
                        size="sm"
                        className="rounded-3"
                      />
                    </Col>
                    <Col md={2} sm={6} className="d-flex align-items-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100 rounded-3"
                        onClick={() => setFiltros({ vendedor: "", edad: "", estado: "", nombre: "", apellido: "" })}
                      >
                        Limpiar Filtros
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </Spinner>
                      <p className="mt-3 text-muted">Cargando prospectos...</p>
                    </div>
                  ) : prospectosFiltrados.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="text-muted">
                        <FaUser size={48} className="mb-3 opacity-50" />
                        <p className="h5">No se encontraron prospectos</p>
                        <p className="text-muted">Intenta ajustar los filtros de búsqueda.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table striped hover className="mb-0">
                        <thead className="table-primary">
                          <tr>
                            <th className="fw-bold border-0">ID</th>
                            <th className="fw-bold border-0">Nombre Completo</th>
                            <th className="fw-bold border-0">Edad</th>
                            <th className="fw-bold border-0">Contacto</th>
                            <th className="fw-bold border-0">Estado</th>
                            <th className="fw-bold border-0">Vendedor</th>
                            <th className="fw-bold border-0 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prospectosFiltrados.map((row) => (
                            <tr key={row.id} style={{ transition: "background-color 0.2s ease" }}>
                              <td className="fw-semibold text-primary">{row.id}</td>
                              <td>
                                <div>
                                  <div className="fw-semibold">{capitalizeName(row.nombre)} {capitalizeName(row.apellido)}</div>
                                  <small className="text-muted">{row.correo}</small>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                                  {row.edad} años
                                </span>
                              </td>
                              <td className="text-muted">{row.numero_contacto}</td>
                              <td>
                                <Badge bg="primary" className="rounded-pill">
                                  {row.estado}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-info-subtle rounded-circle p-1 me-2">
                                    <FaUser className="text-info" size={12} />
                                  </div>
                                  <span className="text-truncate" style={{ maxWidth: "120px" }}>
                                    {row.vendedor}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1 justify-content-center">
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="rounded-3"
                                    title="Ver información"
                                    onClick={() => handleOpenModal(row)}
                                  >
                                    <FaUserCheck size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-info"
                                    className="rounded-3"
                                    title="Ver historial"
                                    onClick={() => handleOpenHistorial(row)}
                                  >
                                    <FaComment size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    className="rounded-3"
                                    title="Ver cotizaciones"
                                    onClick={() => handleOpenCotizacion(row)}
                                  >
                                    <FaMoneyBillWave size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
              {/* Modal de detalle/historial */}
              <Modal show={modalOpen} onHide={handleCloseModal} centered size="lg" className="supervisor-modal">
                <Modal.Header closeButton>
                  <Modal.Title>
                    {modalTipo === "historial"
                      ? "Historial de acciones"
                      : modalTipo === "cotizacion"
                      ? `Cotizaciones de ${capitalizeName(prospectoSeleccionado?.nombre || "")} ${capitalizeName(prospectoSeleccionado?.apellido || "")}`
                      : "Información del Prospecto"}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {modalTipo === "historial" ? (
                    <div style={{ maxHeight: 300, overflowY: "auto", background: "#f9f9f9", borderRadius: 8, padding: 16 }}>
                      {historial.length === 0 ? (
                        <div className="text-muted">Sin historial</div>
                      ) : (
                        historial.map((accion, index) => (
                          <div key={index} className="historial-item">
                            <div className="historial-fecha">{new Date(accion.fecha).toLocaleString()}</div>
                            <div className="historial-accion">
                              {accion.accion === 'APLICAR_PROMOCION' ? (
                                <Badge bg="success">Promoción aplicada</Badge>
                              ) : (
                                <Badge bg="info">{accion.accion}</Badge>
                              )}
                            </div>
                            <div className="historial-descripcion">{accion.descripcion}</div>
                            <div className="historial-vendedor">Por: {accion.first_name} {accion.last_name}</div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : modalTipo === "cotizacion" ? (
                    cotizaciones.length === 0 ? (
                      <div className="text-muted">Sin cotizaciones</div>
                    ) : (
                      <>
                        <div className="row">
                          {cotizaciones.map((cotizacion, index) => (
                            <div className="col-md-6 mb-4" key={index}>
                              <div className="card">
                                <div className="card-header text-center">
                                  <h5>{cotizacion.plan}</h5>
                                </div>
                                <div className="card-body">
                                  <p><strong>Grupo Familiar:</strong> {cotizacion.detalles.map(d => d.vinculo).join(", ")}</p>
                                  {cotizacion.detalles.map((detalle, idx) => (
                                    <div key={idx} className="mb-2">
                                      <p><strong>{detalle.vinculo}:</strong></p>
                                      <p>Edad: {detalle.edad}</p>
                                      <p>Precio Base: ${detalle.precio_base}</p>
                                      <p>Descuento: ${parseFloat(detalle.descuento).toFixed(2)} ({detalle.tipo_afiliacion})</p>
                                      {detalle.sueldo_bruto && (
                                        <p>Sueldo Bruto: ${detalle.sueldo_bruto}</p>
                                      )}
                                      <p>Precio Final: ${detalle.precio_final}</p>
                                    </div>
                                  ))}
                                  <hr />
                                  <p><strong>Total Bruto:</strong> ${cotizacion.total_bruto}</p>
                                  <p><strong>Total Descuento:</strong> ${cotizacion.total_descuento}</p>
                                  <p><strong>Total Final:</strong> ${cotizacion.total_final}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  ) : prospectoSeleccionado ? (
                    <>
                      <Row className="mb-2">
                        <Col xs={12} md={6}>
                          <div className="mb-2"><FaUser className="me-2" /> <b>Nombre:</b> {capitalizeName(prospectoSeleccionado.nombre)} {capitalizeName(prospectoSeleccionado.apellido)}</div>
                          <div className="mb-2"><FaIdBadge className="me-2" /> <b>Edad:</b> {prospectoSeleccionado.edad}</div>
                          <div className="mb-2"><FaPhone className="me-2" /> <b>Contacto:</b> {prospectoSeleccionado.numero_contacto}</div>
                          <div className="mb-2"><FaEnvelope className="me-2" /> <b>Email:</b> {prospectoSeleccionado.correo}</div>
                          <div className="mb-2"><FaHome className="me-2" /> <b>Localidad:</b> {prospectoSeleccionado.localidad}</div>
                        </Col>
                        <Col xs={12} md={6}>
                          <div className="mb-2"><FaUserCheck className="me-2" /> <b>Estado:</b> {prospectoSeleccionado.estado}</div>
                          <div className="mb-2"><FaComment className="me-2" /> <b>Comentario:</b> {prospectoSeleccionado.comentario || <span className="text-muted">Sin comentario</span>}</div>
                          <div className="mb-2"><FaUserCheck className="me-2" /> <b>Vendedor:</b> {prospectoSeleccionado.vendedor || "Sin asignar"}</div>
                          <div className="mb-2"><FaUserCheck className="me-2" /> <b>Asignación Estado:</b> {prospectoSeleccionado.asignacion_estado || "-"}</div>
                          <div className="mb-2"><FaComment className="me-2" /> <b>Asignación Comentario:</b> {prospectoSeleccionado.asignacion_comentario || "-"}</div>
                          <div className="mb-2"><FaCalendarAlt className="me-2" /> <b>Asignación Fecha:</b> {prospectoSeleccionado.asignacion_fecha ? new Date(prospectoSeleccionado.asignacion_fecha).toLocaleString() : "-"}</div>
                        </Col>
                      </Row>
                      <hr />
                      <div className="mb-2"><FaPeopleCarry className="me-2" /> <b>Familiares:</b></div>
                      {prospectoSeleccionado.familiares && prospectoSeleccionado.familiares.length > 0 ? (
                        <div className="ms-3">
                          {prospectoSeleccionado.familiares.map((f, idx) => (
                            <Card key={idx} className="mb-2 p-2 bg-light">
                              <div><FaUserFriends className="me-2" /> <b>{f.vinculo}:</b> {f.nombre} ({f.edad} años)</div>
                              <div className="ms-4">
                                {f.tipo_afiliacion_id && (
                                  <span className="me-2"><Badge bg="info">Afiliación: {f.tipo_afiliacion_id}</Badge></span>
                                )}
                                {f.sueldo_bruto && (
                                  <span className="me-2"><Badge bg="success">Sueldo: {f.sueldo_bruto}</Badge></span>
                                )}
                                {f.categoria_monotributo && (
                                  <span className="me-2"><Badge bg="secondary">Monotributo: {f.categoria_monotributo}</Badge></span>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="ms-3 text-muted">Sin familiares</div>
                      )}
                    </>
                  ) : null}
                </Modal.Body>
              </Modal>
            </>
          )}
          {vista === "resumen" && <SupervisorResumen />}
          {vista === "metricas" && <MetricasVendedor />}
          {vista === "cotizaciones" && <SupervisorCotizaciones />}
          {vista === "vendedores" && <VendedoresSupervisor />}
        </Container>
      </div>
      {/* Añadir el ChatWidget */}
      <ChatWidget />
    </div>
  );
};

export default SupervisorDashboard;