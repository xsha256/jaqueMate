
import { API_BASE_URL, DEFAULT_HEADERS, ENDPOINTS } from '../config/api.config.js';

// USUARIOS
export async function registrarUsuario(usuarioData) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USUARIOS}/registro`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(usuarioData)
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Usuario o email ya existe');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
}

// login
export async function loginUsuario(credenciales) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USUARIOS}/login`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(credenciales)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciales inválidas');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}

//Perfil
export async function obtenerPerfilPorUsuario(usuario) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USUARIOS}/perfil/${usuario}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

export async function obtenerPerfilPorEmail(email) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USUARIOS}/email/${email}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}


export async function obtenerPerfilPorId(id) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USUARIOS}/${id}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

// Verificar nombre usuario
export async function verificarExisteUsuario(usuario) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USUARIOS}/existe/usuario/${usuario}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    throw error;
  }
}

//Verificar email
export async function verificarExisteEmail(email) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USUARIOS}/existe/email/${email}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al verificar email:', error);
    throw error;
  }
}

// JUGADAS
export async function obtenerTodasJugadas(params = {}) {
  const { page = 0, size = 10, sort = ['createdAt,desc'] } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  sort.forEach(s => queryParams.append('sort', s));

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}?${queryParams}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener jugadas:', error);
    throw error;
  }
}

// Jugada por ID
export async function obtenerJugadasPorUsuarioId(usuarioId, params = {}) {
  const { page = 0, size = 10, sort = ['createdAt,desc'] } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  sort.forEach(s => queryParams.append('sort', s));

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}/usuario/${usuarioId}?${queryParams}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener jugadas del usuario:', error);
    throw error;
  }
}

// Jugada por nombre de jugador
export async function obtenerJugadasPorNombre(nombre, params = {}) {
  const { page = 0, size = 10, sort = ['createdAt,desc'] } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  sort.forEach(s => queryParams.append('sort', s));

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}/jugador/${nombre}?${queryParams}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener jugadas del jugador:', error);
    throw error;
  }
}

// Jugada por id
export async function obtenerJugadaPorId(id) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}/${id}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Jugada no encontrada');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener jugada:', error);
    throw error;
  }
}

// Nueva jugada
export async function crearJugada(jugadaData) {
  console.log(jugadaData);
  
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(jugadaData)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear jugada:', error);
    throw error;
  }
}

/// Exportar jugadas CSV
export async function exportarJugadasCSV() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}/exportar/csv`, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error al exportar jugadas:', error);
    throw error;
  }
}

// Importar CSV
export async function importarJugadasCSV(file, usuarioId) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usuarioId', usuarioId.toString());

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}/importar/csv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al importar CSV:', error);
    throw error;
  }
}

// Importación jugada jugador
export async function confirmarImportacionJugadas(usuarioId, jugadas) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.JUGADAS}/importar/confirmar?usuarioId=${usuarioId}`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(jugadas)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al confirmar importación:', error);
    throw error;
  }
}
