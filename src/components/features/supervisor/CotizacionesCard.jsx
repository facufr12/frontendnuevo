import { useEffect, useState } from "react";
import { Card, Row, Col, Container, Button, Spinner, Alert } from "react-bootstrap";
import { FaMoneyBillWave, FaUser, FaCalendarAlt } from "react-icons/fa";
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

const CotizacionesCards = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/cotizaciones`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCotizaciones(response.data);
      } catch (err) {
        setError("Error al cargar las cotizaciones");
        console.error("Error al obtener cotizaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCotizaciones();
  }, []);

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
        <p className="mt-3 text-muted">Cargando cotizaciones...</p>
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
        <FaMoneyBillWave className="me-2 text-primary" size={24} />
        <h4 className="mb-0 fw-bold">Cotizaciones</h4>
      </div>
      
      {cotizaciones.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <FaMoneyBillWave size={48} className="mb-3 opacity-50" />
            <p className="h5">No hay cotizaciones disponibles</p>
            <p className="text-muted">Las cotizaciones aparecerán aquí cuando estén disponibles.</p>
          </div>
        </div>
      ) : (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
          {cotizaciones.map(cot => (
            <Col key={cot.id}>
              <Card className="h-100 shadow-sm border-0 supervisor-cotization-card" style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
                <Card.Header className="text-center bg-primary text-white border-0 rounded-top">
                  <h5 className="mb-0 fw-bold">{cot.plan_nombre}</h5>
                </Card.Header>
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center mb-3">
                    <FaUser className="me-2 text-primary" />
                    <h6 className="mb-0 fw-semibold text-truncate">
                      {capitalizeName(cot.prospecto_nombre)}
                    </h6>
                  </div>
                  
                  <div className="cotization-details">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Total Bruto:</span>
                      <span className="fw-semibold text-info">{formatCurrency(cot.total_bruto)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Descuento:</span>
                      <span className="fw-semibold text-warning">{formatCurrency(cot.descuento_aporte)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
                      <span className="fw-bold">Total Final:</span>
                      <span className="fw-bold text-success h6 mb-0">{formatCurrency(cot.total_final)}</span>
                    </div>
                    
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center text-muted">
                        <FaCalendarAlt className="me-2" size={14} />
                        <small>{new Date(cot.fecha).toLocaleDateString('es-ES')}</small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-transparent border-0 p-3 pt-0">
                  <Button 
                    size="sm" 
                    variant="outline-primary" 
                    className="w-100 rounded-3 fw-semibold"
                    style={{ transition: "all 0.2s ease" }}
                  >
                    Ver Detalle
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CotizacionesCards;