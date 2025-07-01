import { useEffect, useState } from "react";
import { Table, Button, Modal, Badge, Spinner, Container, Alert } from "react-bootstrap";
import { FaUser, FaMoneyBillWave, FaEye } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../../config";

const PLAN_COLORS = {
  "Plan Oro": "warning",
  "Plan Plata": "secondary", 
  "Plan Bronce": "info",
  "Plan Básico": "primary",
  "Plan Premium": "success",
};

// Función para capitalizar la primera letra de cada palabra
const capitalizeName = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const CotizacionesPorUsuario = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cotizacionesUsuario, setCotizacionesUsuario] = useState([]);
  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/cotizaciones`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCotizaciones(data);
      } catch (err) {
        setError("Error al cargar las cotizaciones");
        console.error("Error al obtener cotizaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCotizaciones();
  }, []);

  // Agrupa cotizaciones por prospecto_id
  const cotizacionesPorProspecto = cotizaciones.reduce((acc, cot) => {
    if (!acc[cot.prospecto_id]) acc[cot.prospecto_id] = [];
    acc[cot.prospecto_id].push(cot);
    return acc;
  }, {});

  const handleVerMas = (prospecto_id, prospecto_nombre) => {
    setCotizacionesUsuario(cotizacionesPorProspecto[prospecto_id]);
    setUsuarioNombre(capitalizeName(prospecto_nombre));
    setModalOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando cotizaciones por usuario...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger" className="shadow-sm rounded-3">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="supervisor-content">
      <div className="d-flex align-items-center mb-4">
        <FaUser className="me-2 text-primary" size={24} />
        <h4 className="mb-0 fw-bold">Cotizaciones por Usuario</h4>
      </div>

      {Object.keys(cotizacionesPorProspecto).length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <FaUser size={48} className="mb-3 opacity-50" />
            <p className="h5">No hay cotizaciones por usuario</p>
            <p className="text-muted">Las cotizaciones aparecerán aquí cuando estén disponibles.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-3 border-0">
          <Table striped hover className="mb-0">
            <thead className="table-primary">
              <tr>
                <th className="fw-bold border-0">
                  <FaUser className="me-2" />
                  Prospecto
                </th>
                <th className="fw-bold border-0 text-center">Cotizaciones</th>
                <th className="fw-bold border-0 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cotizacionesPorProspecto).map(([prospecto_id, cotizaciones]) => (
                <tr key={prospecto_id} style={{ transition: "background-color 0.2s ease" }}>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary-subtle rounded-circle p-2 me-3">
                        <FaUser className="text-primary" size={14} />
                      </div>
                      <div>
                        <div className="fw-semibold">{capitalizeName(cotizaciones[0].prospecto_nombre)}</div>
                        <small className="text-muted">ID: {prospecto_id}</small>
                      </div>
                    </div>
                  </td>
                  <td className="text-center align-middle">
                    <Badge bg="primary" className="rounded-pill px-3 py-2">
                      {cotizaciones.length} cotización{cotizaciones.length !== 1 ? 'es' : ''}
                    </Badge>
                  </td>
                  <td className="text-center align-middle">
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      className="rounded-3 fw-semibold d-flex align-items-center mx-auto"
                      onClick={() => handleVerMas(prospecto_id, cotizaciones[0].prospecto_nombre)}
                      style={{ transition: "all 0.2s ease" }}
                    >
                      <FaEye className="me-2" />
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={modalOpen} onHide={() => setModalOpen(false)} size="lg" centered className="supervisor-modal">
        <Modal.Header closeButton className="border-bottom bg-primary text-white">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <FaMoneyBillWave className="me-2" />
            Cotizaciones de {usuarioNombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {cotizacionesUsuario.map((cot) => (
            <div key={cot.id} className="mb-4 p-3 border rounded-3 supervisor-cotization-detail" style={{ backgroundColor: "var(--bs-light)" }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <Badge 
                  bg={PLAN_COLORS[cot.plan_nombre] || "primary"} 
                  className="fs-6 px-3 py-2 rounded-pill"
                  style={{ fontSize: "0.9rem !important" }}
                >
                  {cot.plan_nombre}
                </Badge>
                <small className="text-muted d-flex align-items-center">
                  <FaMoneyBillWave className="me-1" />
                  {new Date(cot.fecha).toLocaleDateString('es-ES')}
                </small>
              </div>
              
              <div className="row g-3 mb-3">
                <div className="col-sm-6 col-lg-3">
                  <div className="bg-info-subtle p-2 rounded-3 text-center">
                    <div className="fw-bold small text-muted">Total Bruto</div>
                    <div className="fw-bold text-info">{formatCurrency(cot.total_bruto)}</div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="bg-warning-subtle p-2 rounded-3 text-center">
                    <div className="fw-bold small text-muted">Descuento</div>
                    <div className="fw-bold text-warning">{formatCurrency(cot.descuento_aporte)}</div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="bg-success-subtle p-2 rounded-3 text-center">
                    <div className="fw-bold small text-muted">Total Final</div>
                    <div className="fw-bold text-success">{formatCurrency(cot.total_final)}</div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="bg-secondary-subtle p-2 rounded-3 text-center">
                    <div className="fw-bold small text-muted">Fecha</div>
                    <div className="fw-bold text-secondary">{new Date(cot.fecha).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h6 className="fw-bold mb-3">
                  <FaUser className="me-2 text-primary" />
                  Integrantes del Grupo Familiar
                </h6>
                {cot.detalles && cot.detalles.length > 0 ? (
                  <div className="table-responsive">
                    <Table size="sm" bordered hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold">Persona</th>
                          <th className="fw-semibold">Vínculo</th>
                          <th className="fw-semibold">Edad</th>
                          <th className="fw-semibold">Tipo Afiliación</th>
                          <th className="fw-semibold">Precio Base</th>
                          <th className="fw-semibold">Descuento</th>
                          <th className="fw-semibold">Motivo Descuento</th>
                          <th className="fw-semibold">Precio Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cot.detalles.map((det) => (
                          <tr key={det.id}>
                            <td className="fw-semibold">{capitalizeName(det.persona)}</td>
                            <td>{det.vinculo}</td>
                            <td className="text-center">{det.edad}</td>
                            <td>{det.tipo_afiliacion}</td>
                            <td className="text-end">{formatCurrency(det.precio_base)}</td>
                            <td className="text-end">{formatCurrency(det.descuento_aporte)}</td>
                            <td>{det.motivo_descuento || "Sin motivo"}</td>
                            <td className="text-end fw-bold">{formatCurrency(det.precio_final)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-muted text-center py-3">Sin detalles de integrantes</div>
                )}
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="outline-secondary" className="rounded-3" onClick={() => setModalOpen(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CotizacionesPorUsuario;