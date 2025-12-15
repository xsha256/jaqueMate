import { describe, it, expect, beforeEach, vi } from 'vitest';

/* ============================================================
   STUBS GLOBALES (ANTES DE LOS IMPORTS REALES)
============================================================ */

// Stub mínimo de DOM para Node
global.HTMLElement = class {};

global.localStorage = {
  getItem: vi.fn(() => '1'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};


global.CustomEvent = class {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};

// Stub window mínimo (solo lo que usas)
global.window = {
  location: { hash: '' },
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Stub document (no se usa, pero evita crashes)
global.document = {};

// Mock Chessboard.js (no existe en Node)
global.Chessboard = vi.fn(() => ({
  position: vi.fn(),
  resize: vi.fn(),
  destroy: vi.fn(),
  clear: vi.fn()
}));

/* ============================================================
   IMPORTS DINÁMICOS (CLAVE)
============================================================ */

let AppAjedrez;
let TableroAjedrez;

beforeEach(async () => {
  // Import dinámico DESPUÉS de definir HTMLElement
  ({ AppAjedrez } = await import('../components/app-ajedrez/app-ajedrez.js'));
  ({ TableroAjedrez } = await import('../components/tablero-ajedrez/tablero-ajedrez.js'));
});

/* ============================================================
   TESTS DE LÓGICA PURA (SIN DOM)
============================================================ */

describe('Lógica AppAjedrez (sin DOM)', () => {
  let app;

  beforeEach(() => {
    app = new AppAjedrez();

    // Stubs de dependencias visuales
    app.tablero = { posicion$: { next: vi.fn() } };
    app.panel = { actualizarHistorial: vi.fn() };

    app.modal = { style: { display: 'none' } };
    app.modalTitulo = { textContent: '' };
    app.modalMensaje = { textContent: '' };
    app.modalIcon = { className: '', textContent: '' };
  });

  it('se inicializa correctamente', () => {
    expect(app.chess).toBeDefined();
    expect(app.chess.history().length).toBe(0);
  });

  it('permite un movimiento legal', async () => {
    await app.manejarIntentoMovimiento({ desde: 'e2', hasta: 'e4' });

    expect(app.chess.history().length).toBe(1);
  });

  it('bloquea un movimiento ilegal', async () => {
    const fenAntes = app.chess.fen();

    await app.manejarIntentoMovimiento({ desde: 'e2', hasta: 'e5' });

    expect(app.chess.fen()).toBe(fenAntes);
    expect(app.chess.history().length).toBe(0);
  });

  it('reiniciarPartida resetea la partida', () => {
    app.chess.move('e4');
    app.reiniciarPartida();

    expect(app.chess.history().length).toBe(0);
  });

  it('carga FEN desde la URL', () => {
    window.location.hash = '#game?fen=8/8/8/8/8/8/8/8 w - - 0 1';

    app.cargarPosicionDesdeURL();

    expect(app.chess.fen()).toContain('8/8/8/8');
  });

  it('FEN inválido hace reset', () => {
    window.location.hash = '#game?fen=INVALIDO';

    app.cargarPosicionDesdeURL();

    expect(app.chess.history().length).toBe(0);
  });



});

/* ============================================================
   TABLERO AJEDREZ (LÓGICA)
============================================================ */

describe('Lógica TableroAjedrez (sin DOM)', () => {
  let tablero;

  beforeEach(() => {
    tablero = new TableroAjedrez();

    tablero.board = {
      position: vi.fn(() => ({})),
      clear: vi.fn(),
      destroy: vi.fn()
    };

    tablero.dispatchEvent = vi.fn();
  });

  it('alSoltar emite evento intento-movimiento', () => {
    tablero.alSoltar('e2', 'e4', 'wP');

    expect(tablero.dispatchEvent).toHaveBeenCalled();
    expect(tablero.dispatchEvent.mock.calls[0][0].detail).toMatchObject({
      desde: 'e2',
      hasta: 'e4'
    });
  });

  it('limpiarTablero limpia el board', () => {
    tablero.limpiarTablero();
    expect(tablero.board.clear).toHaveBeenCalled();
  });

  it('disconnectedCallback destruye el board', () => {
    tablero.disconnectedCallback();
    expect(tablero.board.destroy).toHaveBeenCalled();
  });
});
