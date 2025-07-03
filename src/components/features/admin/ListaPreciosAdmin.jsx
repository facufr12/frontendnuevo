import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Row, Col, Button, Table, Modal, Form, InputGroup, Badge,
  Card, Spinner, Alert, Nav, OverlayTrigger, Tooltip
} from "react-bootstrap";
import { 
  FaEdit, FaTrash, FaPlus, FaPercentage, FaEye, FaFileExport, 
  FaFileImport, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown,
  FaCheck, FaTimes, FaInfoCircle, FaList
} from "react-icons/fa";
import useScreenSize from "../../../hooks/useScreenSize";
import '../vendedor/mobile-styles.css';
import './admin-mobile-styles.css';

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
  const { isMobile } = useScreenSize();
  const [precios, setPrecios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [precioEdit, setPrecioEdit] = useState({});
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [detalle, setDetalle] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [tabActiva, setTabActiva] = useState("lista");
  const [ordenPor, setOrdenPor] = useState("id");
  const [ordenDir, setOrdenDir] = useState("asc");
  const [archivo, setArchivo] = useState(null);
  const [showExito, setShowExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  
  // Filtros
  const [filtroPlan, setFiltroPlan] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTipoFamilia, setFiltroTipoFamilia] = useState("");

  // Funciones placeholder para botones
  const handleShowAdd = () => {
    console.log("Función Agregar precio - Por implementar");
  };

  const handleShowAumento = () => {
    console.log("Función Aumentar precios - Por implementar");
  };

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

  useEffect(() => {
    fetchPrecios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio]);

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
        default:
          valorA = a.id;
          valorB = b.id;
      }
      
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
      await axios.put(`${API_URL}/admin/lista-precios/${precioEdit.id}`, precioEdit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEdit(false);
      setPrecioEdit({});
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

  const handleDetalle = (row) => {
    setDetalle(row);
    setShowDetalle(true);
  };

  const handleOrdenar = (campo) => {
    if (ordenPor === campo) {
      setOrdenDir(ordenDir === "asc" ? "desc" : "asc");
    } else {
      setOrdenPor(campo);
      setOrdenDir("asc");
    }
  };

  const getIconoOrden = (campo) => {
    if (ordenPor !== campo) return <FaSort className="ms-1 text-muted" size={12} />;
    return ordenDir === "asc" ? <FaSortUp className="ms-1 text-primary" size={12} /> : <FaSortDown className="ms-1 text-primary" size={12} />;
  };

  const handleExportarCSV = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/lista-precios/exportar?anio=${anio}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
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

  if (loading && precios.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando lista de precios...</p>
      </div>
    );
  }

  return (
    <div className={`admin-content ${isMobile ? 'mobile-view' : ''}`}>
      {/* Tabs de navegación */}
      <Card className={`admin-content shadow-sm mb-4 ${isMobile ? 'rounded-mobile' : ''}`}>
        <Card.Header className={isMobile ? 'p-mobile border-0' : ''}>
          <Nav variant="tabs" className={`${isMobile ? 'tabs-mobile' : ''}`}>
            <Nav.Item>
              <Nav.Link 
                active={tabActiva === "lista"} 
                onClick={() => setTabActiva("lista")}
                className={`${isMobile ? 'btn-touch' : ''}`}
              >
                <FaList className="me-2" />
                {isMobile ? "Precios" : "Lista de Precios"}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={tabActiva === "importar"} 
                onClick={() => setTabActiva("importar")}
                className={`${isMobile ? 'btn-touch' : ''}`}
              >
                <FaFileImport className="me-2" />
                {isMobile ? "Import/Export" : "Importar/Exportar"}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body className={isMobile ? 'p-mobile' : ''}>
          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onClose={() => setError(null)} 
              className={`mb-3 ${isMobile ? 'font-small-mobile' : ''}`}
            >
              {error}
            </Alert>
          )}
          
          {showExito && (
            <Alert 
              variant="success" 
              dismissible 
              onClose={() => setShowExito(false)} 
              className={`mb-3 ${isMobile ? 'font-small-mobile' : ''}`}
            >
              {mensajeExito}
            </Alert>
          )}
          
          {tabActiva === "lista" && (
            <>
              {/* Controles para móvil */}
              {isMobile && (
                <>
                  {/* Control de año prominente */}
                  <div className="year-controls-mobile">
                    <span className="fw-bold">Año:</span>
                    <Form.Select
                      value={anio}
                      onChange={e => setAnio(e.target.value)}
                      className="form-control-touch"
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Form.Select>
                  </div>

                  {/* Barra de herramientas móvil */}
                  <div className="toolbar-mobile">
                    <div className="btn-group w-100">
                      <Button 
                        variant="primary" 
                        className="btn-touch"
                        onClick={handleShowAdd}
                      >
                        <FaPlus className="me-1" />
                        Agregar
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        className="btn-touch"
                        onClick={handleShowAumento}
                      >
                        <FaPercentage className="me-1" />
                        Aumentar
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        className="btn-touch"
                        onClick={handleExportarCSV}
                      >
                        <FaFileExport className="me-1" />
                        Exportar
                      </Button>
                    </div>
                  </div>

                  {/* Búsqueda móvil */}
                  <div className="search-bar-mobile">
                    <InputGroup className="shadow-mobile">
                      <InputGroup.Text><FaSearch /></InputGroup.Text>
                      <Form.Control
                        placeholder="Buscar planes, categorías..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="form-control-touch"
                      />
                    </InputGroup>
                  </div>

                  {/* Filtros móviles */}
                  <div className="price-filters-mobile">
                    <Form.Select 
                      value={filtroPlan} 
                      onChange={e => setFiltroPlan(e.target.value)}
                      className="form-control-touch"
                    >
                      <option value="">Todos los planes</option>
                      {planes.map(plan => (
                        <option key={plan} value={plan}>{capitalizeName(plan)}</option>
                      ))}
                    </Form.Select>
                    
                    <Form.Select 
                      value={filtroCategoria} 
                      onChange={e => setFiltroCategoria(e.target.value)}
                      className="form-control-touch"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{capitalizeName(cat)}</option>
                      ))}
                    </Form.Select>
                  </div>

                  <div className="price-filters-mobile">
                    <Form.Select 
                      value={filtroTipoFamilia} 
                      onChange={e => setFiltroTipoFamilia(e.target.value)}
                      className="form-control-touch"
                    >
                      <option value="">Todos los tipos</option>
                      {tiposFamilia.map(tipo => (
                        <option key={tipo} value={tipo}>{capitalizeName(tipo)}</option>
                      ))}
                    </Form.Select>
                    
                    <Button 
                      variant="outline-secondary" 
                      className="btn-touch"
                      onClick={() => {
                        setFiltroPlan("");
                        setFiltroCategoria("");
                        setFiltroTipoFamilia("");
                        setBusqueda("");
                      }}
                    >
                      <FaTimes className="me-1" />
                      Limpiar
                    </Button>
                  </div>

                  {/* Estadísticas para móvil */}
                  <div className="stats-mobile">
                    <div className="stat-card-mobile">
                      <div className="stat-number">{preciosFiltrados.length}</div>
                      <div className="stat-label">Precios</div>
                    </div>
                    <div className="stat-card-mobile">
                      <div className="stat-number">{planes.length}</div>
                      <div className="stat-label">Planes</div>
                    </div>
                  </div>
                </>
              )}

              {/* Controles para desktop */}
              {!isMobile && (
                <>
                  <Row className="mb-3 align-items-center">
                    <Col xs={12} md={6} className="mb-2 mb-md-0">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="primary" 
                          className="rounded-3"
                          onClick={handleShowAdd}
                        >
                          <FaPlus className="me-1" /> Agregar
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          className="rounded-3"
                          onClick={handleShowAumento}
                        >
                          <FaPercentage className="me-1" /> Aumentar
                        </Button>
                      </div>
                    </Col>
                    <Col xs={8} md={4} className="mb-2 mb-md-0">
                      <InputGroup>
                        <InputGroup.Text><FaSearch /></InputGroup.Text>
                        <Form.Control
                          placeholder="Buscar..."
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col xs={4} md={2}>
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

                  {/* Filtros para desktop */}
                  <Row className="mb-3">
                    <Col xs={6} md={4} className="mb-2 mb-md-0">
                      <Form.Select 
                        value={filtroPlan} 
                        onChange={e => setFiltroPlan(e.target.value)}
                      >
                        <option value="">Todos los planes</option>
                        {planes.map(plan => (
                          <option key={plan} value={plan}>{plan}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={6} md={4} className="mb-2 mb-md-0">
                      <Form.Select 
                        value={filtroCategoria} 
                        onChange={e => setFiltroCategoria(e.target.value)}
                      >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={12} md={4}>
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
                </>
              )}

              {/* Tabla de precios - Solo en desktop */}
              {!isMobile && (
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
                          Categoría {getIconoOrden("categoria")}
                        </th>
                        <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("tipo")} style={{ minWidth: "140px" }}>
                          Tipo Familia {getIconoOrden("tipo")}
                        </th>
                        <th className="cursor-pointer fw-bold" onClick={() => handleOrdenar("precio")} style={{ minWidth: "120px" }}>
                          Precio {getIconoOrden("precio")}
                        </th>
                        <th className="fw-bold" style={{ minWidth: "150px" }}>Acciones</th>
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
              )}

              {/* Vista de tarjetas para móvil */}
              {isMobile && (
                <Row>
                  {preciosFiltrados.length === 0 ? (
                    <Col className="text-center py-5">
                      <p className="text-muted">No hay precios que coincidan con los filtros aplicados.</p>
                    </Col>
                  ) : (
                    preciosFiltrados.map((row) => (
                      <Col key={row.id} xs={12} className="mb-3">
                        <Card className="price-card-mobile fade-in-mobile">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="plan-name">
                              {capitalizeName(row.plan)}
                            </div>
                            <div className="price-value">
                              ${parseFloat(row.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                          </Card.Header>
                          
                          <Card.Body className="p-mobile">
                            <div className="price-details">
                              <div className="detail-item">
                                <span className="detail-label">Categoría:</span>
                                <span>{capitalizeName(row.categoria_edad)}</span>
                              </div>
                              
                              <div className="detail-item">
                                <span className="detail-label">Tipo:</span>
                                <span>{capitalizeName(row.tipo_familia)}</span>
                              </div>
                              
                              <div className="detail-item">
                                <span className="detail-label">ID:</span>
                                <span>{row.id}</span>
                              </div>
                              
                              <div className="detail-item">
                                <span className="detail-label">Año:</span>
                                <span>{anio}</span>
                              </div>
                            </div>
                          </Card.Body>
                          
                          <Card.Footer className="bg-light">
                            <div className="actions-mobile">
                              <Button 
                                variant="primary" 
                                className="btn-mobile btn-touch"
                                onClick={() => handleDetalle(row)}
                              >
                                <FaEye className="me-1" />
                                Ver
                              </Button>
                              
                              <Button 
                                variant="warning" 
                                className="btn-mobile btn-touch"
                                onClick={() => handleEdit(row)}
                              >
                                <FaEdit className="me-1" />
                                Editar
                              </Button>
                              
                              <Button 
                                variant="danger" 
                                className="btn-mobile btn-touch"
                                onClick={() => handleDelete(row.id)}
                              >
                                <FaTrash className="me-1" />
                                Eliminar
                              </Button>
                            </div>
                          </Card.Footer>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              )}
              
              {/* Información de resultados */}
              <div className={`d-flex justify-content-between align-items-center mt-3 ${isMobile ? 'mobile-pagination' : ''}`}>
                <div>
                  <small className="text-muted">
                    Mostrando {preciosFiltrados.length} de {precios.length} precios
                  </small>
                </div>
              </div>
            </>
          )}
          
          {tabActiva === "importar" && (
            <div className={`py-3 ${isMobile ? 'mobile-import-section' : ''}`}>
              <Row>
                <Col md={6} className="mb-4">
                  <Card className={isMobile ? 'mobile-card' : ''}>
                    <Card.Header className={`bg-light ${isMobile ? 'mobile-card-header' : ''}`}>
                      <h5 className="mb-0">{isMobile ? "Importar CSV" : "Importar precios desde CSV"}</h5>
                    </Card.Header>
                    <Card.Body className={isMobile ? 'mobile-card-body' : ''}>
                      <Form onSubmit={handleImportarCSV}>
                        <Form.Group className="mb-3">
                          <Form.Label className={isMobile ? 'mobile-form-label' : ''}>
                            Seleccionar archivo CSV
                          </Form.Label>
                          <Form.Control
                            type="file"
                            accept=".csv"
                            onChange={(e) => setArchivo(e.target.files[0])}
                            required
                            className={isMobile ? 'mobile-form-control' : ''}
                          />
                          <Form.Text className="text-muted">
                            {isMobile ? "Formato: CSV con columnas requeridas" : "El archivo debe tener las columnas: plan, categoria_edad, tipo_familia, precio"}
                          </Form.Text>
                        </Form.Group>
                        <div className={`d-flex gap-2 ${isMobile ? 'mobile-action-buttons' : ''}`}>
                          <Button 
                            type="submit" 
                            variant="primary" 
                            className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-primary flex-fill' : ''}`}
                            disabled={loading}
                          >
                            <FaFileImport className="me-1" /> 
                            {loading ? "Importando..." : (isMobile ? "Importar" : "Importar Archivo")}
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-4">
                  <Card className={isMobile ? 'mobile-card' : ''}>
                    <Card.Header className={`bg-light ${isMobile ? 'mobile-card-header' : ''}`}>
                      <h5 className="mb-0">{isMobile ? "Exportar CSV" : "Exportar precios a CSV"}</h5>
                    </Card.Header>
                    <Card.Body className={isMobile ? 'mobile-card-body' : ''}>
                      <p className={isMobile ? 'text-sm' : ''}>
                        {isMobile ? "Descarga todos los precios en formato CSV." : "Descarga la lista completa de precios en formato CSV para el año seleccionado."}
                      </p>
                      <Button 
                        variant="success" 
                        className={`rounded-3 w-100 ${isMobile ? 'mobile-btn mobile-btn-success' : ''}`}
                        onClick={handleExportarCSV}
                        disabled={loading}
                      >
                        <FaFileExport className="me-1" /> 
                        {loading ? "Exportando..." : (isMobile ? "Exportar" : "Exportar a CSV")}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para ver detalles */}
      <Modal 
        show={showDetalle} 
        onHide={() => setShowDetalle(false)} 
        centered 
        size={isMobile ? "xl" : "lg"}
        fullscreen={isMobile ? "sm-down" : false}
        className={isMobile ? 'mobile-modal' : ''}
      >
        <Modal.Header closeButton className={isMobile ? 'mobile-modal-header' : ''}>
          <Modal.Title className={isMobile ? 'mobile-modal-title' : ''}>Detalle del Precio</Modal.Title>
        </Modal.Header>
        <Modal.Body className={isMobile ? 'mobile-modal-body' : ''}>
          {detalle && (
            <div className={isMobile ? 'mobile-detail-content' : ''}>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>ID:</strong> {detalle.id}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Plan:</strong> {capitalizeName(detalle.plan)}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Categoría de Edad:</strong> {capitalizeName(detalle.categoria_edad)}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Tipo de Familia:</strong> {capitalizeName(detalle.tipo_familia)}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Precio:</strong> ${parseFloat(detalle.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
              <div className={isMobile ? 'mobile-detail-item' : 'mb-2'}>
                <strong>Año:</strong> {detalle.anio}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={isMobile ? 'mobile-modal-footer' : ''}>
          <Button 
            variant="secondary" 
            className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-secondary flex-fill me-2' : ''}`} 
            onClick={() => setShowDetalle(false)}
          >
            Cerrar
          </Button>
          <Button 
            variant="warning" 
            className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-warning flex-fill' : ''}`} 
            onClick={() => {
              setShowDetalle(false);
              handleEdit(detalle);
            }}
          >
            Editar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar precio */}
      <Modal 
        show={showEdit} 
        onHide={() => setShowEdit(false)}
        size={isMobile ? "xl" : "lg"}
        fullscreen={isMobile ? "sm-down" : false}
        className={isMobile ? 'mobile-modal' : ''}
      >
        <Modal.Header closeButton className={isMobile ? 'mobile-modal-header' : ''}>
          <Modal.Title className={isMobile ? 'mobile-modal-title' : ''}>Editar Precio</Modal.Title>
        </Modal.Header>
        <Modal.Body className={isMobile ? 'mobile-modal-body' : ''}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Precio</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={precioEdit.precio || ''}
                onChange={(e) => setPrecioEdit({...precioEdit, precio: e.target.value})}
                className={isMobile ? 'mobile-form-control' : ''}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Plan</Form.Label>
              <Form.Control
                value={precioEdit.plan || ''}
                readOnly
                className={isMobile ? 'mobile-form-control' : ''}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Categoría</Form.Label>
              <Form.Control
                value={precioEdit.categoria_edad || ''}
                readOnly
                className={isMobile ? 'mobile-form-control' : ''}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={isMobile ? 'mobile-form-label' : ''}>Tipo Familia</Form.Label>
              <Form.Control
                value={precioEdit.tipo_familia || ''}
                readOnly
                className={isMobile ? 'mobile-form-control' : ''}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={isMobile ? 'mobile-modal-footer' : ''}>
          <Button 
            variant="secondary" 
            className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-secondary flex-fill me-2' : ''}`} 
            onClick={() => setShowEdit(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            className={`rounded-3 ${isMobile ? 'mobile-btn mobile-btn-primary flex-fill' : ''}`} 
            onClick={handleSaveEdit}
          >
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListaPreciosAdmin;
