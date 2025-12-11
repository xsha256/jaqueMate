import { Chess } from 'chess.js';
import './app-ajedrez.css';
import '../tablero-ajedrez/tablero-ajedrez.js';
import '../panel-control/panel-control.js';
import { guardarMovimiento } from '../../services/api.service.js';

class AppAjedrez extends HTMLElement {
  constructor() {
    super();
    this.chess = new Chess();
  }

  connectedCallback() {
    this.render();
    this.setupReferences();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <main>
        <div class="game-container">
          <div class="board-wrapper">
            <tablero-ajedrez id="tablero"></tablero-ajedrez>
          </div>
          <panel-control id="panel"></panel-control>
        </div>
      </main>
    `;
  }

  setupReferences() {
    this.tablero = this.querySelector('#tablero');
    this.panel = this.querySelector('#panel');
  }

  setupEventListeners() {
    this.tablero.addEventListener('intento-movimiento', (evento) => {
      this.manejarIntentoMovimiento(evento.detail);
    });
  }

  async manejarIntentoMovimiento(detalle) {
    const { desde, hasta } = detalle;

    let movimiento;
    try {
      movimiento = this.chess.move({
        from: desde,
        to: hasta,
        promotion: 'q'
      });
    } catch (e) {
      return;
    }

    if (movimiento) {
      this.tablero.posicion$.next(this.chess.fen());
      this.actualizarHistorial();

      const datosParaBD = {
        usuario: 'ID_USUARIO',
        posicionInicial: desde,
        posicionFinal: hasta,
        colorFichas: movimiento.color === 'w' ? 'blancas' : 'negras',
        pieza: movimiento.piece,
        fenAntes: detalle.posicionAnterior,
        fenDespues: this.chess.fen(),
        san: movimiento.san,
        captura: movimiento.captured || null,
        timestamp: new Date().toISOString()
      };

      try {
        await guardarMovimiento(datosParaBD);
      } catch (error) {
        console.error('Error al guardar movimiento:', error);
      }
    }
  }

  actualizarHistorial() {
    const historial = this.chess.history();
    this.panel.actualizarHistorial(historial);
  }
}

if (!customElements.get('app-ajedrez')) {
  customElements.define('app-ajedrez', AppAjedrez);
}

export { AppAjedrez };
