/**
 * Servicio para comunicación con la API del backend
 */

import { API_BASE_URL, DEFAULT_HEADERS, ENDPOINTS } from '../config/api.config.js';

/**
 * Guarda un movimiento en la base de datos
 * @param {Object} movimientoData - Datos del movimiento a guardar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function guardarMovimiento(movimientoData) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MOVIMIENTOS}`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(movimientoData)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al guardar movimiento en BD:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de movimientos de un usuario
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<Array>} Lista de movimientos
 */
export async function obtenerHistorialUsuario(usuarioId) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MOVIMIENTOS}/usuario/${usuarioId}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
}

/**
 * Crea una nueva partida
 * @param {Object} partidaData - Datos de la partida
 * @returns {Promise<Object>} Datos de la partida creada
 */
export async function crearPartida(partidaData) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PARTIDAS}`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(partidaData)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al crear partida:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de una partida
 * @param {string} partidaId - ID de la partida
 * @param {Object} actualizacion - Datos a actualizar
 * @returns {Promise<Object>} Partida actualizada
 */
export async function actualizarPartida(partidaId, actualizacion) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PARTIDAS}/${partidaId}`, {
      method: 'PATCH',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(actualizacion)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar partida:', error);
    throw error;
  }
}
