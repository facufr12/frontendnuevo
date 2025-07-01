import { useState, useEffect } from "react";
import { ButtonGroup, Button, Container, Spinner, Alert, Card } from "react-bootstrap";
import { FaTable, FaTh, FaMoneyBillWave } from "react-icons/fa";
import CotizacionesTable from "./CotizacionesTable";
import CotizacionesCard from "./CotizacionesCard";
import axios from "axios";
import { API_URL } from "../../config";

const SupervisorCotizaciones = () => {
  const [vista, setVista] = useState("tabla");
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setError("No se pudieron cargar las cotizaciones.");
        console.error("Error al obtener cotizaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCotizaciones();
  }, []);

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
        <Alert variant="danger" className="shadow-sm rounded-3 border-0">
          <Alert.Heading className="h5 d-flex align-items-center">
            <FaMoneyBillWave className="me-2" />
            Error al cargar cotizaciones
          </Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4 supervisor-content">
      {/* Header con título y controles de vista */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div className="d-flex align-items-center">
              <FaMoneyBillWave className="me-2 text-primary" size={24} />
              <h4 className="mb-0 fw-bold">Gestión de Cotizaciones</h4>
            </div>
            
            <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center">
              <div className="text-muted small d-none d-md-block me-3">
                {cotizaciones.length} cotización{cotizaciones.length !== 1 ? 'es' : ''} encontrada{cotizaciones.length !== 1 ? 's' : ''}
              </div>
              
              <ButtonGroup size="sm">
                <Button
                  variant={vista === "tabla" ? "primary" : "outline-primary"}
                  onClick={() => setVista("tabla")}
                  className="d-flex align-items-center fw-semibold"
                >
                  <FaTable className="me-2" />
                  <span className="d-none d-sm-inline">Tabla</span>
                </Button>
                <Button
                  variant={vista === "card" ? "primary" : "outline-primary"}
                  onClick={() => setVista("card")}
                  className="d-flex align-items-center fw-semibold"
                >
                  <FaTh className="me-2" />
                  <span className="d-none d-sm-inline">Tarjetas</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Contenido de las vistas */}
      {vista === "tabla" ? (
        <CotizacionesTable cotizaciones={cotizaciones} />
      ) : (
        <CotizacionesCard cotizaciones={cotizaciones} />
      )}
    </Container>
  );
};

export default SupervisorCotizaciones;