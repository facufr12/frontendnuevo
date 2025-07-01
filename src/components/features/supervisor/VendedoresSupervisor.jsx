import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Container, Row, Col, Table, Button, Form, Badge, 
  Card, Modal, Alert, ButtonGroup, Spinner, InputGroup 
} from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaSearch, FaList, FaThLarge, FaSort, FaSortUp, FaSortDown, FaUserPlus, FaChevronUp, FaChevronDown, FaUserCheck } from "react-icons/fa";
import { API_URL } from "../../config";

const ROLES = [
  { value: 1, label: "Vendedor", color: "primary" }
];

// Función para capitalizar la primera letra de cada palabra
const capitalizeName = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const VendedoresSupervisor = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verDetalle, setVerDetalle] = useState(false);
  const [vendedorDetalle, setVendedorDetalle] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });
  const [tipoVista, setTipoVista] = useState("tabla"); // "tabla" o "tarjetas"
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [ordenPor, setOrdenPor] = useState("apellido");
  const [ordenDir, setOrdenDir] = useState("asc");
  const [metricas, setMetricas] = useState({
    totalVendedores: 0,
    vendedoresActivos: 0,
    prospectosPorVendedor: []
  });
  const [vendedorMetricas, setVendedorMetricas] = useState(null);
  const [loadingMetricas, setLoadingMetricas] = useState(false);

  useEffect(() => {
    fetchVendedores();
    fetchMetricas();
  }, []);

  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/supervisor/vendedores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVendedores(response.data);
    } catch (error) {
      console.error("Error al obtener vendedores:", error);
      Swal.fire("Error", "No se pudieron cargar los usuarios vendedores.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/supervisor/metricas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMetricas({
        totalVendedores: response.data.prospectosPorVendedor.length,
        vendedoresActivos: response.data.prospectosPorVendedor.filter(v => v.total_prospectos > 0).length,
        prospectosPorVendedor: response.data.prospectosPorVendedor
      });
    } catch (error) {
      console.error("Error al obtener métricas:", error);
    }
  };

  const fetchVendedorMetricas = async (vendedorId) => {
    try {
      setLoadingMetricas(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/supervisor/vendedores/${vendedorId}/metricas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVendedorMetricas(response.data);
    } catch (error) {
      console.error("Error al obtener métricas del vendedor:", error);
      Swal.fire("Error", "No se pudieron cargar las métricas del vendedor.", "error");
    } finally {
      setLoadingMetricas(false);
    }
  };

  const handleEnable = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/supervisor/enable-vendedor/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAlert({ 
        show: true, 
        message: "Vendedor habilitado correctamente. Ya puede acceder al sistema.", 
        variant: "success" 
      });
      
      // Actualizar el vendedor en la lista local
      setVendedores(vendedores.map(v => 
        v.id === id ? {...v, is_enabled: 1} : v
      ));
      
      // Si el vendedor detalle está abierto y es el mismo que se habilitó
      if (vendedorDetalle && vendedorDetalle.id === id) {
        setVendedorDetalle({...vendedorDetalle, is_enabled: 1});
      }
      
    } catch (error) {
      console.error("Error al habilitar vendedor:", error);
      setAlert({ 
        show: true, 
        message: "No se pudo habilitar el vendedor. " + (error.response?.data?.message || error.message), 
        variant: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (vendedor) => {
    setVendedorDetalle(vendedor);
    fetchVendedorMetricas(vendedor.id);
    setVerDetalle(true);
  };

  const handleCloseAlert = () => setAlert({ ...alert, show: false });

  const handleOrdenar = (campo) => {
    if (campo === ordenPor) {
      setOrdenDir(ordenDir === "asc" ? "desc" : "asc");
    } else {
      setOrdenPor(campo);
      setOrdenDir("asc");
    }
  };

  // Icono para mostrar dirección de ordenamiento
  const getIconoOrden = (campo) => {
    if (ordenPor !== campo) return null;
    return ordenDir === "asc" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />;
  };

  // Filtrar y ordenar vendedores
  const vendedoresFiltrados = vendedores
    .filter(vendedor => {
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = 
        vendedor.first_name?.toLowerCase().includes(termino) ||
        vendedor.last_name?.toLowerCase().includes(termino) ||
        vendedor.email?.toLowerCase().includes(termino) ||
        (vendedor.phone_number && vendedor.phone_number.toLowerCase().includes(termino));
        
      const coincideEstado = filtroEstado === "" || 
        (filtroEstado === "habilitado" && vendedor.is_enabled) || 
        (filtroEstado === "deshabilitado" && !vendedor.is_enabled);
        
      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenPor) {
        case "nombre":
          valorA = a.first_name?.toLowerCase() || "";
          valorB = b.first_name?.toLowerCase() || "";
          break;
        case "apellido":
          valorA = a.last_name?.toLowerCase() || "";
          valorB = b.last_name?.toLowerCase() || "";
          break;
        case "email":
          valorA = a.email?.toLowerCase() || "";
          valorB = b.email?.toLowerCase() || "";
          break;
        case "estado":
          valorA = a.is_enabled ? 1 : 0;
          valorB = b.is_enabled ? 1 : 0;
          break;
        default:
          valorA = a.id;
          valorB = b.id;
      }
      
      if (valorA < valorB) return ordenDir === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenDir === "asc" ? 1 : -1;
      return 0;
    });

  // Renderizar ícono para el rol
  const getRoleBadge = (role) => {
    const roleInfo = ROLES.find(r => r.value === role);
    return (
      <Badge bg={roleInfo ? roleInfo.color : "secondary"}>
        {roleInfo ? roleInfo.label : "Desconocido"}
      </Badge>
    );
  };

  if (loading && vendedores.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="p-0">
      {alert.show && (
        <Alert variant={alert.variant} onClose={handleCloseAlert} dismissible>
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{metricas.totalVendedores}</h2>
              <p className="mb-0 text-muted">Total Vendedores</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{metricas.vendedoresActivos}</h2>
              <p className="mb-0 text-muted">Vendedores Activos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h2>{vendedores.filter(u => u.is_enabled).length}</h2>
              <p className="mb-0 text-muted">Vendedores Habilitados</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="bg-white rounded shadow-sm p-3 mb-4">
        <Row className="align-items-center mb-3">
          <Col md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder="Buscar vendedor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="me-2"
              />
              <Form.Select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="">Todos</option>
                <option value="habilitado">Habilitados</option>
                <option value="deshabilitado">Deshabilitados</option>
              </Form.Select>
            </div>
          </Col>
          <Col md={6} className="d-flex justify-content-md-end">
            <ButtonGroup className="me-2">
              <Button 
                variant={tipoVista === "tabla" ? "primary" : "outline-primary"} 
                onClick={() => setTipoVista("tabla")}
              >
                <FaList />
              </Button>
              <Button 
                variant={tipoVista === "tarjetas" ? "primary" : "outline-primary"} 
                onClick={() => setTipoVista("tarjetas")}
              >
                <FaThLarge />
              </Button>
            </ButtonGroup>
            <Button variant="primary" onClick={() => fetchVendedores()}>
              Actualizar
            </Button>
          </Col>
        </Row>

        {/* Vista de tabla */}
        {tipoVista === "tabla" ? (
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="cursor-pointer" onClick={() => handleOrdenar("id")}>
                  ID {getIconoOrden("id")}
                </th>
                <th className="cursor-pointer" onClick={() => handleOrdenar("nombre")}>
                  Nombre {getIconoOrden("nombre")}
                </th>
                <th className="cursor-pointer" onClick={() => handleOrdenar("apellido")}>
                  Apellido {getIconoOrden("apellido")}
                </th>
                <th className="cursor-pointer" onClick={() => handleOrdenar("email")}>
                  Email {getIconoOrden("email")}
                </th>
                <th>Teléfono</th>
                <th className="cursor-pointer" onClick={() => handleOrdenar("estado")}>
                  Estado {getIconoOrden("estado")}
                </th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No hay vendedores que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                vendedoresFiltrados.map((vendedor) => (
                  <tr key={vendedor.id}>
                    <td>{vendedor.id}</td>
                    <td>{capitalizeName(vendedor.first_name)}</td>
                    <td>{capitalizeName(vendedor.last_name)}</td>
                    <td>{vendedor.email}</td>
                    <td>{vendedor.phone_number || "-"}</td>
                    <td>
                      <Badge bg={vendedor.is_enabled ? "success" : "secondary"}>
                        {vendedor.is_enabled ? "Habilitado" : "Deshabilitado"}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <Button size="sm" variant="info" onClick={() => handleVerDetalle(vendedor)}>
                          <FaEye />
                        </Button>
                        
                        {/* Botón para habilitar vendedor (solo si está deshabilitado) */}
                        {!vendedor.is_enabled && (
                          <Button 
                            size="sm" 
                            variant="success" 
                            onClick={() => handleEnable(vendedor.id)}
                            disabled={loading}
                            title="Habilitar vendedor"
                          >
                            <FaUserCheck /> Habilitar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        ) : (
          /* Vista de tarjetas */
          <Row>
            {vendedoresFiltrados.length === 0 ? (
              <Col className="text-center py-5">
                <p className="text-muted">No hay vendedores que coincidan con los filtros aplicados.</p>
              </Col>
            ) : (
              vendedoresFiltrados.map((vendedor) => (
                <Col key={vendedor.id} lg={4} md={6} sm={12} className="mb-3">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">{capitalizeName(vendedor.first_name)} {capitalizeName(vendedor.last_name)}</span>
                      <Badge bg={vendedor.is_enabled ? "success" : "secondary"}>
                        {vendedor.is_enabled ? "Habilitado" : "Deshabilitado"}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2 text-muted">Email:</span> 
                          <div>{vendedor.email}</div>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2 text-muted">Teléfono:</span> 
                          <div>{vendedor.phone_number || "No disponible"}</div>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="me-2 text-muted">ID:</span> 
                          <div>{vendedor.id}</div>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between">
                        <Button size="sm" variant="info" onClick={() => handleVerDetalle(vendedor)}>
                          <FaEye className="me-1" /> Ver
                        </Button>
                        
                        {/* Botón para habilitar vendedor (solo si está deshabilitado) */}
                        {!vendedor.is_enabled && (
                          <Button 
                            size="sm" 
                            variant="success" 
                            onClick={() => handleEnable(vendedor.id)}
                            disabled={loading}
                          >
                            <FaUserCheck className="me-1" /> Habilitar
                          </Button>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </div>

      {/* Modal de Detalle de Usuario */}
      <Modal show={verDetalle} onHide={() => setVerDetalle(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle del Vendedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vendedorDetalle && (
            <div>
              <p><strong>ID:</strong> {vendedorDetalle.id}</p>
              <p><strong>Nombre completo:</strong> {capitalizeName(vendedorDetalle.first_name)} {capitalizeName(vendedorDetalle.last_name)}</p>
              <p><strong>Email:</strong> {vendedorDetalle.email}</p>
              <p><strong>Teléfono:</strong> {vendedorDetalle.phone_number || "No disponible"}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <Badge bg={vendedorDetalle.is_enabled ? "success" : "secondary"}>
                  {vendedorDetalle.is_enabled ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </p>
              {vendedorDetalle.created_at && (
                <p><strong>Fecha de creación:</strong> {new Date(vendedorDetalle.created_at).toLocaleString()}</p>
              )}
              {vendedorDetalle.updated_at && (
                <p><strong>Última actualización:</strong> {new Date(vendedorDetalle.updated_at).toLocaleString()}</p>
              )}
              <p><strong>Prospectos asignados:</strong> {vendedorDetalle.total_prospectos || 0}</p>
              <p><strong>Conversiones:</strong> {vendedorDetalle.conversiones || 0}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVerDetalle(false)}>
            Cerrar
          </Button>
          
          {/* Botón para habilitar vendedor desde el modal (solo si está deshabilitado) */}
          {vendedorDetalle && !vendedorDetalle.is_enabled && (
            <Button 
              variant="success" 
              onClick={() => {
                handleEnable(vendedorDetalle.id);
                setVerDetalle(false);
              }}
              disabled={loading}
            >
              <FaUserCheck className="me-1" /> Habilitar Vendedor
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VendedoresSupervisor;