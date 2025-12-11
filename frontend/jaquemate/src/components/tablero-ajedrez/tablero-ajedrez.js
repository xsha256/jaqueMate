import { Chess } from 'chess.js';
import { BehaviorSubject } from 'rxjs';
import './tablero-ajedrez.css';

class TableroAjedrez extends HTMLElement {
  constructor() {
    super();
    this.posicion$ = new BehaviorSubject('start');
    this.board = null;
    this.contenedorTablero = null;
    this.suscripcionPosicion = null;
    this.handleResize = null;
  }

  connectedCallback() {
    if (typeof window.Chessboard === 'undefined') {
      setTimeout(() => this.connectedCallback(), 100);
      return;
    }
    this.inicializarComponente();
    this.suscribirseAPosicion();
    this.configurarResponsividad();
  }

  disconnectedCallback() {
    if (this.suscripcionPosicion) {
      this.suscripcionPosicion.unsubscribe();
    }
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
    if (this.board) {
      this.board.destroy();
    }
  }

  static get observedAttributes() {
    return ['posicion-inicial'];
  }

  attributeChangedCallback(nombre, valorAntiguo, valorNuevo) {
    if (nombre === 'posicion-inicial' && valorNuevo && this.board) {
      this.posicion$.next(valorNuevo);
    }
  }

  inicializarComponente() {
    this.innerHTML = `
      <div class="contenedor-tablero-wrapper">
        <div id="tablero-chess" class="contenedor-tablero"></div>
      </div>
    `;

    this.contenedorTablero = this.querySelector('#tablero-chess');

    const config = {
      draggable: true,
      position: this.getAttribute('posicion-inicial') || 'start',
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
      showNotation: true,
      orientation: 'white',
      onDrop: this.alSoltar.bind(this)
    };

    this.board = globalThis.Chessboard(this.contenedorTablero, config);
  }

  suscribirseAPosicion() {
    this.suscripcionPosicion = this.posicion$.subscribe((nuevaPosicion) => {
      this.actualizarPosicion(nuevaPosicion);
    });
  }

  configurarResponsividad() {
    let timeoutId = null;
    this.handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        if (this.board) {
          this.board.resize();
        }
      }, 100);
    };

    window.addEventListener('resize', this.handleResize);
  }

  actualizarPosicion(posicion) {
    if (!this.board) return;

    try {
      this.board.position(posicion);
    } catch (e) {
      console.error('Error al actualizar posición:', e);
    }
  }

  alSoltar(casillaOrigen, casillaDestino, pieza) {
    const eventoMovimiento = new CustomEvent('intento-movimiento', {
      detail: {
        desde: casillaOrigen,
        hasta: casillaDestino,
        pieza: pieza,
        posicionAnterior: this.obtenerPosicionActual()
      },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(eventoMovimiento);
    return 'snapback';
  }

  obtenerPosicionActual() {
    if (!this.board) return 'start';

    const posicion = this.board.position();

    try {
      const chess = new Chess();
      chess.clear();

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

  establecerPosicionDesdeObjeto(posicionObjeto) {
    if (!this.board) return;
    this.board.position(posicionObjeto);
  }

  limpiarTablero() {
    if (!this.board) return;
    this.board.clear();
  }

  obtenerPosicionComoObjeto() {
    if (!this.board) return {};
    return this.board.position();
  }
}

if (!customElements.get('tablero-ajedrez')) {
  customElements.define('tablero-ajedrez', TableroAjedrez);
}

export { TableroAjedrez };
