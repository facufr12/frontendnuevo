import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Row, Col, Card, Container, Modal } from "react-bootstrap";
import { ENDPOINTS, API_URL } from "../../config";
import Swal from "sweetalert2";

// Debes traer estos arrays desde tu backend o mantenerlos sincronizados con el dashboard
const categoriasMonotributo = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "A exento", "B exento"
];

const vinculos = [
  { value: "pareja/conyuge", label: "Pareja/Conyuge" },
  { value: "hijo/a", label: "Hijo/a" },
  { value: "familiar a cargo", label: "Familiar a cargo" }
];

// Ahora los tipos de afiliación usan ID numérico
const tiposAfiliacion = [
  { id: 1, etiqueta: "Particular/autónomo", requiere_sueldo: 0, requiere_categoria: 0 },
  { id: 2, etiqueta: "Con recibo de sueldo", requiere_sueldo: 1, requiere_categoria: 0 },
  { id: 3, etiqueta: "Monotributista", requiere_sueldo: 0, requiere_categoria: 1 }
];

const FormularioLead = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    tipo_afiliacion_id: "",
    sueldo_bruto: "",
    categoria_monotributo: "",
    numero_contacto: "",
    correo: "",
    localidad: "",
    familiares: []
  });

  const [familiar, setFamiliar] = useState({
    vinculo: "",
    nombre: "",
    edad: "",
    tipo_afiliacion_id: "",
    sueldo_bruto: "",
    categoria_monotributo: ""
  });
  const [showFamiliar, setShowFamiliar] = useState(false);
  const [localidades, setLocalidades] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/localidades/buenos-aires`)
      .then(res => setLocalidades(res.data))
      .catch(() => setLocalidades([]));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTipoAfiliacion = e => {
    setForm({
      ...form,
      tipo_afiliacion_id: e.target.value,
      sueldo_bruto: "",
      categoria_monotributo: ""
    });
  };

  const handleFamiliarChange = e => {
    setFamiliar({ ...familiar, [e.target.name]: e.target.value });
  };

  const agregarFamiliar = () => {
    if (
      familiar.vinculo &&
      familiar.nombre &&
      !isNaN(Number(familiar.edad)) &&
      familiar.edad > 0 &&
      (
        familiar.vinculo !== "pareja/conyuge" ||
        (
          familiar.tipo_afiliacion_id &&
          (
            (tiposAfiliacion.find(t => t.id === Number(familiar.tipo_afiliacion_id))?.requiere_sueldo !== 1 || !isNaN(Number(familiar.sueldo_bruto))) &&
            (tiposAfiliacion.find(t => t.id === Number(familiar.tipo_afiliacion_id))?.requiere_categoria !== 1 || familiar.categoria_monotributo)
          )
        )
      )
    ) {
      setForm({
        ...form,
        familiares: [...form.familiares, {
          ...familiar,
          edad: Number(familiar.edad),
          sueldo_bruto: familiar.sueldo_bruto ? Number(familiar.sueldo_bruto) : null
        }]
      });
      setFamiliar({ vinculo: "", nombre: "", edad: "", tipo_afiliacion_id: "", sueldo_bruto: "", categoria_monotributo: "" });
      setShowFamiliar(false);
    } else {
      alert("Completa todos los datos requeridos del familiar con valores válidos.");
    }
  };

  const eliminarFamiliar = idx => {
    setForm({
      ...form,
      familiares: form.familiares.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      edad: form.edad ? Number(form.edad) : null,
      tipo_afiliacion_id: form.tipo_afiliacion_id ? Number(form.tipo_afiliacion_id) : null,
      sueldo_bruto: form.sueldo_bruto ? Number(form.sueldo_bruto) : null,
      categoria_monotributo: form.categoria_monotributo || null,
      familiares: form.familiares.map(fam => ({
        vinculo: fam.vinculo,
        nombre: fam.nombre,
        edad: fam.edad ? Number(fam.edad) : null,
        tipo_afiliacion_id: fam.tipo_afiliacion_id ? Number(fam.tipo_afiliacion_id) : null,
        sueldo_bruto: fam.sueldo_bruto ? Number(fam.sueldo_bruto) : null,
        categoria_monotributo: fam.categoria_monotributo || null
      }))
    };

    try {
      const response = await axios.post(`${API_URL}/lead`, data);
      const cotizacionesResponse = await axios.get(`${API_URL}/lead/${response.data.prospectoId}/cotizaciones`);
      setCotizaciones(cotizacionesResponse.data);
      setShowModal(true); // Mostrar el modal
    } catch (error) {
      // Mostrar errores de validación del backend
      if (error.response && error.response.data && error.response.data.errores) {
        const erroresList = error.response.data.errores.map(err => `<li>${err}</li>`).join('');
        Swal.fire({
          title: "Error de validación",
          html: `<ul style='text-align:left;'>${erroresList}</ul>`,
          icon: "warning",
          confirmButtonText: "Entendido"
        });
      } else {
        Swal.fire("Error", error.response?.data?.message || "No se pudo guardar el lead.", "error");
      }
    }
  };

  // Lógica para mostrar campos condicionales
  const tipoSeleccionado = tiposAfiliacion.find(t => t.id === Number(form.tipo_afiliacion_id));

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: 600 }} className="shadow">
        <Card.Body>
          <Card.Title className="mb-4 text-center">Formulario de Lead</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control name="apellido" value={form.apellido} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Edad del titular</Form.Label>
                  <Form.Control type="number" name="edad" value={form.edad} onChange={handleChange} min={0} max={120} required />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de afiliación</Form.Label>
                  <Form.Select name="tipo_afiliacion_id" value={form.tipo_afiliacion_id} onChange={handleTipoAfiliacion} required>
                    <option value="">Selecciona...</option>
                    {tiposAfiliacion.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.etiqueta}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {tipoSeleccionado?.requiere_sueldo === 1 && (
              <Form.Group className="mb-3">
                <Form.Label>Sueldo Bruto</Form.Label>
                <Form.Control
                  type="number"
                  name="sueldo_bruto"
                  value={form.sueldo_bruto}
                  onChange={handleChange}
                  min={0}
                  required
                />
              </Form.Group>
            )}
            {tipoSeleccionado?.requiere_categoria === 1 && (
              <Form.Group className="mb-3">
                <Form.Label>Categoría Monotributo</Form.Label>
                <Form.Select name="categoria_monotributo" value={form.categoria_monotributo} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  {categoriasMonotributo.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>WhatsApp</Form.Label>
                  <Form.Control name="numero_contacto" value={form.numero_contacto} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="correo" value={form.correo} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Localidad</Form.Label>
              <Form.Select
                name="localidad"
                value={form.localidad}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona...</option>
                {localidades.map(loc => (
                  <option key={loc.id} value={loc.nombre}>{loc.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Familiares */}
            <div className="mb-3">
              <Button variant="secondary" onClick={() => setShowFamiliar(!showFamiliar)}>
                {showFamiliar ? "Cancelar" : "Agregar familiar"}
              </Button>
            </div>
            {showFamiliar && (
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Select name="vinculo" value={familiar.vinculo} onChange={handleFamiliarChange}>
                    <option value="">Vínculo</option>
                    {vinculos.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Control
                    name="nombre"
                    placeholder="Nombre"
                    value={familiar.nombre}
                    onChange={handleFamiliarChange}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    name="edad"
                    placeholder="Edad"
                    value={familiar.edad}
                    onChange={handleFamiliarChange}
                    min={0}
                    max={120}
                  />
                </Col>
                <Col md={1}>
                  <Button variant="success" onClick={agregarFamiliar}>+</Button>
                </Col>
              </Row>
            )}
            {form.familiares.length > 0 && (
              <div className="mb-3">
                <strong>Familiares agregados:</strong>
                <ul>
                  {form.familiares.map((fam, idx) => (
                    <li key={idx}>
                      {fam.vinculo} - {fam.nombre} ({fam.edad} años)
                      <Button variant="link" size="sm" onClick={() => eliminarFamiliar(idx)}>Eliminar</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {familiar.vinculo === "pareja/conyuge" && (
              <>
                <Col md={12} className="mt-2">
                  <Form.Label>Tipo de Afiliación</Form.Label>
                  <Form.Select
                    name="tipo_afiliacion_id"
                    value={familiar.tipo_afiliacion_id}
                    onChange={handleFamiliarChange}
                    required
                  >
                    <option value="">Selecciona...</option>
                    {tiposAfiliacion.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.etiqueta}</option>
                    ))}
                  </Form.Select>
                </Col>
                {tiposAfiliacion.find(t => t.id === Number(familiar.tipo_afiliacion_id))?.requiere_sueldo === 1 && (
                  <Col md={12} className="mt-2">
                    <Form.Label>Sueldo Bruto</Form.Label>
                    <Form.Control
                      type="number"
                      name="sueldo_bruto"
                      value={familiar.sueldo_bruto}
                      onChange={handleFamiliarChange}
                      min={0}
                      required
                    />
                  </Col>
                )}
                {tiposAfiliacion.find(t => t.id === Number(familiar.tipo_afiliacion_id))?.requiere_categoria === 1 && (
                  <Col md={12} className="mt-2">
                    <Form.Label>Categoría Monotributo</Form.Label>
                    <Form.Select
                      name="categoria_monotributo"
                      value={familiar.categoria_monotributo}
                      onChange={handleFamiliarChange}
                      required
                    >
                      <option value="">Selecciona...</option>
                      {categoriasMonotributo.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Col>
                )}
              </>
            )}

            <Button type="submit" variant="primary">Guardar Lead</Button>
          </Form>
        </Card.Body>
      </Card>


      {/* Modal para mostrar las cotizaciones */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Cotizaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            {cotizaciones.map((cotizacion, index) => (
              <div className="col-md-6 mb-4" key={index}>
                <div className="card">
                  <div className="card-header text-center">
                    <h5>{cotizacion.plan}</h5>
                  </div>
                  <div className="card-body">
                    <p><strong>Grupo Familiar:</strong> {cotizacion.detalles.map(d => d.vinculo).join(", ")}</p>
                    {cotizacion.detalles.map((detalle, idx) => (
                      <div key={idx} className="mb-2">
                        <p><strong>{detalle.vinculo}:</strong></p>
                        <p>Edad: {detalle.edad}</p>
                        <p>Precio Base: ${detalle.precio_base}</p>
                        <p>Descuento: ${parseFloat(detalle.descuento).toFixed(2)} ({detalle.tipo_afiliacion})</p>
                        {detalle.sueldo_bruto && (
                          <p>Sueldo Bruto: ${detalle.sueldo_bruto}</p>
                        )}
                        <p>Precio Final: ${detalle.precio_final}</p>
                      </div>
                    ))}
                    <hr />
                    <p><strong>Total Bruto:</strong> ${cotizacion.total_bruto}</p>
                    <p><strong>Total Descuento:</strong> ${cotizacion.total_descuento}</p>
                    <p><strong>Total Final:</strong> ${cotizacion.total_final}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FormularioLead;