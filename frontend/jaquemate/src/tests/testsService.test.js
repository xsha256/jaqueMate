import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  guardarUsuarioId,
  obtenerUsuarioId,
  limpiarUsuarioId,
  estaAutenticado,
  registrarUsuario,
  loginUsuario,
  obtenerPerfilPorUsuario,
  obtenerPerfilPorEmail,
  obtenerPerfilPorId,
  verificarExisteUsuario,
  verificarExisteEmail,
  obtenerTodasJugadas,
  obtenerJugadasPorUsuarioId,
  obtenerJugadasPorNombre,
  obtenerJugadaPorId,
  crearJugada,
  eliminarJugada,
  exportarJugadasCSV,
  importarJugadasCSV,
  confirmarImportacionJugadas,
  actualizarPerfil
} from '../services/api.service.js'; // Ajusta ruta

// =====================================================
//  MOCKS GLOBALES
// =====================================================

// LocalStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => (store[key] = value)),
    removeItem: vi.fn((key) => delete store[key]),
    clear: () => (store = {}),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Global fetch mock
global.fetch = vi.fn();

// Default fake JSON
const fakeJson = { ok: true };

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// =====================================================
//  AUTH
// =====================================================

describe('Auth', () => {
  it('guardarUsuarioId guarda el ID', () => {
    guardarUsuarioId(100);
    expect(localStorage.setItem).toHaveBeenCalledWith('usuarioId', '100');
  });

  it('obtenerUsuarioId devuelve el ID', () => {
    localStorage.setItem('usuarioId', '200');
    expect(obtenerUsuarioId()).toBe('200');
  });

  it('limpiarUsuarioId elimina el ID', () => {
    localStorage.setItem('usuarioId', '300');
    limpiarUsuarioId();
    expect(localStorage.removeItem).toHaveBeenCalledWith('usuarioId');
  });

  it('estaAutenticado true si existe', () => {
    localStorage.setItem('usuarioId', '1');
    expect(estaAutenticado()).toBe(true);
  });

  it('estaAutenticado false si no existe', () => {
    expect(estaAutenticado()).toBe(false);
  });
});

// =====================================================
//  USUARIOS — REGISTRO & LOGIN
// =====================================================

describe('Usuarios - registrarUsuario', () => {
  it('retorna JSON si ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeJson)
    });
    expect(await registrarUsuario({})).toEqual(fakeJson);
  });

  it('lanza error 409', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 409 });
    await expect(registrarUsuario({})).rejects.toThrow('Usuario o email ya existe');
  });
});

describe('Usuarios - loginUsuario', () => {
  it('login correcto', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await loginUsuario({})).toEqual(fakeJson);
  });

  it('credenciales inválidas (401)', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(loginUsuario({})).rejects.toThrow('Credenciales inválidas');
  });
});

// =====================================================
//  PERFILES
// =====================================================

describe('Perfil - obtenerPerfilPorUsuario', () => {
  it('perfil correcto', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await obtenerPerfilPorUsuario('x')).toEqual(fakeJson);
  });

  it('404 no encontrado', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(obtenerPerfilPorUsuario('x')).rejects.toThrow('Usuario no encontrado');
  });
});

describe('Perfil - obtenerPerfilPorEmail', () => {
  it('email correcto', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await obtenerPerfilPorEmail('x')).toEqual(fakeJson);
  });

  it('404 email no encontrado', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(obtenerPerfilPorEmail('x')).rejects.toThrow('Usuario no encontrado');
  });
});

describe('Perfil - obtenerPerfilPorId', () => {
  it('id correcto', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await obtenerPerfilPorId(1)).toEqual(fakeJson);
  });

  it('404 id no encontrado', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(obtenerPerfilPorId(10)).rejects.toThrow('Usuario no encontrado');
  });
});

// =====================================================
//  VERIFICACIONES
// =====================================================

describe('Verificar usuario', () => {
  it('verificarExisteUsuario ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await verificarExisteUsuario('x')).toEqual(fakeJson);
  });

  it('error HTTP genérico', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(verificarExisteUsuario('x')).rejects.toThrow('Error HTTP: 500');
  });
});

