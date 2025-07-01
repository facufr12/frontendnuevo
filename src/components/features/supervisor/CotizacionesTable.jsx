import { useEffect, useState } from "react";
import { Container, Button, Table, Form, Alert, Spinner, Card } from "react-bootstrap";
import { FaUser, FaMoneyBillWave, FaSearch, FaFileAlt } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../../config";

// Función para capitalizar la primera letra de cada palabra
const capitalizeName = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const CotizacionesTabla = () => {
  const [prospectos, setProspectos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState({});
  const [prospectoSeleccionado, setProspectoSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener la lista de prospectos
    const fetchProspectos = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/supervisor/prospectos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProspectos(data);
      } catch (error) {
        setError("Error al obtener los prospectos");
        console.error("Error al obtener prospectos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProspectos();
  }, []);

  const handleProspectoChange = async (e) => {
    const prospectoId = e.target.value;
    setProspectoSeleccionado(prospectoId);

    if (!prospectoId) {
      setCotizaciones({});
      return;
    }

    setLoadingCotizaciones(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/supervisor/cotizaciones/${prospectoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Organizar cotizaciones por plan
      const cotizacionesPorPlan = data.reduce((acc, cot) => {
        const plan = cot.plan || "Sin Plan";
        if (!acc[plan]) acc[plan] = [];
        acc[plan].push(cot);
        return acc;
      }, {});

      setCotizaciones(cotizacionesPorPlan);
    } catch (error) {
      setCotizaciones({});
      setError("Error al obtener las cotizaciones");
      console.error("Error al obtener cotizaciones:", error);
    } finally {
      setLoadingCotizaciones(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getProspectoSeleccionadoNombre = () => {
    const prospecto = prospectos.find(p => p.id.toString() === prospectoSeleccionado);
    return prospecto ? `${capitalizeName(prospecto.nombre)} ${capitalizeName(prospecto.apellido)}` : '';
  };

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando prospectos...</p>
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
    <Container className="my-4 supervisor-content">
      <div className="d-flex align-items-center mb-4">
        <FaFileAlt className="me-2 text-primary" size={24} />
        <h4 className="mb-0 fw-bold">Tabla de Cotizaciones</h4>
      </div>

      {/* Selector de prospectos */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <Form.Group className="mb-0">
            <Form.Label className="fw-bold d-flex align-items-center mb-3">
              <FaSearch className="me-2 text-primary" />
              Selecciona un prospecto para ver sus cotizaciones
            </Form.Label>
            <Form.Select 
              value={prospectoSeleccionado} 
              onChange={handleProspectoChange}
              className="rounded-3 border-2"
              style={{ transition: "border-color 0.2s ease" }}
            >
              <option value="">-- Selecciona un prospecto --</option>
              {prospectos.map((prospecto) => (
                <option key={prospecto.id} value={prospecto.id}>
                  {capitalizeName(prospecto.nombre)} {capitalizeName(prospecto.apellido)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Loading de cotizaciones */}
      {loadingCotizaciones && (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-muted">Cargando cotizaciones...</span>
        </div>
      )}

      {/* Mostrar cotizaciones organizadas por plan */}
      {!loadingCotizaciones && Object.keys(cotizaciones).length === 0 && prospectoSeleccionado && (
        <div className="text-center py-5">
          <div className="text-muted">
            <FaMoneyBillWave size={48} className="mb-3 opacity-50" />
            <p className="h5">No hay cotizaciones para este prospecto</p>
            <p className="text-muted">Las cotizaciones aparecerán aquí cuando estén disponibles.</p>
          </div>
        </div>
      )}

      {!loadingCotizaciones && !prospectoSeleccionado && (
        <div className="text-center py-5">
          <div className="text-muted">
            <FaUser size={48} className="mb-3 opacity-50" />
            <p className="h5">Selecciona un prospecto</p>
            <p className="text-muted">Elige un prospecto del selector de arriba para ver sus cotizaciones.</p>
          </div>
        </div>
      )}

      {!loadingCotizaciones && Object.keys(cotizaciones).length > 0 && (
        <div>
          <div className="d-flex align-items-center mb-4">
            <FaUser className="me-2 text-success" />
            <h5 className="mb-0 fw-bold text-success">
              Cotizaciones de {getProspectoSeleccionadoNombre()}
            </h5>
          </div>

          {Object.entries(cotizaciones).map(([plan, cotizacionesPlan]) => (
            <Card key={plan} className="mb-4 shadow-sm border-0">
              <Card.Header className="bg-primary text-white border-0">
                <h5 className="mb-0 fw-bold d-flex align-items-center">
                  <FaMoneyBillWave className="me-2" />
                  {plan}
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-bold border-0">#</th>
                        <th className="fw-bold border-0">Persona</th>
                        <th className="fw-bold border-0">Vínculo</th>
                        <th className="fw-bold border-0">Edad</th>
                        <th className="fw-bold border-0">Tipo Afiliación</th>
                        <th className="fw-bold border-0 text-end">Precio Base</th>
                        <th className="fw-bold border-0 text-end">Descuento</th>
                        <th className="fw-bold border-0 text-end">Precio Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotizacionesPlan.map((cotizacion, index) => (
                        <tr key={cotizacion.id} style={{ transition: "background-color 0.2s ease" }}>
                          <td className="fw-semibold text-primary">{index + 1}</td>
                          <td className="fw-semibold">{capitalizeName(cotizacion.persona)}</td>
                          <td>
                            <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2 py-1">
                              {cotizacion.vinculo}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                              {cotizacion.edad} años
                            </span>
                          </td>
                          <td>{cotizacion.tipo_afiliacion}</td>
                          <td className="text-end fw-semibold text-info">{formatCurrency(cotizacion.precio_base)}</td>
                          <td className="text-end fw-semibold text-warning">{formatCurrency(cotizacion.descuento_aporte)}</td>
                          <td className="text-end fw-bold text-success">{formatCurrency(cotizacion.precio_final)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default CotizacionesTabla;