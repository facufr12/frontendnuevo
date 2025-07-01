import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ENDPOINTS } from "../../config";
import ThemeToggle from "../../common/ThemeToggle";
import logoSrc from "../../../assets/logo-cober.webp";


const ResetPassword = () => {
    const { token } = useParams();
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (formData.newPassword !== formData.confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Las contraseñas no coinciden",
                confirmButtonColor: "#dc3545"
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            Swal.fire({
                icon: "error",
                title: "Contraseña muy corta",
                text: "La contraseña debe tener al menos 6 caracteres",
                confirmButtonColor: "#dc3545"
            });
            return;
        }

        setLoading(true);
        
        try {
            const response = await axios.post(
                `${ENDPOINTS.AUTH}/reset-password/${token}`,
                { newPassword: formData.newPassword }
            );
            
            await Swal.fire({
                icon: "success",
                title: "¡Contraseña actualizada!",
                text: response.data.message || "Tu contraseña ha sido restablecida correctamente.",
                confirmButtonColor: "#754ffe"
            });
            
            // Redirigir después de éxito
            window.location.href = "/";
            
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Error al restablecer la contraseña",
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
                        <h4 className="mb-0">Restablecer Contraseña</h4>
                    </div>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                minLength="6"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength="6"
                                placeholder="Repite tu contraseña"
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
                                        Procesando...
                                    </>
                                ) : "Restablecer Contraseña"}
                            </button>
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

export default ResetPassword;