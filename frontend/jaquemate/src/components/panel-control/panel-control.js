/**
 * Componente Web: Panel de Control del Ajedrez
 *
 * Panel lateral desplegable que muestra:
 * - Historial de movimientos
 * - Se puede abrir/cerrar con un botón
 */
class PanelControl extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <style>
        :host {
          display: contents;
        }

        /* Panel lateral de movimientos */
        .moves-panel {
          background-color: #2d2d2d;
          width: 0;
          overflow: hidden;
          border-radius: 10px;
          border: 1px solid #404040;
          transition: all 0.3s ease;
          opacity: 0;
        }

        .moves-panel.open {
          width: 300px;
          opacity: 1;
          padding: 1.5rem;
        }

        .moves-panel h3 {
          color: #c41e3a;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .moves-list {
          list-style: none;
          max-height: 400px;
          overflow-y: auto;
          padding: 0;
          margin: 0;
        }

        .moves-list li {
          padding: 0.8rem;
          margin-bottom: 0.5rem;
          background-color: #3a3a3a;
          border-radius: 5px;
          font-family: 'Roboto Mono', 'Courier New', monospace;
          color: #b0b0b0;
          border: 1px solid #505050;
        }

        .moves-list li:hover {
          background-color: #c41e3a;
          color: #e0e0e0;
          cursor: pointer;
          border-color: #c41e3a;
        }

        /* Barra scroll para la lista de jugadas */
        .moves-list::-webkit-scrollbar {
          width: 8px;
        }

        .moves-list::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 4px;
        }

        .moves-list::-webkit-scrollbar-thumb {
          background: #505050;
          border-radius: 4px;
        }

        .moves-list::-webkit-scrollbar-thumb:hover {
          background: #c41e3a;
        }

        /* Botón para toggle */
        .toggle-moves {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background-color: #2d2d2d;
          border: 1px solid #404040;
          padding: 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1.5rem;
          transition: all 0.3s ease;
          z-index: 10;
          color: #e0e0e0;
        }

        .toggle-moves:hover {
          background-color: #c41e3a;
          border-color: #c41e3a;
          transform: translateY(-50%) scale(1.1);
        }

        .empty-message {
          color: #b0b0b0;
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }
      </style>

      <!-- Botón para desplegar/recoger el panel -->
      <button class="toggle-moves" aria-label="Toggle moves panel">
        📜
      </button>

      <!-- Panel de movimientos -->
      <div class="moves-panel">
        <h3>Movimientos</h3>
        <ul class="moves-list">
          <li class="empty-message">No hay movimientos todavía...</li>
        </ul>
      </div>
    `;
  }

  setupEventListeners() {
    const toggleButton = this.querySelector('.toggle-moves');
    const movesPanel = this.querySelector('.moves-panel');

    toggleButton.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      movesPanel.classList.toggle('open');

      // Emitir evento para que el componente padre pueda ajustar el layout
      this.dispatchEvent(new CustomEvent('panel-toggle', {
        detail: { isOpen: this.isOpen },
        bubbles: true,
        composed: true
      }));
    });
  }

  /**
   * Actualiza el historial de movimientos
   */
  actualizarHistorial(movimientos) {
    const movesList = this.querySelector('.moves-list');

    if (movimientos.length > 0) {
      movesList.innerHTML = movimientos
        .map((mov, idx) => {
          const moveNumber = Math.floor(idx / 2) + 1;
          const isWhite = idx % 2 === 0;
          const prefix = isWhite ? `${moveNumber}.` : `${moveNumber}...`;
          return `<li>${prefix} ${mov}</li>`;
        })
        .join('');

      // Auto-scroll al último movimiento
      movesList.scrollTop = movesList.scrollHeight;
    } else {
      movesList.innerHTML = '<li class="empty-message">No hay movimientos todavía...</li>';
    }
  }

  /**
   * Abre el panel
   */
  abrir() {
    if (!this.isOpen) {
      this.querySelector('.toggle-moves').click();
    }
  }

  /**
   * Cierra el panel
   */
  cerrar() {
    if (this.isOpen) {
      this.querySelector('.toggle-moves').click();
    }
  }
}

// Auto-registrar el componente cuando se importa
// Esto permite usarlo en SPA routing sin problemas
if (!customElements.get('panel-control')) {
  customElements.define('panel-control', PanelControl);
}

export { PanelControl };
