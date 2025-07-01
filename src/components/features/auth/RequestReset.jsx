import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ENDPOINTS } from "../../config";
import ThemeToggle from "../../common/ThemeToggle";
import logoSrc from "../../../assets/logo-cober.webp";


const RequestReset = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación básica de email
        if (!email.includes("@") || !email.includes(".")) {
            Swal.fire({
                icon: "error",
                title: "Email inválido",
                text: "Por favor ingresa un correo electrónico válido",
                confirmButtonColor: "#dc3545"
            });
            return;
        }

        setLoading(true);
        
        try {
            const response = await axios.post(
                `${ENDPOINTS.AUTH}/request-password-reset`,
                { email }
            );
            
            await Swal.fire({
                icon: "success",
                title: "¡Solicitud enviada!",
                html: `
                    <p>${response.data.message || 'Hemos enviado un enlace de recuperación a tu correo electrónico.'}</p>
                    <small class="text-muted">Si no lo ves en tu bandeja principal, revisa la carpeta de spam.</small>
                `,
                confirmButtonColor: "#754ffe"
            });
            
            // Limpiar el formulario después del éxito
            setEmail("");
            
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Error al solicitar el restablecimiento de contraseña",
                confirmButtonColor: "#dc3545"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light position-relative">
            {/* Toggle de tema en la esquina superior derecha */}
            <div className="position-absolute top-0 end-0 m-3">
                <ThemeToggle />
            </div>
            
            <div className="card shadow-lg rounded-4 w-100" style={{ maxWidth: "500px" }}>
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
                        <h4 className="mb-0">Recuperar Contraseña</h4>
                    </div>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="form-label">Correo Electrónico</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Ingresa tu correo registrado"
                            />
                        </div>
                        <div className="d-grid">
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-lg rounded-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Enviando...
                                    </>
                                ) : "Enviar Instrucciones"}
                            </button>
                        </div>
                        <div className="mt-3 text-center">
                            <small className="text-muted">
                                Te enviaremos un enlace para restablecer tu contraseña.
                            </small>
                        </div>
                        <div className="mt-3 text-center">
                            <Link to="/" className="text-decoration-none">
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestReset;