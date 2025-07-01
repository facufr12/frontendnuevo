import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ENDPOINTS } from "../../config";
import ThemeToggle from "../../common/ThemeToggle";
import logoSrc from "../../../assets/logo-cober.webp";


const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState("pending"); // "pending", "loading", "success", "error"
  const [message, setMessage] = useState("");

  const handleVerification = async () => {
    setVerificationStatus("loading");
    
    try {
      // Hacer la petición al backend para verificar el token
      const response = await axios.get(`${ENDPOINTS.AUTH}/verify/${token}`);
      
      setVerificationStatus("success");
      setMessage(response.data.message || "Tu cuenta ha sido verificada correctamente.");
      
      // Mostrar alerta de éxito
      Swal.fire({
        icon: "success",
        title: "¡Verificación exitosa!",
        text: response.data.message || "Tu cuenta ha sido verificada correctamente.",
        confirmButtonColor: "#754ffe",
      });

         // Esperar 2 segundos y redirigir a la ruta raíz
    setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      
    } catch (error) {
      setVerificationStatus("error");
      setMessage(error.response?.data?.message || "No se pudo verificar tu cuenta. El enlace podría haber expirado.");
      
      // Mostrar alerta de error
      Swal.fire({
        icon: "error",
        title: "Error de verificación",
        text: error.response?.data?.message || "No se pudo verificar tu cuenta. El enlace podría haber expirado.",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light position-relative">
      {/* Toggle de tema en la esquina superior derecha */}
      <div className="position-absolute top-0 end-0 m-3">
        <ThemeToggle />
      </div>
      
      <div className="card shadow-lg rounded-4 w-100" style={{ maxWidth: "500px" }}>
        <div 
          className={`card-header text-white text-center py-4 rounded-top-4 ${
            verificationStatus === 'success' ? 'bg-success' : 
            verificationStatus === 'error' ? 'bg-danger' : 
            'bg-primary'
          }`}
        >
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
            <h4 className="mb-0">
              {verificationStatus === "pending" && "Verificación de cuenta"}
              {verificationStatus === "loading" && "Verificando cuenta..."}
              {verificationStatus === "success" && "¡Cuenta verificada!"}
              {verificationStatus === "error" && "Error de verificación"}
            </h4>
          </div>
        </div>
        <div className="card-body p-4 text-center">
          {verificationStatus === "pending" && (
            <div className="my-4">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-envelope-check text-primary" viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.708 6.208L1 11.105V5.383l4.708 2.825ZM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2Z"/>
                  <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z"/>
                </svg>
              </div>
              <h5 className="mb-3">¡Estás a un paso de completar tu registro!</h5>
              <p>Para verificar tu cuenta, por favor haz clic en el botón de abajo.</p>
              <div className="mt-4">
                <button 
                  onClick={handleVerification} 
                  className="btn btn-primary btn-lg rounded-3"
                >
                  Verificar mi cuenta
                </button>
              </div>
            </div>
          )}
          
          {verificationStatus === "loading" && (
            <div className="my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Estamos verificando tu cuenta, por favor espera...</p>
            </div>
          )}
          
          {verificationStatus === "success" && (
            <div className="my-4">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
              </div>
              <h5 className="mb-3">¡Tu cuenta ha sido verificada con éxito!</h5>
              <p>{message}</p>
              <div className="mt-4">
                <Link to="/" className="btn btn-success btn-lg rounded-3">
                  Iniciar sesión
                </Link>
              </div>
            </div>
          )}
          
          {verificationStatus === "error" && (
            <div className="my-4">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-x-circle-fill text-danger" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                </svg>
              </div>
              <h5 className="mb-3">No pudimos verificar tu cuenta</h5>
              <p>{message}</p>
              <div className="mt-4">
                <Link to="/" className="btn btn-primary me-2 rounded-3">
                  Ir al inicio de sesión
                </Link>
                <Link to="/resend-verification" className="btn btn-outline-primary rounded-3">
                  Solicitar nuevo enlace
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;