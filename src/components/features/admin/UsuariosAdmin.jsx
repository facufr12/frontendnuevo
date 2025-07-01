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
    <div className="admin-content">
      {/* Barra de filtros y acciones */}
      <Card className="admin-content shadow-sm mb-4">
        <Card.Body>
          {/* Primera fila: Búsqueda y botón nuevo (móvil first) */}
          <Row className="mb-3">
            <Col xs={12} md={8} className="mb-2 mb-md-0">
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, email o teléfono"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={4} className="d-flex justify-content-md-end">
              <Button variant="primary" className="rounded-3 w-100 w-md-auto" onClick={handleOpenCreate}>
                <FaUserPlus className="me-1" /> Nuevo Usuario
              </Button>
            </Col>
          </Row>
          
          {/* Segunda fila: Filtros */}
          <Row className="mb-3">
            <Col xs={6} md={3} className="mb-2 mb-md-0">
              <Form.Select 
                value={filtroRol} 
                onChange={(e) => setFiltroRol(e.target.value)}
                size="sm"
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
                size="sm"
              >
                <option value="">Todos los estados</option>
                <option value="habilitado">Habilitados</option>
                <option value="deshabilitado">Deshabilitados</option>
              </Form.Select>
            </Col>
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
          </Row>
          
          {alert.show && (
            <Alert variant={alert.variant} onClose={handleCloseAlert} dismissible>
              {alert.message}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Vista de tabla */}
      {tipoVista === "tabla" && (
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

      {/* Vista de tarjetas */}
      {tipoVista === "tarjetas" && (
        <Row>
          {usuariosFiltrados.length === 0 ? (
            <Col className="text-center py-5">
              <p className="text-muted">No hay usuarios que coincidan con los filtros aplicados.</p>
            </Col>
          ) : (
            usuariosFiltrados.map((user) => (
              <Col key={user.id} lg={4} md={6} sm={12} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">{capitalizeName(user.first_name)} {capitalizeName(user.last_name)}</span>
                    <Badge bg={user.is_enabled ? "success" : "secondary"}>
                      {user.is_enabled ? "Habilitado" : "Deshabilitado"}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaEnvelope className="me-2 text-muted" /> 
                        <div>{user.email}</div>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaPhone className="me-2 text-muted" /> 
                        <div>{user.phone_number || "No disponible"}</div>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaUserTag className="me-2 text-muted" /> 
                        <div>{getRoleBadge(user.role)}</div>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaIdCard className="me-2 text-muted" /> 
                        <div>ID: {user.id}</div>
                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-flex justify-content-between">
                      <Button size="sm" variant="primary" className="rounded-3" onClick={() => handleVerDetalle(user)}>
                        <FaEye className="me-1" /> Ver
                      </Button>
                      <div className="d-flex gap-1">
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
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Modal para crear/editar usuario */}
      <Modal show={formOpen} onHide={() => setFormOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser ? "Editar Usuario" : "Crear Usuario"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="rounded-3" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="rounded-3">
              {selectedUser ? "Actualizar" : "Crear"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal para ver detalles */}
      <Modal show={verDetalle} onHide={() => setVerDetalle(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userDetalle && (
            <div>
              <p><strong>ID:</strong> {userDetalle.id}</p>
              <p><strong>Nombre completo:</strong> {capitalizeName(userDetalle.first_name)} {capitalizeName(userDetalle.last_name)}</p>
              <p><strong>Email:</strong> {userDetalle.email}</p>
              <p><strong>Teléfono:</strong> {userDetalle.phone_number || "No disponible"}</p>
              <p><strong>Rol:</strong> {ROLES.find(r => r.value === userDetalle.role)?.label || "Desconocido"}</p>
              <p><strong>Estado:</strong> {userDetalle.is_enabled ? "Habilitado" : "Deshabilitado"}</p>
              <p><strong>Fecha de creación:</strong> {new Date(userDetalle.created_at).toLocaleString()}</p>
              {userDetalle.updated_at && (
                <p><strong>Última actualización:</strong> {new Date(userDetalle.updated_at).toLocaleString()}</p>
              )}
              {userDetalle.email_verified_at && (
                <p><strong>Email verificado:</strong> {new Date(userDetalle.email_verified_at).toLocaleString()}</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="rounded-3" onClick={() => setVerDetalle(false)}>
            Cerrar
          </Button>
          {userDetalle && (
            <Button variant="warning" className="rounded-3" onClick={() => {
              setVerDetalle(false);
              handleEdit(userDetalle);
            }}>
              Editar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsuariosAdmin;