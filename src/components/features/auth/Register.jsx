import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ENDPOINTS } from "../../config";
import ThemeToggle from "../../common/ThemeToggle";
import logoSrc from "../../../assets/logo-cober.webp";




const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: ""
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Limpiar error cuando el usuario está escribiendo
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
    
    // Validar confirmación de contraseña en tiempo real
    if (e.target.name === "password_confirmation" || 
        (e.target.name === "password" && formData.password_confirmation)) {
      const password = e.target.name === "password" ? e.target.value : formData.password;
      const confirmation = e.target.name === "password_confirmation" ? e.target.value : formData.password_confirmation;
      
      if (password && confirmation && password !== confirmation) {
        setErrors({
          ...errors,
          password_confirmation: "Las contraseñas no coinciden"
        });
      } else {
        setErrors({
          ...errors,
          password_confirmation: null
        });
      }
    }
  };

  const showAlert = (icon, title, text) => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: '#754ffe',
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar el formulario antes de enviar
    if (!validateForm()) {
      return;
    }
    
    // Crear un objeto sin la confirmación de contraseña para enviarlo al servidor
    const dataToSend = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: formData.phone_number,
      password: formData.password
    };
    
    try {
      const response = await axios.post(`${ENDPOINTS.AUTH}/register`, dataToSend);      await showAlert("success", "¡Registro exitoso!", response.data.message || "Tu cuenta ha sido creada correctamente");
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error en el registro";
      showAlert("error", "Error", errorMessage);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light position-relative" style={{ padding: "20px 0" }}>
      {/* Toggle de tema en la esquina superior derecha */}
      <div className="position-absolute top-0 end-0 m-3">
        <ThemeToggle />
      </div>
      
      <div className="card shadow-lg rounded-4 w-100" style={{ maxWidth: "800px" }}>
        <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
          <div className="d-flex flex-column align-items-center">
            <div className="mb-3" style={{ height: "60px", display: "flex", alignItems: "center" }}>
              <img 
                src={logoSrc} 
                alt="Cober Logo" 
                className="auth-logo"
                style={{ 
                  height: "60px", 
                  width: "auto",
                  maxWidth: "200px",
                  objectFit: "contain",
                  display: "block",
                  filter: "brightness(0) invert(1)",
                  transition: "filter 0.3s ease"
                }} 
                onLoad={() => console.log("Logo cargado exitosamente")}
                onError={(e) => {
                  console.error("Error cargando logo desde assets:", logoSrc);
                  e.target.src = "/logo-cober.svg";
                  e.target.onerror = () => {
                    console.error("Error cargando logo desde public también");
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: white;">COBER</div>';
                  };
                }}
              />
            </div>
            <h4 className="mb-0">Registro de Usuario</h4>
          </div>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input 
                type="text" 
                name="first_name" 
                className="form-control" 
                onChange={handleChange} 
                value={formData.first_name}
                placeholder="Tu nombre"
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Apellido</label>
              <input 
                type="text" 
                name="last_name" 
                className="form-control" 
                onChange={handleChange} 
                value={formData.last_name}
                placeholder="Tu apellido"
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo</label>
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                onChange={handleChange} 
                value={formData.email}
                placeholder="ejemplo@correo.com"
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Teléfono</label>
              <input 
                type="text" 
                name="phone_number" 
                className="form-control" 
                onChange={handleChange} 
                value={formData.phone_number}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                onChange={handleChange} 
                value={formData.password}
                placeholder="Contraseña segura"
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Confirmar Contraseña</label>
              <input 
                type="password" 
                name="password_confirmation" 
                className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                onChange={handleChange} 
                value={formData.password_confirmation}
                placeholder="Repite tu contraseña"
                required 
              />
              {errors.password_confirmation && (
                <div className="invalid-feedback">
                  {errors.password_confirmation}
                </div>
              )}
            </div>
            
            <div className="col-12 mt-4">
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-lg rounded-3">Registrarse</button>
              </div>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p>¿Ya tienes una cuenta? <Link to="/" className="text-decoration-none">Inicia sesión aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;