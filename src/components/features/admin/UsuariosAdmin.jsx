import { useEffect, useState } from "react";
import axios from "axios";
import { ENDPOINTS } from "../../config";
import {
  Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge, Table, InputGroup,
  DropdownButton, Dropdown
} from "react-bootstrap";
import { 
  FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaFilter, FaList, FaThLarge,
  FaEnvelope, FaPhone, FaUserTag, FaIdCard, FaSort, FaSortUp, FaSortDown, FaEye
} from "react-icons/fa";
import useScreenSize from "../../../hooks/useScreenSize";
import '../vendedor/mobile-styles.css';
import './admin-mobile-styles.css';

const ROLES = [
  { value: 1, label: "Vendedor", color: "primary" },
  { value: 2, label: "Supervisor", color: "success" },
  { value: 3, label: "Administrador", color: "danger" }
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

const UsuariosAdmin = () => {
  const { isMobile } = useScreenSize();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: 1,
  });
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });
  const [tipoVista, setTipoVista] = useState("tabla"); // "tabla" o "tarjetas"
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [ordenPor, setOrdenPor] = useState("id");
  const [ordenDir, setOrdenDir] = useState("asc");
  const [verDetalle, setVerDetalle] = useState(false);
  const [userDetalle, setUserDetalle] = useState(null);

  // En móvil, forzar vista de tarjetas para mejor experiencia
  useEffect(() => {
    if (isMobile && tipoVista === "tabla") {
      setTipoVista("tarjetas");
    }
  }, [isMobile, tipoVista]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${ENDPOINTS.ADMIN}/list-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setAlert({ 
        show: true, 
        message: "No se pudieron cargar los usuarios. " + (error.response?.data?.message || error.message), 
        variant: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      if (selectedUser) {
        await axios.put(`${ENDPOINTS.ADMIN}/update-user/${selectedUser.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ show: true, message: "Usuario actualizado correctamente.", variant: "success" });
      } else {
        await axios.post(`${ENDPOINTS.ADMIN}/create-user`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ show: true, message: "Usuario creado correctamente.", variant: "success" });
      }
      fetchUsers();
      setFormData({ first_name: "", last_name: "", email: "", phone_number: "", role: 1 });
      setSelectedUser(null);
      setFormOpen(false);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setAlert({ 
        show: true, 
        message: "No se pudo guardar el usuario. " + (error.response?.data?.message || error.message), 
        variant: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    
    // Usar SweetAlert2 o confirmar estándar
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (!confirmar) return;
    
    try {
      setLoading(true);
      await axios.delete(`${ENDPOINTS.ADMIN}/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ show: true, message: "El usuario ha sido eliminado.", variant: "success" });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setAlert({ 
        show: true, 
        message: "No se pudo eliminar el usuario. " + (error.response?.data?.message || error.message), 
        variant: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (id) => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      await axios.put(`${ENDPOINTS.ADMIN}/enable-user/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ show: true, message: "Usuario habilitado correctamente.", variant: "success" });
      fetchUsers();
    } catch (error) {
      console.error("Error al habilitar usuario:", error);
      setAlert({ 
        show: true, 
        message: "No se pudo habilitar el usuario. " + (error.response?.data?.message || error.message), 
        variant: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
    });
    setFormOpen(true);
  };

  const handleVerDetalle = (user) => {
    setUserDetalle(user);
    setVerDetalle(true);
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormData({ first_name: "", last_name: "", email: "", phone_number: "", role: 1 });
    setFormOpen(true);
  };

  const handleCloseAlert = () => setAlert({ ...alert, show: false });

  const handleOrdenar = (campo) => {
    if (ordenPor === campo) {
      // Cambiar dirección si ya estamos ordenando por este campo
      setOrdenDir(ordenDir === "asc" ? "desc" : "asc");
    } else {
      // Establecer nuevo campo y dirección por defecto
      setOrdenPor(campo);
      setOrdenDir("asc");
    }
  };

  // Filtrar y ordenar usuarios
  const usuariosFiltrados = users
    .filter(user => {
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = 
        user.first_name.toLowerCase().includes(termino) ||
        user.last_name.toLowerCase().includes(termino) ||
        user.email.toLowerCase().includes(termino) ||
        (user.phone_number && user.phone_number.toLowerCase().includes(termino));
        
      const coincideRol = filtroRol === "" || user.role === parseInt(filtroRol);
      const coincideEstado = filtroEstado === "" || 
        (filtroEstado === "habilitado" && user.is_enabled) || 
        (filtroEstado === "deshabilitado" && !user.is_enabled);
        
      return coincideBusqueda && coincideRol && coincideEstado;
    })
    .sort((a, b) => {
      let valorA, valorB;
      
      // Determinar los valores a comparar según el campo
      switch (ordenPor) {
        case "nombre":
          valorA = a.first_name.toLowerCase();
          valorB = b.first_name.toLowerCase();
          break;
        case "apellido":
          valorA = a.last_name.toLowerCase();
          valorB = b.last_name.toLowerCase();
          break;
        case "email":
          valorA = a.email.toLowerCase();
          valorB = b.email.toLowerCase();
          break;
        case "rol":
          valorA = a.role;
          valorB = b.role;
          break;
        case "estado":
          valorA = a.is_enabled ? 1 : 0;
          valorB = b.is_enabled ? 1 : 0;
          break;
        default: // id
          valorA = a.id;
          valorB = b.id;
      }
      
      // Comparar según la dirección
      if (ordenDir === "asc") {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

  // Obtener el ícono de ordenación para la columna actual
  const getIconoOrden = (campo) => {
    if (ordenPor !== campo) return <FaSort className="ms-1 text-muted" size={12} />;
    return ordenDir === "asc" ? <FaSortUp className="ms-1 text-primary" size={12} /> : <FaSortDown className="ms-1 text-primary" size={12} />;
  };

  // Renderizar ícono para el rol
  const getRoleBadge = (role) => {
    const rolInfo = ROLES.find(r => r.value === role) || { label: "Desconocido", color: "secondary" };
    return <Badge bg={rolInfo.color}>{rolInfo.label}</Badge>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className={`admin-content ${isMobile ? 'mobile-view' : ''}`}>
      {/* Barra de filtros y acciones */}
      <Card className={`admin-content shadow-sm mb-4 ${isMobile ? 'rounded-mobile' : ''}`}>
        <Card.Body className={isMobile ? 'p-mobile' : ''}>
          {/* Primera fila: Búsqueda y botón nuevo (móvil first) */}
          <Row className={`mb-3 ${isMobile ? 'usuarios-header-mobile' : ''}`}>
            <Col xs={12} md={8} className={`mb-2 mb-md-0 ${isMobile ? 'search-bar-mobile' : ''}`}>
              <InputGroup className={isMobile ? 'shadow-mobile' : ''}>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder={isMobile ? "Buscar usuarios..." : "Buscar por nombre, email o teléfono"}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={isMobile ? 'form-control-touch' : ''}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4} className="d-flex justify-content-md-end">
              <Button 
                variant="primary" 
                className={`w-100 w-md-auto btn-touch ${isMobile ? 'shadow-mobile' : 'rounded-3'}`}
                onClick={handleOpenCreate}
              >
                <FaUserPlus className="me-2" /> 
                {isMobile ? "Nuevo Usuario" : "Nuevo Usuario"}
              </Button>
            </Col>
          </Row>
          
          {/* Segunda fila: Filtros */}
          <Row className={`mb-3 ${isMobile ? 'filtros-mobile' : ''}`}>
            <Col xs={6} md={3} className="mb-2 mb-md-0">
              <Form.Select 
                value={filtroRol} 
                onChange={(e) => setFiltroRol(e.target.value)}
                className={isMobile ? 'form-control-touch' : ''}
              >
                <option value="">Todos los roles</option>
                {ROLES.map(rol => (
                  <option key={rol.value} value={rol.value}>{rol.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={3} className="mb-2 mb-md-0">
              <Form.Select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={isMobile ? 'form-control-touch' : ''}
              >
                <option value="">Todos los estados</option>
                <option value="habilitado">Activos</option>
                <option value="deshabilitado">Inactivos</option>
              </Form.Select>
            </Col>
            {/* Solo mostrar el toggle de vista en desktop */}
            {!isMobile && (
              <Col xs={12} md={6} className="d-flex justify-content-md-end">
                <div className="d-flex gap-2 w-100 w-md-auto">
                  <Button 
                    variant={tipoVista === "tabla" ? "primary" : "outline-primary"} 
                    size="sm"
                    className="flex-fill flex-md-grow-0"
                    onClick={() => setTipoVista("tabla")}
                    title="Vista de tabla"
                  >
                    <FaList />
                  </Button>
                  <Button 
                    variant={tipoVista === "tarjetas" ? "primary" : "outline-primary"} 
                    size="sm"
                    className="flex-fill flex-md-grow-0"
                    onClick={() => setTipoVista("tarjetas")}
                    title="Vista de tarjetas"
                  >
                    <FaThLarge />
                  </Button>
                </div>
              </Col>
            )}
          </Row>
          
          {/* Estadísticas rápidas en móvil */}
          {isMobile && usuariosFiltrados.length > 0 && (
            <div className="stats-mobile mb-3">
              <div className="stat-card-mobile">
                <div className="stat-number">{usuariosFiltrados.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card-mobile">
                <div className="stat-number">
                  {usuariosFiltrados.filter(u => u.is_enabled).length}
                </div>
                <div className="stat-label">Activos</div>
              </div>
            </div>
          )}
          
          {alert.show && (
            <Alert 
              variant={alert.variant} 
              onClose={handleCloseAlert} 
              dismissible 
              className={`mb-0 ${isMobile ? 'font-small-mobile' : ''}`}
            >
              {alert.message}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Vista de tabla - Solo en desktop */}
      {tipoVista === "tabla" && !isMobile && (
        <Card className="admin-content shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-primary">
                <tr>
                  <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("id")}>
                    ID {getIconoOrden("id")}
                  </th>
                  <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("nombre")}>
                    Nombre {getIconoOrden("nombre")}
                  </th>
                  <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("apellido")}>
                    Apellido {getIconoOrden("apellido")}
                  </th>
                  <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("email")}>
                    Email {getIconoOrden("email")}
                  </th>
                  <th className="fw-bold">Teléfono</th>
                  <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("rol")}>
                    Rol {getIconoOrden("rol")}
                  </th>
                  <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("estado")}>
                    Estado {getIconoOrden("estado")}
                  </th>
                  <th className="text-center fw-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No hay usuarios que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{capitalizeName(user.first_name)}</td>
                      <td>{capitalizeName(user.last_name)}</td>
                      <td>{user.email}</td>
                      <td>{user.phone_number || "-"}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        <Badge bg={user.is_enabled ? "success" : "secondary"}>
                          {user.is_enabled ? "Habilitado" : "Deshabilitado"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <Button size="sm" variant="primary" className="rounded-3" onClick={() => handleVerDetalle(user)}>
                            <FaEye />
                          </Button>
                          <Button size="sm" variant="warning" className="rounded-3" onClick={() => handleEdit(user)}>
                            <FaEdit />
                          </Button>
                          <Button size="sm" variant="danger" className="rounded-3" onClick={() => handleDelete(user.id)}>
                            <FaTrash />
                          </Button>
                          {!user.is_enabled && (
                            <Button size="sm" variant="success" className="rounded-3" onClick={() => handleEnable(user.id)}>
                              <FaCheck />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Vista de tarjetas - Mobile first y desktop */}
      {(tipoVista === "tarjetas" || isMobile) && (
        <Row>
          {usuariosFiltrados.length === 0 ? (
            <Col className="text-center py-5">
              <p className="text-muted">No hay usuarios que coincidan con los filtros aplicados.</p>
            </Col>
          ) : (
            usuariosFiltrados.map((user) => (
              <Col key={user.id} lg={4} md={6} sm={12} className={`mb-3 ${isMobile ? 'mb-2' : ''}`}>
                <Card className={`h-100 shadow-sm user-card-mobile fade-in-mobile`}>
                  <Card.Header className="mobile-card-header d-flex justify-content-between align-items-center">
                    <div className="user-name text-truncate-mobile">
                      {capitalizeName(user.first_name)} {capitalizeName(user.last_name)}
                    </div>
                    <Badge 
                      bg={user.is_enabled ? "success" : "secondary"} 
                      className="ms-2"
                    >
                      {user.is_enabled ? "Activo" : "Inactivo"}
                    </Badge>
                  </Card.Header>
                  
                  <Card.Body className="p-mobile">
                    <div className="user-info mb-mobile">
                      <div className="info-item mb-2">
                        <FaEnvelope className="text-primary" />
                        <span className="text-truncate-mobile">{user.email}</span>
                      </div>
                      
                      <div className="info-item mb-2">
                        <FaPhone className="text-success" />
                        <span>{user.phone_number || "Sin teléfono"}</span>
                      </div>
                      
                      <div className="info-item mb-2">
                        <FaUserTag className="text-info" />
                        <span>{getRoleBadge(user.role)}</span>
                      </div>
                      
                      <div className="info-item">
                        <FaIdCard className="text-muted" />
                        <span>ID: {user.id}</span>
                      </div>
                    </div>
                  </Card.Body>
                  
                  <Card.Footer className="bg-light">
                    <div className="actions-mobile">
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="btn-mobile btn-touch"
                        onClick={() => handleVerDetalle(user)}
                      >
                        <FaEye className="me-1" />
                        {isMobile ? "Ver" : "Detalles"}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="warning" 
                        className="btn-mobile btn-touch"
                        onClick={() => handleEdit(user)}
                      >
                        <FaEdit className={`${isMobile ? 'me-1' : ''}`} />
                        {isMobile ? "Editar" : ""}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="danger" 
                        className="btn-mobile btn-touch"
                        onClick={() => handleDelete(user.id)}
                      >
                        <FaTrash className={`${isMobile ? 'me-1' : ''}`} />
                        {isMobile ? "Eliminar" : ""}
                      </Button>
                      
                      {!user.is_enabled && (
                        <Button 
                          size="sm" 
                          variant="success" 
                          className="btn-mobile btn-touch"
                          onClick={() => handleEnable(user.id)}
                        >
                          <FaCheck className={`${isMobile ? 'me-1' : ''}`} />
                          {isMobile ? "Activar" : ""}
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

      {/* Modal para crear/editar usuario */}
      <Modal 
        show={formOpen} 
        onHide={() => setFormOpen(false)}
        size={isMobile ? "xl" : "lg"}
        fullscreen={isMobile ? "sm-down" : false}
        className={isMobile ? 'mobile-modal' : ''}
      >
        <Modal.Header closeButton className={isMobile ? 'mobile-modal-header' : ''}>
          <Modal.Title className={isMobile ? 'mobile-modal-title' : ''}>
            {selectedUser ? "Editar Usuario" : "Crear Usuario"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className={isMobile ? 'mobile-modal-body' : ''}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Nombre</Form.Label>
                  <Form.Control
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className={isMobile ? 'mobile-form-control' : ''}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Apellido</Form.Label>
                  <Form.Control
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className={isMobile ? 'mobile-form-control' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Correo Electrónico</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={isMobile ? 'mobile-form-control' : ''}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Teléfono</Form.Label>
              <Form.Control
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={isMobile ? 'mobile-form-control' : ''}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className={isMobile ? 'mobile-form-control' : ''}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className={isMobile ? 'mobile-modal-footer' : ''}>
            <Button 
              variant="secondary" 
              className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-secondary flex-fill me-2' : ''}`} 
              onClick={() => setFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-primary flex-fill' : ''}`}
            >
              {selectedUser ? "Actualizar" : "Crear"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal para ver detalles */}
      <Modal 
        show={verDetalle} 
        onHide={() => setVerDetalle(false)}
        size={isMobile ? "xl" : "lg"}
        fullscreen={isMobile ? "sm-down" : false}
        className={isMobile ? 'mobile-modal' : ''}
      >
        <Modal.Header closeButton className={isMobile ? 'mobile-modal-header' : ''}>
          <Modal.Title className={isMobile ? 'mobile-modal-title' : ''}>Detalles del Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className={isMobile ? 'mobile-modal-body' : ''}>
          {userDetalle && (
            <div className={isMobile ? 'mobile-detail-content' : ''}>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>ID:</strong> {userDetalle.id}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Nombre completo:</strong> {capitalizeName(userDetalle.first_name)} {capitalizeName(userDetalle.last_name)}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Email:</strong> {userDetalle.email}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Teléfono:</strong> {userDetalle.phone_number || "No disponible"}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Rol:</strong> {ROLES.find(r => r.value === userDetalle.role)?.label || "Desconocido"}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Estado:</strong> {userDetalle.is_enabled ? "Habilitado" : "Deshabilitado"}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Fecha de creación:</strong> {new Date(userDetalle.created_at).toLocaleString()}
              </div>
              {userDetalle.updated_at && (
                <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                  <strong>Última actualización:</strong> {new Date(userDetalle.updated_at).toLocaleString()}
                </div>
              )}
              {userDetalle.email_verified_at && (
                <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                  <strong>Email verificado:</strong> {new Date(userDetalle.email_verified_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={isMobile ? 'mobile-modal-footer' : ''}>
          <Button 
            variant="secondary" 
            className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-secondary flex-fill me-2' : ''}`} 
            onClick={() => setVerDetalle(false)}
          >
            Cerrar
          </Button>
          {userDetalle && (
            <Button 
              variant="warning" 
              className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-warning flex-fill' : ''}`} 
              onClick={() => {
                setVerDetalle(false);
                handleEdit(userDetalle);
              }}
            >
              Editar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsuariosAdmin;