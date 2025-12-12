import './panel-control.css';

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
      <button class="toggle-moves" aria-label="Toggle moves panel">
        📜
      </button>
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

      this.dispatchEvent(new CustomEvent('panel-toggle', {
        detail: { isOpen: this.isOpen },
        bubbles: true,
        composed: true
      }));
    });
  }

  actualizarHistorial(movimientos) {
    const movesList = this.querySelector('.moves-list');

    if (movimientos.length > 0) {
      movesList.innerHTML = movimientos
        .map((mov, idx) => {
          const moveNumber = Math.floor(idx / 2) + 1;
          const isWhite = idx % 2 === 0;
          const colorIcon = isWhite
            ? '<span class="color-indicator white"></span>'
            : '<span class="color-indicator black"></span>';
          return `<li>${moveNumber}. ${colorIcon} ${mov}</li>`;
        })
        .join('');

      movesList.scrollTop = movesList.scrollHeight;
    } else {
      movesList.innerHTML = '<li class="empty-message">No hay movimientos todavía...</li>';
    }
  }

  abrir() {
    if (!this.isOpen) {
      this.querySelector('.toggle-moves').click();
    }
  }

  cerrar() {
    if (this.isOpen) {
      this.querySelector('.toggle-moves').click();
    }
  }
}

export { PanelControl };
