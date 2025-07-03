// URL base de la API
// Usando proxy local para evitar problemas de CORS
export const API_URL = "/api";

// Endpoints específicos
export const ENDPOINTS = {
    AUTH: `${API_URL}/auth`, // Módulo de autenticación
    ADMIN: `${API_URL}/admin`, // Módulo de administración
    PROSPECTOS: `${API_URL}/prospectos`, // Módulo de administración
    TIPOS_AFILIACION: `${API_URL}/tipos_afiliacion`, // Tipos de afiliación
    LEAD: `${API_URL}/lead`, // Endpoint para guardar leads
};
