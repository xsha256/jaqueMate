/**
 * Configuración de la API
 *
 * ⚙️ INSTRUCCIONES:
 * 1. Cambia API_BASE_URL por la URL de tu backend
 * 2. Si usas autenticación, configura los headers necesarios
 */

// 🔧 CONFIGURACIÓN PRINCIPAL - Cambia esta URL
export const API_BASE_URL = 'http://localhost:3000/api';

// Ejemplo para producción:
// export const API_BASE_URL = 'https://tu-dominio.com/api';

// Ejemplo para desarrollo con puerto diferente:
// export const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Headers por defecto para todas las peticiones
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Endpoints disponibles
 */
export const ENDPOINTS = {
  MOVIMIENTOS: '/movimientos',
  PARTIDAS: '/partidas',
  USUARIOS: '/usuarios',
};