describe('Verificar email', () => {
  it('verificarExisteEmail ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await verificarExisteEmail('x')).toEqual(fakeJson);
  });

  it('error HTTP genérico', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(verificarExisteEmail('x')).rejects.toThrow('Error HTTP: 500');
  });
});

// =====================================================
//  JUGADAS — GET LISTADO / FILTROS
// =====================================================

describe('Jugadas - obtenerTodasJugadas', () => {
  it('retorna JSON ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await obtenerTodasJugadas()).toEqual(fakeJson);
  });

  it('error HTTP', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(obtenerTodasJugadas()).rejects.toThrow('Error HTTP: 500');
  });
});

describe('Jugadas - obtenerJugadasPorUsuarioId', () => {
  it('retorna JSON ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await obtenerJugadasPorUsuarioId(1)).toEqual(fakeJson);
  });

  it('error HTTP', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(obtenerJugadasPorUsuarioId(1)).rejects.toThrow('Error HTTP: 500');
  });
});

describe('Jugadas - obtenerJugadasPorNombre', () => {
  it('retorna JSON ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await obtenerJugadasPorNombre('pepe')).toEqual(fakeJson);
  });

  it('error HTTP', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(obtenerJugadasPorNombre('pepe')).rejects.toThrow('Error HTTP: 500');
  });
});

// =====================================================
//  JUGADAS — GET por ID
// =====================================================

describe('Jugadas - obtenerJugadaPorId', () => {
  it('jugada ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await obtenerJugadaPorId(1)).toEqual(fakeJson);
  });

  it('404 jugada no encontrada', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(obtenerJugadaPorId(99)).rejects.toThrow('Jugada no encontrada');
  });
});

// =====================================================
//  JUGADAS — CREAR / ELIMINAR
// =====================================================

describe('Jugadas - crearJugada', () => {
  it('crea ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await crearJugada({})).toEqual(fakeJson);
  });

  it('error HTTP', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(crearJugada({})).rejects.toThrow('Error HTTP: 500');
  });
});

describe('Jugadas - eliminarJugada', () => {
  it('elimina ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    expect(await eliminarJugada(1)).toBe(true);
  });

  it('404 jugada no encontrada', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(eliminarJugada(1)).rejects.toThrow('Jugada no encontrada');
  });
});

// =====================================================
//  CSV EXPORT / IMPORT
// =====================================================

describe('Jugadas - exportarJugadasCSV', () => {
  it('exporta ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob())
    });
    const blob = await exportarJugadasCSV();
    expect(blob).toBeInstanceOf(Blob);
  });

  it('error HTTP', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(exportarJugadasCSV()).rejects.toThrow('Error HTTP: 500');
  });
});

describe('Jugadas - importarJugadasCSV', () => {
  it('importa ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(fakeJson)
    });

    const fakeFile = new File(['contenido'], 'test.csv', { type: 'text/csv' });
    expect(await importarJugadasCSV(fakeFile, 1)).toEqual(fakeJson);
  });

  it('error HTTP', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const fakeFile = new File(['contenido'], 'test.csv', { type: 'text/csv' });

    await expect(importarJugadasCSV(fakeFile, 1)).rejects.toThrow('Error HTTP: 500');
  });
});

describe('Jugadas - confirmarImportacionJugadas', () => {
  it('confirma ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await confirmarImportacionJugadas(1, [])).toEqual(fakeJson);
  });

  it('error HTTP', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(confirmarImportacionJugadas(1, [])).rejects.toThrow('Error HTTP: 500');
  });
});

// =====================================================
//  ACTUALIZAR PERFIL
// =====================================================

describe('Actualizar perfil', () => {
  it('actualiza ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fakeJson) });
    expect(await actualizarPerfil(1, {})).toEqual(fakeJson);
  });

  it('404 no encontrado', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(actualizarPerfil(1, {})).rejects.toThrow('Usuario no encontrado');
  });

  it('409 nombre en uso', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 409 });
    await expect(actualizarPerfil(1, {})).rejects.toThrow('El nombre de usuario ya está en uso');
  });
});
