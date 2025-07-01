import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Row, Col, Button, Table, Modal, Form, InputGroup, Badge,
  Card, Spinner, Alert, Nav, OverlayTrigger, Tooltip
} from "react-bootstrap";
import { 
  FaEdit, FaTrash, FaPlus, FaPercentage, FaEye, FaFileExport, 
  FaFileImport, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown,
  FaCheck, FaTimes, FaInfoCircle
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "https://wspflows.cober.online/api";

// Función para capitalizar la primera letra de cada palabra
const capitalizeName = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ListaPreciosAdmin = () => {
  const [precios, setPrecios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAumento, setShowAumento] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [precioEdit, setPrecioEdit] = useState({});
  const [nuevoPrecio, setNuevoPrecio] = useState({});
  const [porcentaje, setPorcentaje] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [detalle, setDetalle] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [tabActiva, setTabActiva] = useState("lista");
  const [ordenPor, setOrdenPor] = useState("id");
  const [ordenDir, setOrdenDir] = useState("asc");
  const [showImportar, setShowImportar] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [showExito, setShowExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  
  // Filtros
  const [filtroPlan, setFiltroPlan] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTipoFamilia, setFiltroTipoFamilia] = useState("");
  const [planesDisponibles, setPlanesDisponibles] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [tiposFamiliaDisponibles, setTiposFamiliaDisponibles] = useState([]);

  // Al cargar el componente, trae los valores únicos de los precios existentes
  useEffect(() => {
    const fetchData = async () => {
      await fetchPrecios();
      await fetchPlanes();
      await fetchCategorias();
      await fetchTiposFamilia();
    };
    fetchData();
  }, [anio]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPrecios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/admin/lista-precios?anio=${anio}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrecios(data);
      setError(null);
    } catch (error) {
      console.error("Error al cargar precios:", error);
      setError("No se pudieron cargar los precios. " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanes = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/cotizaciones/planes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanesDisponibles(data);
    } catch (error) {
      console.error("Error al cargar planes:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/cotizaciones/categorias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoriasDisponibles(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const fetchTiposFamilia = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/cotizaciones/tipos-familia`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiposFamiliaDisponibles(data);
    } catch (error) {
      console.error("Error al cargar tipos de familia:", error);
    }
  };

  // Obtener valores únicos para los filtros
  const planes = [...new Set(precios.map(p => p.plan))];
  const categorias = [...new Set(precios.map(p => p.categoria_edad))];
  const tiposFamilia = [...new Set(precios.map(p => p.tipo_familia))];

  // Filtrar precios según los filtros y búsqueda
  const preciosFiltrados = precios
    .filter(row => {
      const terminoBusqueda = busqueda.toLowerCase();
      return (
        (!filtroPlan || row.plan === filtroPlan) &&
        (!filtroCategoria || row.categoria_edad === filtroCategoria) &&
        (!filtroTipoFamilia || row.tipo_familia === filtroTipoFamilia) &&
        (!busqueda || 
          row.plan.toLowerCase().includes(terminoBusqueda) ||
          row.categoria_edad.toLowerCase().includes(terminoBusqueda) ||
          row.tipo_familia.toLowerCase().includes(terminoBusqueda) ||
          String(row.precio).includes(terminoBusqueda)
        )
      );
    })
    .sort((a, b) => {
      let valorA, valorB;
      
      // Determinar los valores a comparar según el campo
      switch (ordenPor) {
        case "plan":
          valorA = a.plan.toLowerCase();
          valorB = b.plan.toLowerCase();
          break;
        case "categoria":
          valorA = a.categoria_edad.toLowerCase();
          valorB = b.categoria_edad.toLowerCase();
          break;
        case "tipo":
          valorA = a.tipo_familia.toLowerCase();
          valorB = b.tipo_familia.toLowerCase();
          break;
        case "precio":
          valorA = parseFloat(a.precio);
          valorB = parseFloat(b.precio);
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

  const handleEdit = (precio) => {
    setPrecioEdit(precio);
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/admin/lista-precios/${precioEdit.id}`, { precio: precioEdit.precio }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEdit(false);
      setMensajeExito("Precio actualizado correctamente");
      setShowExito(true);
      fetchPrecios();
    } catch (error) {
      console.error("Error al actualizar precio:", error);
      setError("Error al actualizar precio: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Pedir confirmación antes de eliminar
    if (!window.confirm("¿Estás seguro de que deseas eliminar este precio?")) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/lista-precios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensajeExito("Precio eliminado correctamente");
      setShowExito(true);
      fetchPrecios();
    } catch (error) {
      console.error("Error al eliminar precio:", error);
      setError("Error al eliminar precio: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Asigna valores predeterminados si algún campo está vacío
      const precioFinal = {
        plan_id: nuevoPrecio.plan_id || "",
        categoria_id: nuevoPrecio.categoria_id || "",
        tipo_familia_id: nuevoPrecio.tipo_familia_id || "",
        precio: nuevoPrecio.precio || 0,
        anio: nuevoPrecio.anio || anio
      };

      // Verifica que todos los campos requeridos estén presentes
      if (!precioFinal.plan_id || !precioFinal.categoria_id || !precioFinal.tipo_familia_id || !precioFinal.precio || !precioFinal.anio) {
        setError("Por favor, completa todos los campos.");
        return;
      }

      await axios.post(`${API_URL}/admin/lista-precios`, precioFinal, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAdd(false);
      setNuevoPrecio({});
      setMensajeExito("Precio agregado correctamente");
      setShowExito(true);
      fetchPrecios();
    } catch (error) {
      console.error("Error al agregar precio:", error);
      setError("Error al agregar precio: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAumento = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/admin/lista-precios/aumentar/todos`, { porcentaje, anio }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAumento(false);
      setPorcentaje("");
      setMensajeExito(`Precios aumentados correctamente en ${porcentaje}%`);
      setShowExito(true);
      fetchPrecios();
    } catch (error) {
      console.error("Error al aplicar aumento:", error);
      setError("Error al aplicar aumento: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDetalle = (row) => {
    setDetalle(row);
    setShowDetalle(true);
  };

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

  // Obtener el ícono de ordenación para la columna actual
  const getIconoOrden = (campo) => {
    if (ordenPor !== campo) return <FaSort className="ms-1 text-muted" size={12} />;
    return ordenDir === "asc" ? <FaSortUp className="ms-1 text-primary" size={12} /> : <FaSortDown className="ms-1 text-primary" size={12} />;
  };

  const handleImportarCSV = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setError("Por favor, selecciona un archivo CSV");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('csv_file', archivo);
      
      await axios.post(`${API_URL}/admin/lista-precios/importar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowImportar(false);
      setArchivo(null);
      setMensajeExito("Archivo importado correctamente");
      setShowExito(true);
      fetchPrecios();
    } catch (error) {
      console.error("Error al importar archivo:", error);
      setError("Error al importar archivo: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportarCSV = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/lista-precios/exportar?anio=${anio}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Crear URL del archivo descargado
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lista_precios_${anio}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMensajeExito("Archivo exportado correctamente");
      setShowExito(true);
    } catch (error) {
      console.error("Error al exportar archivo:", error);
      setError("Error al exportar archivo: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && precios.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando lista de precios...</p>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Tabs de navegación */}
      <Card className="admin-content shadow-sm mb-4">
        <Card.Header className="">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link 
                active={tabActiva === "lista"} 
                onClick={() => setTabActiva("lista")}
              >
                Lista de Precios
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={tabActiva === "importar"} 
                onClick={() => setTabActiva("importar")}
              >
                Importar/Exportar
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {showExito && (
            <Alert variant="success" dismissible onClose={() => setShowExito(false)}>
              {mensajeExito}
            </Alert>
          )}
          
          {tabActiva === "lista" && (
            <>
              {/* Encabezado y controles */}
              <Row className="mb-3 align-items-center">
                <Col md={6} className="mb-2 mb-md-0">
                  <div className="d-flex gap-2">
                    <Button variant="primary" className="rounded-3" onClick={() => setShowAdd(true)}>
                      <FaPlus className="me-1" /> Agregar
                    </Button>
                    <Button variant="outline-primary" className="rounded-3" onClick={() => setShowAumento(true)}>
                      <FaPercentage className="me-1" /> Aumentar
                    </Button>
                  </div>
                </Col>
                <Col md={4} className="mb-2 mb-md-0">
                  <InputGroup>
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <Form.Control
                      placeholder="Buscar..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <InputGroup>
                    <InputGroup.Text>Año</InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={anio}
                      onChange={e => setAnio(e.target.value)}
                      min="2000"
                      max="2100"
                    />
                  </InputGroup>
                </Col>
              </Row>

              {/* Filtros */}
              <Row className="mb-3">
                <Col md={4} className="mb-2 mb-md-0">
                  <Form.Select value={filtroPlan} onChange={e => setFiltroPlan(e.target.value)}>
                    <option value="">Todos los planes</option>
                    {planes.map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4} className="mb-2 mb-md-0">
                  <Form.Select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <div className="d-flex">
                    <Form.Select 
                      value={filtroTipoFamilia} 
                      onChange={e => setFiltroTipoFamilia(e.target.value)}
                      className="me-2"
                    >
                      <option value="">Todos los tipos</option>
                      {tiposFamilia.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </Form.Select>
                    <Button 
                      variant="outline-secondary" 
                      className="rounded-3"
                      onClick={() => {
                        setFiltroPlan("");
                        setFiltroCategoria("");
                        setFiltroTipoFamilia("");
                        setBusqueda("");
                      }}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Tabla de precios */}
              <div className="table-responsive">
                <Table striped bordered hover className="mb-0" style={{ minWidth: "750px" }}>
                  <thead className="table-primary">
                    <tr>
                      <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("id")} style={{ minWidth: "60px" }}>
                        ID {getIconoOrden("id")}
                      </th>
                      <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("plan")} style={{ minWidth: "120px" }}>
                        Plan {getIconoOrden("plan")}
                      </th>
                      <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("categoria")} style={{ minWidth: "140px" }}>
                        Categoría Edad {getIconoOrden("categoria")}
                      </th>
                      <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("tipo")} style={{ minWidth: "140px" }}>
                        Tipo Familia {getIconoOrden("tipo")}
                      </th>
                      <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("precio")} style={{ minWidth: "120px" }}>
                        Precio {getIconoOrden("precio")}
                      </th>
                      <th className="fw-bold" style={{ minWidth: "150px", width: "150px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preciosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No hay precios que coincidan con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      preciosFiltrados.map((row) => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td><Badge bg="info">{capitalizeName(row.plan)}</Badge></td>
                          <td>{capitalizeName(row.categoria_edad)}</td>
                          <td>{capitalizeName(row.tipo_familia)}</td>
                          <td className="text-end">${parseFloat(row.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                          <td>
                            <div className="d-flex gap-1 justify-content-center">
                              <OverlayTrigger placement="top" overlay={<Tooltip>Editar precio</Tooltip>}>
                                <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => handleEdit(row)}>
                                  <FaEdit />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar precio</Tooltip>}>
                                <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => handleDelete(row.id)}>
                                  <FaTrash />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger placement="top" overlay={<Tooltip>Ver detalles</Tooltip>}>
                                <Button variant="outline-info" size="sm" className="rounded-3" onClick={() => handleDetalle(row)}>
                                  <FaEye />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              
              {/* Paginación (si es necesaria) */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <small className="text-muted">Mostrando {preciosFiltrados.length} de {precios.length} precios</small>
                </div>
              </div>
            </>
          )}
          
          {tabActiva === "importar" && (
            <div className="py-3">
              <Row>
                <Col md={6} className="mb-4">
                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Importar precios desde CSV</h5>
                    </Card.Header>
                    <Card.Body>
                      <p>Sube un archivo CSV con los precios que deseas importar.</p>
                      <p>El archivo debe tener las siguientes columnas:</p>
                      <ul>
                        <li>plan_id (ID del plan)</li>
                        <li>categoria_id (ID de la categoría)</li>
                        <li>tipo_familia_id (ID del tipo de familia)</li>
                        <li>precio (monto)</li>
                        <li>anio (año)</li>
                      </ul>
                      <div className="d-flex justify-content-center mt-3">
                        <Button variant="primary" onClick={() => setShowImportar(true)}>
                          <FaFileImport className="me-2" /> Importar CSV
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Exportar precios a CSV</h5>
                    </Card.Header>
                    <Card.Body>
                      <p>Descarga todos los precios del año seleccionado en formato CSV.</p>
                      <p>El archivo incluirá toda la información necesaria para reimportar los precios si es necesario.</p>
                      <div className="d-flex justify-content-center mt-3">
                        <Button variant="success" onClick={handleExportarCSV}>
                          <FaFileExport className="me-2" /> Exportar CSV
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Detalle */}
      <Modal show={showDetalle} onHide={() => setShowDetalle(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle del Precio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <Table bordered hover size="sm">
              <tbody>
                <tr>
                  <th style={{ width: "40%" }}>Plan:</th>
                  <td><Badge bg="info">{detalle.plan}</Badge></td>
                </tr>
                <tr>
                  <th>Categoría Edad:</th>
                  <td>{detalle.categoria_edad}</td>
                </tr>
                <tr>
                  <th>Tipo Familia:</th>
                  <td>{detalle.tipo_familia}</td>
                </tr>
                <tr>
                  <th>Precio:</th>
                  <td className="fw-bold">${parseFloat(detalle.precio || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <th>Año:</th>
                  <td>{detalle.anio}</td>
                </tr>
                <tr>
                  <th>ID:</th>
                  <td>{detalle.id}</td>
                </tr>
                <tr>
                  <th>Categoría ID:</th>
                  <td>{detalle.categoria_id}</td>
                </tr>
                <tr>
                  <th>Plan ID:</th>
                  <td>{detalle.plan_id}</td>
                </tr>
                <tr>
                  <th>Tipo Familia ID:</th>
                  <td>{detalle.tipo_familia_id}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="rounded-3" onClick={() => setShowDetalle(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Precio */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Precio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              value={precioEdit.precio || ""}
              onChange={e => setPrecioEdit({ ...precioEdit, precio: e.target.value })}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" className="rounded-3" onClick={() => setShowEdit(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="rounded-3" onClick={handleSaveEdit}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Agregar Precio */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Precio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Plan</Form.Label>
                <Form.Select
                  value={nuevoPrecio.plan_id || ""}
                  onChange={e => setNuevoPrecio({ ...nuevoPrecio, plan_id: e.target.value })}
                >
                  <option value="">Seleccione un plan</option>
                  {planesDisponibles.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Categoría Edad</Form.Label>
                <Form.Select
                  value={nuevoPrecio.categoria_id || ""}
                  onChange={e => setNuevoPrecio({ ...nuevoPrecio, categoria_id: e.target.value })}
                >
                  <option value="">Seleccione una categoría</option>
                  {categoriasDisponibles.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Tipo Familia</Form.Label>
                <Form.Select
                  value={nuevoPrecio.tipo_familia_id || ""}
                  onChange={e => setNuevoPrecio({ ...nuevoPrecio, tipo_familia_id: e.target.value })}
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposFamiliaDisponibles.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevoPrecio.precio || ""}
                  onChange={e => setNuevoPrecio({ ...nuevoPrecio, precio: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Año</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevoPrecio.anio || anio} // Usa el año actual como valor predeterminado
                  onChange={e => setNuevoPrecio({ ...nuevoPrecio, anio: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" className="rounded-3" onClick={() => setShowAdd(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="rounded-3" onClick={handleAdd}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Aumentar Todos */}
      <Modal show={showAumento} onHide={() => setShowAumento(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Aumentar todos los precios</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Porcentaje de aumento</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                value={porcentaje}
                onChange={e => setPorcentaje(e.target.value)}
              />
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" className="rounded-3" onClick={() => setShowAumento(false)}>
            Cancelar
          </Button>
          <Button variant="primary" className="rounded-3" onClick={handleAumento}>
            Aplicar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Importar CSV */}
      <Modal show={showImportar} onHide={() => setShowImportar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Importar precios desde CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleImportarCSV}>
            <Form.Group className="mb-3">
              <Form.Label>Archivo CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={e => setArchivo(e.target.files[0])}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Opciones de importación</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Agregar nuevos precios"
                  name="importarOpciones"
                  value="agregar"
                  defaultChecked
                />
                <Form.Check
                  type="radio"
                  label="Reemplazar precios existentes"
                  name="importarOpciones"
                  value="reemplazar"
                />
              </div>
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="rounded-3 me-2" onClick={() => setShowImportar(false)}>
                Cancelar
              </Button>
              <Button variant="primary" className="rounded-3" type="submit">
                {loading ? <Spinner size="sm" animation="border" /> : "Importar"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListaPreciosAdmin;