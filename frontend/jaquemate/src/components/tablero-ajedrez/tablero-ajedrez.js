import { Chess } from 'chess.js';
import { BehaviorSubject } from 'rxjs';

/**
 * Componente Web Personalizado: Tablero de Ajedrez
 *
 * Este componente renderiza un tablero de ajedrez interactivo utilizando
 * chessboard.js y chess.js, con soporte para RxJS.
 *
 * IMPORTANTE: Este componente NO valida jugadas. Solo dibuja el tablero
 * y emite eventos cuando el usuario hace drag&drop de piezas.
 * La validación y el movimiento real deben ser gestionados desde el exterior.
 *
 * @example
 * // Crear el componente
 * const tablero = document.createElement('tablero-ajedrez');
 * document.body.appendChild(tablero);
 *
 * // Actualizar la posición mediante el subject (formato FEN)
 * tablero.posicion$.next('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
 *
 * // Escuchar eventos de movimiento (se emite SIEMPRE, incluso para jugadas ilegales)
 * tablero.addEventListener('intento-movimiento', (e) => {
 *   console.log('Usuario intentó mover:', e.detail);
 *   // e.detail contiene: { desde, hasta, pieza }
 *
 *   // Validar el movimiento externamente
 *   if (esMovimientoValido(e.detail)) {
 *     // Actualizar la posición del tablero
 *     tablero.posicion$.next(nuevaPosicionFEN);
 *   }
 *   // Si no es válido, el tablero automáticamente revierte la pieza
 * });
 */
class TableroAjedrez extends HTMLElement {
  constructor() {
    super();

    // Subject de RxJS para gestionar cambios de posición
    // Acepta strings en formato FEN o 'start' para la posición inicial
    this.posicion$ = new BehaviorSubject('start');

    // Instancia del tablero (se inicializará después de conectar al DOM)
    this.board = null;

    // Contenedor interno del tablero
    this.contenedorTablero = null;

    // Suscripción al subject de posición
    this.suscripcionPosicion = null;
  }

  /**
   * Se llama cuando el elemento se añade al DOM
   */
  connectedCallback() {
    // Esperar a que Chessboard esté disponible
    if (typeof window.Chessboard === 'undefined') {
      setTimeout(() => this.connectedCallback(), 100);
      return;
    }
    this.inicializarComponente();
    this.suscribirseAPosicion();
  }

  /**
   * Se llama cuando el elemento se elimina del DOM
   */
  disconnectedCallback() {
    if (this.suscripcionPosicion) {
      this.suscripcionPosicion.unsubscribe();
    }
    if (this.board) {
      this.board.destroy();
    }
  }

  /**
   * Atributos observables del componente
   */
  static get observedAttributes() {
    return ['posicion-inicial'];
  }

  /**
   * Se llama cuando cambia un atributo observado
   */
  attributeChangedCallback(nombre, valorAntiguo, valorNuevo) {
    if (nombre === 'posicion-inicial' && valorNuevo && this.board) {
      this.posicion$.next(valorNuevo);
    }
  }

  /**
   * Inicializa el componente y crea el tablero
   */
  inicializarComponente() {
    // Crear contenedor principal con estilos
    this.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }

        .contenedor-tablero-wrapper {
          width: 100%;
          position: relative;
          padding-bottom: 100%; /* Mantiene proporción 1:1 (cuadrado perfecto) */
        }

        .contenedor-tablero {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* Estilos para el tablero de chessboard.js */
        .contenedor-tablero > div {
          width: 100% !important;
          height: 100% !important;
        }

        /* Hacer que las coordenadas (números y letras) sean responsive */
        .notation-322f9 {
          font-size: clamp(8px, 1.5vw, 14px) !important;
        }

        /* Asegurar que las piezas mantengan proporciones */
        .piece-417db {
          background-size: contain !important;
        }
      </style>
      <div class="contenedor-tablero-wrapper">
        <div id="tablero-chess" class="contenedor-tablero"></div>
      </div>
    `;

    // Obtener referencia al contenedor
    this.contenedorTablero = this.querySelector('#tablero-chess');

    // Configurar chessboard.js
    const config = {
      draggable: true,
      position: this.getAttribute('posicion-inicial') || 'start',
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
      showNotation: true, // Mostrar coordenadas (números y letras)
      orientation: 'white', // Siempre blancas abajo (tablero fijo)
      onDrop: this.alSoltar.bind(this)
    };

    // Crear el tablero usando el objeto global Chessboard
    this.board = window.Chessboard(this.contenedorTablero, config);
  }

  /**
   * Suscribe el componente a los cambios del subject de posición
   */
  suscribirseAPosicion() {
    this.suscripcionPosicion = this.posicion$.subscribe((nuevaPosicion) => {
      this.actualizarPosicion(nuevaPosicion);
    });
  }

  /**
   * Actualiza la posición del tablero
   * @param {string} posicion - FEN string o 'start' para posición inicial
   */
  actualizarPosicion(posicion) {
    if (!this.board) return;

    try {
      // Actualizar el tablero visual
      this.board.position(posicion);
    } catch (e) {
      console.error('Error al actualizar posición:', e);
    }
  }

  /**
   * Callback cuando el usuario suelta una pieza
   * IMPORTANTE: Este método SIEMPRE emite un evento, incluso para movimientos ilegales.
   * No valida las jugadas, solo reporta el intento.
   *
   * @param {string} casillaOrigen - Casilla de origen (ej: 'e2')
   * @param {string} casillaDestino - Casilla de destino (ej: 'e4')
   * @param {string} pieza - Código de la pieza (ej: 'wP')
   * @param {object} nuevaPosicion - Nueva posición del tablero
   * @param {object} posicionAntigua - Posición anterior del tablero
   * @param {string} orientacion - Orientación del tablero
   * @returns {string} Siempre retorna 'snapback' porque el exterior decidirá si aplicar el movimiento
   */
  alSoltar(casillaOrigen, casillaDestino, pieza, nuevaPosicion, posicionAntigua, orientacion) {
    // Emitir evento personalizado SIEMPRE (incluso para jugadas ilegales)
    const eventoMovimiento = new CustomEvent('intento-movimiento', {
      detail: {
        desde: casillaOrigen,
        hasta: casillaDestino,
        pieza: pieza,
        posicionAnterior: this.obtenerPosicionActual(),
        // El exterior será responsable de validar y calcular estos datos:
        // - color de la pieza que se mueve
        // - si la jugada es legal
        // - nueva posición FEN si la jugada es válida
        // - si hay captura, enroque, jaque, etc.
      },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(eventoMovimiento);

    // SIEMPRE retornar 'snapback' para que la pieza vuelva a su posición original
    // El exterior decidirá si aplicar el movimiento actualizando posicion$
    return 'snapback';
  }

  /**
   * Método público para obtener la posición actual en formato FEN
   * @returns {string} FEN de la posición actual
   */
  obtenerPosicionActual() {
    if (!this.board) return 'start';

    const posicion = this.board.position();

    // Convertir el objeto de posición de chessboard.js a FEN
    // (necesitamos chess.js para esto)
    try {
      const chess = new Chess();
      chess.clear();

      // Colocar las piezas en chess.js según la posición del tablero
      for (const casilla in posicion) {
        const pieza = posicion[casilla];
        const color = pieza[0] === 'w' ? 'w' : 'b';
        const tipo = pieza[1].toLowerCase();
        chess.put({ type: tipo, color: color }, casilla);
      }

      return chess.fen();
    } catch (e) {
      console.error('Error al obtener FEN:', e);
      return 'start';
    }
  }

  /**
   * Método público para establecer una posición desde un objeto matriz 8x8
   * @param {Object} posicionObjeto - Objeto con casillas como claves (ej: {e2: 'wP', e7: 'bP'})
   */
  establecerPosicionDesdeObjeto(posicionObjeto) {
    if (!this.board) return;
    this.board.position(posicionObjeto);
  }

  /**
   * Método público para limpiar el tablero
   */
  limpiarTablero() {
    if (!this.board) return;
    this.board.clear();
  }

  /**
   * Método público para obtener la posición como objeto
   * @returns {Object} Objeto con casillas como claves
   */
  obtenerPosicionComoObjeto() {
    if (!this.board) return {};
    return this.board.position();
  }
}

// Auto-registrar el componente cuando se importa
// Esto permite usarlo en SPA routing sin problemas
if (!customElements.get('tablero-ajedrez')) {
  customElements.define('tablero-ajedrez', TableroAjedrez);
}

export { TableroAjedrez };
