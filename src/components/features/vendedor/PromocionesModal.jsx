import { useState, useEffect } from "react";
import { Modal, Button, Form, Card, Alert, Badge } from "react-bootstrap";
import { FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2"; // Añadir esta importación
import ThemeToggle from "../../common/ThemeToggle";

const PromocionesModal = ({ prospectoId, show, onClose, onPromocionAplicada }) => {
  const [promociones, setPromociones] = useState([]);
  const [selectedPromocion, setSelectedPromocion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promocionActual, setPromocionActual] = useState(null);

  useEffect(() => {
    if (show) {
      fetchPromociones();
      fetchPromocionActual();
    }
  }, [show, prospectoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPromociones = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "/api/vendedor/promociones",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPromociones(data);
    } catch (error) {
      setError("Error al cargar promociones");
      console.error("Error al obtener promociones:", error);
    }
  };

  const fetchPromocionActual = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `/api/vendedor/prospectos/${prospectoId}/promocion-actual`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data && data.promocion) {
        setPromocionActual(data.promocion);
      } else {
        setPromocionActual(null);
      }
    } catch (error) {
      console.error("Error al obtener promoción actual:", error);
    }
  };

  const handleSelectPromocion = (promocion) => {
    setSelectedPromocion(promocion);
  };

  const handleAplicarPromocion = async () => {
    if (!selectedPromocion) {
      setError("Por favor selecciona una promoción");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/vendedor/prospectos/${prospectoId}/aplicar-promocion`,
        { promocionId: selectedPromocion.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPromocionActual(selectedPromocion);

      // Cerrar modal inmediatamente
      onClose();
      setSelectedPromocion(null);

      // Actualizar las cotizaciones en el componente padre
      if (onPromocionAplicada) {
        onPromocionAplicada();
      }

      // Mostrar SweetAlert de éxito
      Swal.fire({
        title: '¡Promoción aplicada!',
        text: `La promoción "${selectedPromocion.nombre || selectedPromocion.titulo}" con ${selectedPromocion.descuento_porcentaje || selectedPromocion.descuento}% de descuento se ha aplicado correctamente.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#28a745'
      });
      
    } catch (error) {
      setError("Error al aplicar la promoción");
      console.error("Error al aplicar promoción:", error);
      
      // Mostrar SweetAlert de error
      Swal.fire({
        title: 'Error',
        text: 'No se pudo aplicar la promoción. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg" 
      centered 
      className="vendor-modal"
      fullscreen="sm-down"
    >
      <Modal.Header closeButton className="border-bottom bg-primary text-white">
        <Modal.Title className="fw-bold h5">Aplicar Promoción</Modal.Title>
        <div className="ms-auto me-2 d-none d-md-block">
          <ThemeToggle />
        </div>
      </Modal.Header>
      <Modal.Body className="p-2 p-md-4">
        {promocionActual && (
          <Alert variant="info" className="mb-3 border-0 shadow-sm rounded-3">
            <h6 className="mb-2 fw-bold">Promoción actual aplicada:</h6>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start">
              <div>
                <p className="mb-1">
                  <strong>{promocionActual.nombre || promocionActual.titulo}</strong>
                </p>
                <p className="mb-2 small text-muted">{promocionActual.descripcion}</p>
              </div>
              <Badge bg="info" className="fs-6 mt-2 mt-sm-0">
                {promocionActual.descuento_porcentaje || promocionActual.descuento}%
              </Badge>
            </div>
          </Alert>
        )}

        {error && <Alert variant="danger" className="border-0 shadow-sm rounded-3 mb-3">{error}</Alert>}

        <Form>
          <Form.Group>
            <Form.Label className="fw-bold mb-3 fs-5">Selecciona una promoción:</Form.Label>
            {promociones.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p>No hay promociones disponibles</p>
              </div>
            ) : (
              <div className="row g-2 g-md-3">
                {promociones.map((promocion) => (
                  <div key={promocion.id} className="col-12 col-md-6">
                    <Card
                      className={`h-100 shadow-sm cursor-pointer vendor-promocion-card ${
                        selectedPromocion?.id === promocion.id 
                          ? "border-primary border-2 bg-primary-subtle" 
                          : "border-light"
                      }`}
                      onClick={() => handleSelectPromocion(promocion)}
                      style={{ 
                        cursor: "pointer", 
                        transition: "all 0.3s ease",
                        transform: selectedPromocion?.id === promocion.id ? "translateY(-2px)" : "none"
                      }}
                    >
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="h6 mb-0 fw-bold text-primary">
                            {promocion.nombre || promocion.titulo}
                          </Card.Title>
                          <span className="badge bg-primary fs-6 rounded-pill px-2 py-1 ms-2">
                            {promocion.descuento_porcentaje || promocion.descuento}% OFF
                          </span>
                        </div>
                        <Card.Text className="small text-muted mb-3" style={{ lineHeight: 1.4 }}>
                          {promocion.descripcion}
                        </Card.Text>
                        {promocion.fecha_vencimiento && (
                          <div className="d-flex align-items-center text-muted">
                            <i className="fas fa-calendar-alt me-2"></i>
                            <small>
                              Válido hasta: {new Date(promocion.fecha_vencimiento).toLocaleDateString('es-ES')}
                            </small>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-column flex-md-row gap-2 justify-content-end border-top p-3">
        <Button 
          variant="outline-secondary" 
          className="rounded-3 px-4 w-100 w-md-auto order-2 order-md-1" 
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          className="rounded-3 px-4 w-100 w-md-auto order-1 order-md-2"
          onClick={handleAplicarPromocion}
          disabled={loading || !selectedPromocion}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Aplicando...
            </>
          ) : (
            <>
              <FaMoneyBillWave className="me-2 d-md-none" />
              Aplicar Promoción
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PromocionesModal;