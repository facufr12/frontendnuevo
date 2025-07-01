import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Table, Button, Offcanvas, ListGroup, Spinner } from "react-bootstrap";
import { FaUserFriends, FaMoneyBillWave, FaUserCheck, FaChevronLeft, FaTachometerAlt, FaUserPlus, FaSignOutAlt, FaBars, FaArrowLeft } from "react-icons/fa";
import PromocionesModal from "./PromocionesModal";
import ThemeToggle from "../../common/ThemeToggle";

const TIPO_AFILIACION = {
  1: "Particular/autónomo",
  2: "Con recibo de sueldo",
  3: "Monotributista",
};

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

const ProspectoDetalle = () => {
  const { id } = useParams();
  const [prospecto, setProspecto] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromocionesModal, setShowPromocionesModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  
  const navigate = useNavigate();

  const fetchCotizaciones = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`https://wspflows.cober.online/api/lead/${id}/cotizaciones?detalles=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Cotizaciones obtenidas:", data);

      // Si los datos ya vienen agrupados por plan, usar directamente
      if (Array.isArray(data) && data.length > 0 && data[0].plan_nombre) {
        setCotizaciones(data);
      } else {
        // Si vienen como array plano, agrupar por plan_id
        const cotizacionesAgrupadas = data.reduce((acc, cotizacion) => {
          const planId = cotizacion.plan_id;
          if (!acc[planId]) {
            acc[planId] = {
              plan_nombre: cotizacion.plan_nombre,
              tipo_afiliacion_nombre: cotizacion.tipo_afiliacion_nombre,
              total_bruto: cotizacion.total_bruto,
              total_descuento_aporte: cotizacion.total_descuento_aporte || 0,
              total_descuento_promocion: cotizacion.total_descuento_promocion || 0,
              total_final: cotizacion.total_final,
              detalles: [],
            };
          }
          acc[planId].detalles.push({
            persona: cotizacion.persona,
            vinculo: cotizacion.vinculo,
            edad: cotizacion.edad,
            tipo_afiliacion_id: cotizacion.tipo_afiliacion_id,
            tipo_afiliacion: cotizacion.tipo_afiliacion_nombre || TIPO_AFILIACION[cotizacion.tipo_afiliacion_id],
            precio_base: cotizacion.precio_base,
            descuento_aporte: cotizacion.descuento_aporte,
            promocion_aplicada: cotizacion.promocion_aplicada,
            descuento_promocion: cotizacion.descuento_promocion,
            precio_final: cotizacion.precio_final,
          });
          return acc;
        }, {});

        setCotizaciones(Object.values(cotizacionesAgrupadas));
      }
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
    }
  }, [id]);

  useEffect(() => {
    const fetchProspecto = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`https://wspflows.cober.online/api/prospectos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProspecto(data);
      } catch (error) {
        console.error("Error al obtener el prospecto:", error);
      } finally {
        setLoading(false);
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

    fetchProspecto();
    fetchCotizaciones();
    fetchPromociones();
  }, [id, fetchCotizaciones]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Logo con fallback
  const logoSrc = "/logo-cober.webp";

  // Drawer/Sidebar content
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
          <span className="fw-bold fs-5">Vendedor</span>
          <Button variant="light" size="sm" onClick={() => setOpenDrawer(false)}>
            <FaChevronLeft />
          </Button>
        </div>
      </div>
      <ListGroup variant="flush">
        <ListGroup.Item action onClick={() => navigate("/prospectos")}>
          <FaTachometerAlt className="me-2" /> Prospectos
        </ListGroup.Item>
        <ListGroup.Item action onClick={() => navigate("/prospectos/nuevo")}>
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

  if (!prospecto) {
    return (
      <div className="text-center my-5">No se encontró el prospecto.</div>
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
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center">
            <Button variant="light" className="d-md-none me-2" onClick={() => setOpenDrawer(true)}>
              <FaBars />
            </Button>
            <Link to="/prospectos" className="btn btn-outline-secondary me-2">
              <FaArrowLeft /> Volver
            </Link>
            <h2>Detalle del Prospecto</h2>
          </div>
          <div className="d-flex align-items-center">
            <Button variant="success" className="me-2" onClick={() => setShowPromocionesModal(true)}>
              <FaMoneyBillWave className="me-1" /> Aplicar Promoción
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Contenido del detalle */}
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <h3>Información del Prospecto</h3>
                </Card.Header>
                <Card.Body>
                  <p><strong>Nombre:</strong> {capitalizeName(prospecto.nombre)} {capitalizeName(prospecto.apellido)}</p>
                  <p><strong>Edad:</strong> {prospecto.edad}</p>
                  <p><strong>Contacto:</strong> {prospecto.numero_contacto}</p>
                  <p><strong>Email:</strong> {prospecto.correo}</p>
                  <p><strong>Localidad:</strong> {prospecto.localidad}</p>
                  <p><strong>Estado:</strong> <Badge bg="primary">{prospecto.estado}</Badge></p>
                  <p><strong>Comentario:</strong> {prospecto.comentario || "Sin comentario"}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <h5>Familiares</h5>
                </Card.Header>
                <Card.Body>
                  {prospecto.familiares && prospecto.familiares.length > 0 ? (
                    <div>
                      {prospecto.familiares.map((familiar, idx) => (
                        <Card key={idx} className="mb-2">
                          <Card.Body>
                            <div><FaUserFriends className="me-2" /> <strong>{familiar.vinculo}:</strong> {familiar.nombre} ({familiar.edad} años)</div>
                            <div className="mt-2">
                              {familiar.tipo_afiliacion_id && (
                                <span className="me-2">
                                  <Badge bg="info">
                                    Afiliación: {TIPO_AFILIACION[familiar.tipo_afiliacion_id] || familiar.tipo_afiliacion_id}
                                  </Badge>
                                </span>
                              )}
                              {familiar.sueldo_bruto && (
                                <span className="me-2"><Badge bg="success">Sueldo: {formatCurrency(familiar.sueldo_bruto)}</Badge></span>
                              )}
                              {familiar.categoria_monotributo && (
                                <span className="me-2"><Badge bg="secondary">Monotributo: {familiar.categoria_monotributo}</Badge></span>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted">Sin familiares</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0"><FaMoneyBillWave className="me-2" /> Cotizaciones</h5>
            </Card.Header>
            <Card.Body>
              {cotizaciones.length === 0 ? (
                <div className="text-muted text-center">Sin cotizaciones</div>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {cotizaciones.map((cotizacion, index) => (
                    <Col key={index}>
                      <Card className="h-100 shadow-sm">
                        <Card.Header className="text-center bg-primary text-white">
                          <h5>{cotizacion.plan_nombre || "Sin nombre de plan"}</h5>
                          <p className="mb-0">
                            <small>
                              {cotizacion.detalles && cotizacion.detalles.length > 0
                                ? [...new Set(cotizacion.detalles.map((detalle) => 
                                    detalle.tipo_afiliacion || TIPO_AFILIACION[detalle.tipo_afiliacion_id] || "Sin tipo"
                                  ))].join(", ")
                                : "Sin tipo de afiliación"}
                            </small>
                          </p>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Grupo Familiar:</strong> {
                            cotizacion.detalles && cotizacion.detalles.length > 0 
                              ? cotizacion.detalles.map(d => d.vinculo).join(", ")
                              : "Sin detalles"
                          }</p>
                          
                          {cotizacion.detalles && cotizacion.detalles.length > 0 && (
                            <div className="table-responsive">
                              <Table striped bordered hover size="sm" style={{ minWidth: "800px" }}>
                                <thead className="table-primary">
                                  <tr>
                                    <th style={{ minWidth: "100px" }}>Persona</th>
                                    <th style={{ minWidth: "80px" }}>Vínculo</th>
                                    <th style={{ minWidth: "60px" }}>Edad</th>
                                    <th style={{ minWidth: "100px" }}>Tipo Afiliación</th>
                                    <th style={{ minWidth: "90px" }}>Precio Base</th>
                                    <th style={{ minWidth: "90px" }}>Desc. Aporte</th>
                                    <th style={{ minWidth: "100px" }}>Promoción</th>
                                    <th style={{ minWidth: "90px" }}>Desc. Promo</th>
                                    <th style={{ minWidth: "100px" }}>Precio Final</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {cotizacion.detalles.map((detalle, idx) => (
                                    <tr key={idx}>
                                      <td>{capitalizeName(detalle.persona)}</td>
                                      <td>{detalle.vinculo}</td>
                                      <td>{detalle.edad}</td>
                                      <td>{detalle.tipo_afiliacion || TIPO_AFILIACION[detalle.tipo_afiliacion_id] || "Sin tipo"}</td>
                                      <td>{formatCurrency(detalle.precio_base)}</td>
                                      <td>{formatCurrency(detalle.descuento_aporte)}</td>
                                      <td>{detalle.promocion_aplicada || "Sin promoción"}</td>
                                      <td>{formatCurrency(detalle.descuento_promocion)}</td>
                                      <td><strong>{formatCurrency(detalle.precio_final)}</strong></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                          
                          <hr />
                          <div className="row text-center g-3">
                            <div className="col-lg-4 col-sm-6">
                              <div className="border rounded p-2 h-100">
                                <p className="mb-1"><strong>Total Bruto:</strong></p>
                                <p className="text-info h6 mb-0">{formatCurrency(cotizacion.total_bruto)}</p>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6">
                              <div className="border rounded p-2 h-100">
                                <p className="mb-1"><strong>Total Descuentos:</strong></p>
                                <p className="text-warning h6 mb-1">
                                  {formatCurrency(parseFloat(cotizacion.total_descuento_aporte || 0) + parseFloat(cotizacion.total_descuento_promocion || 0))}
                                </p>
                                <small className="text-muted">
                                  Aporte: {formatCurrency(cotizacion.total_descuento_aporte || 0)}<br/>
                                  Promo: {formatCurrency(cotizacion.total_descuento_promocion || 0)}
                                </small>
                              </div>
                            </div>
                            <div className="col-lg-4 col-12">
                              <div className="border border-success rounded p-2 h-100 bg-light">
                                <p className="mb-1"><strong>Total Final:</strong></p>
                                <p className="text-success h5 mb-0">{formatCurrency(cotizacion.total_final)}</p>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0"><FaUserCheck className="me-2" /> Promociones Disponibles</h5>
            </Card.Header>
            <Card.Body>
              {promociones.length === 0 ? (
                <div className="text-muted text-center">Sin promociones</div>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {promociones.map((promocion, index) => (
                    <Col key={index}>
                      <Card className="h-100 shadow-sm">
                        <Card.Header className="text-center bg-success text-white">
                          <h5>{promocion.titulo}</h5>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Descripción:</strong> {promocion.descripcion}</p>
                          <p><strong>Descuento:</strong> {promocion.descuento}%</p>
                          <p><strong>Válido hasta:</strong> {new Date(promocion.fecha_vencimiento).toLocaleDateString()}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

      <PromocionesModal
        prospectoId={id}
        show={showPromocionesModal}
        onClose={() => setShowPromocionesModal(false)}
        onPromocionAplicada={fetchCotizaciones}
      />
    </div>
  );
};

export default ProspectoDetalle;
