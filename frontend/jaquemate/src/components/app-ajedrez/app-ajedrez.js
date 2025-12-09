import { Chess } from 'chess.js';
// Importar componentes hijos para asegurar que estén registrados
// Esto es importante para SPA routing - cada componente gestiona sus dependencias
import '../tablero-ajedrez/tablero-ajedrez.js';
import '../panel-control/panel-control.js';

/**
 * Componente Web: Aplicación de Ajedrez
 *
 * Componente contenedor que coordina:
 * - El tablero de ajedrez (<tablero-ajedrez>)
 * - El panel de control (<panel-control>)
 * - La lógica del juego con chess.js
 */
class AppAjedrez extends HTMLElement {
  constructor() {
    super();
    // Instancia de chess.js para validación
    this.chess = new Chess();
  }

  connectedCallback() {
    this.render();
    this.setupReferences();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }

        /* Contenedor principal del juego */
        main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          position: relative;
          min-height: 100vh;
        }

        .game-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
          width: 100%;
          transition: all 0.3s ease;
        }

        /* Contenedor del tablero */
        .board-wrapper {
          flex-shrink: 0;
          transition: margin-right 0.3s ease;
          margin-right: 0;
        }

        /* Estado cuando el panel está abierto */
        .game-container.panel-open .board-wrapper {
          margin-right: 150px;
        }

        tablero-ajedrez {
          display: block;
        }
      </style>

      <main>
        <div class="game-container">
          <!-- Tablero de ajedrez -->
          <div class="board-wrapper">
            <tablero-ajedrez id="tablero"></tablero-ajedrez>
          </div>

          <!-- Panel de control (incluye botón toggle) -->
          <panel-control id="panel"></panel-control>
        </div>
      </main>
    `;
  }

  setupReferences() {
    this.tablero = this.querySelector('#tablero');
    this.panel = this.querySelector('#panel');
    this.gameContainer = this.querySelector('.game-container');
  }

  setupEventListeners() {
    // Escuchar eventos del tablero
    this.tablero.addEventListener('intento-movimiento', (evento) => {
      this.manejarIntentoMovimiento(evento.detail);
    });

    // Escuchar evento de toggle del panel
    this.panel.addEventListener('panel-toggle', (evento) => {
      const { isOpen } = evento.detail;
      this.gameContainer.classList.toggle('panel-open', isOpen);
    });

    // Suscribirse a cambios de posición del tablero (opcional, para debug)
    this.tablero.posicion$.subscribe((nuevaPosicion) => {
      console.log('Posición actualizada:', nuevaPosicion);
    });
  }

  /**
   * Maneja el intento de movimiento desde el tablero
   */
  manejarIntentoMovimiento(detalle) {
    const { desde, hasta, pieza } = detalle;

    console.log(`Intento de movimiento: ${pieza} de ${desde} a ${hasta}`);

    // Validar el movimiento con chess.js
    let movimiento;
    try {
      movimiento = this.chess.move({
        from: desde,
        to: hasta,
        promotion: 'q' // Siempre promocionar a reina
      });
    } catch (e) {
      // Movimiento ilegal
      console.log(`❌ Movimiento ilegal: ${desde} → ${hasta}`);
      return;
    }

    // Si llegamos aquí, el movimiento es LEGAL
    if (movimiento) {
      console.log(`✅ Movimiento válido: ${movimiento.san} (${desde} → ${hasta})`);

      // Actualizar la posición del tablero
      this.tablero.posicion$.next(this.chess.fen());

      // Actualizar historial de movimientos
      this.actualizarHistorial();

      // Datos para guardar en base de datos (futuro)
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

      console.log('📦 Datos para guardar en BD:', datosParaBD);
    }
  }

  /**
   * Actualiza el historial de movimientos en el panel
   */
  actualizarHistorial() {
    const historial = this.chess.history();
    this.panel.actualizarHistorial(historial);
  }
}

// Auto-registrar el componente cuando se importa
// Esto permite usarlo en SPA routing sin problemas
if (!customElements.get('app-ajedrez')) {
  customElements.define('app-ajedrez', AppAjedrez);
}

export { AppAjedrez };
