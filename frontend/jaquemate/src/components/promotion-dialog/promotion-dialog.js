class PromotionDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: "open",
    });
    this.promotionChoice = null;
    this.move = null;
    this.color = "w";
  }

  connectedCallback() {
    this.render();
    this.shadowRoot
      .querySelector(".close-button")
      .addEventListener("click", () => {
        this.style.display = "none";
        this.dispatchEvent(
          new CustomEvent("promotion-cancelled", {
            bubbles: true,
            composed: true,
          })
        );
      });

    this.shadowRoot.querySelectorAll(".promotion-piece").forEach((piece) => {
      piece.addEventListener("click", (event) => {
        this.promotionChoice = event.currentTarget.dataset.piece;
        this.handlePromotion();
      });
    });
  }

  setMove(move) {
    this.move = move;
  }

  handlePromotion() {
    if (this.promotionChoice && this.move) {
      const moveWithPromotion = {
        ...this.move,
        promotion: this.promotionChoice.toLowerCase(),
      };
      this.dispatchEvent(
        new CustomEvent("promotion-selected", {
          detail: moveWithPromotion,
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  render() {
    this.shadowRoot.innerHTML = this.getTemplate();
  }

  getTemplate() {
    return `
    <style>
      :host {
        --color-bg-secondary: #2d2d2d;
        --color-bg-dark: #1f1f1f;
        --color-text-primary: #e0e0e0;
        --color-text-secondary: #b0b0b0;
        --color-text-red: #c41e3a;
        --color-border: #404040;
        
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .dialog {
        background-color: var(--color-bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--color-border);
        text-align: center;
        position: relative;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      }

      h3 {
        color: var(--color-text-primary);
        font-size: 1.5rem;
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .promotion-pieces {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        justify-content: center;
      }

      .promotion-piece {
        background-color: var(--color-bg-dark);
        border: 2px solid var(--color-border);
        border-radius: 8px;
        transition: all 0.2s ease-in-out;
      }
      
      .promotion-piece:hover {
        transform: translateY(-5px);
        border-color: var(--color-text-red);
      }

      .promotion-piece img {
        width: 70px;
        height: 70px;
        display: block;
      }

      .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        cursor: pointer;
        font-size: 2rem;
        color: var(--color-text-secondary);
        transition: color 0.2s ease-in-out;
      }
      
      .close-button:hover {
        color: var(--color-text-primary);
      }
    </style>
    <div class="dialog">
      <span class="close-button">&times;</span>
      <h3>Elige una pieza para la promoción</h3>
      <div class="promotion-pieces">
        <div class="promotion-piece" data-piece="q">
          <img src="https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}Q.png" alt="Queen" data-piece="q">
        </div>
        <div class="promotion-piece" data-piece="r">
          <img src="https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}R.png" alt="Rook" data-piece="r">
        </div>
        <div class="promotion-piece" data-piece="b">
          <img src="https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}B.png" alt="Bishop" data-piece="b">
        </div>
        <div class="promotion-piece" data-piece="n">
          <img src="https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}N.png" alt="Knight" data-piece="n">
        </div>
      </div>
    </div>
    `;
  }

  open(move, color) {
    this.color = color;
    this.shadowRoot.querySelector(
      '[data-piece="q"] img'
    ).src = `https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}Q.png`;
    this.shadowRoot.querySelector(
      '[data-piece="r"] img'
    ).src = `https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}R.png`;
    this.shadowRoot.querySelector(
      '[data-piece="b"] img'
    ).src = `https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}B.png`;
    this.shadowRoot.querySelector(
      '[data-piece="n"] img'
    ).src = `https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}N.png`;
    this.setMove(move);
    this.style.display = "flex";
  }

  close() {
    this.style.display = "none";
  }
}

window.customElements.define("promotion-dialog", PromotionDialog);
