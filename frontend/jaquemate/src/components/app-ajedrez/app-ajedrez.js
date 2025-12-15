import { Chess } from "chess.js";
import { crearJugada, obtenerUsuarioId } from "../../services/api.service.js";
import "../panel-control/panel-control.js";
import "../tablero-ajedrez/tablero-ajedrez.js";
import "./app-ajedrez.css";

class AppAjedrez extends HTMLElement {
  constructor() {
    super();
    this.chess = new Chess();
  }

  connectedCallback() {
    this.render();
    this.setupReferences();
    this.setupEventListeners();
    this.cargarPosicionDesdeURL();

    //Escuchar cambios
    this.hashChangeHandler = () => {
      if (
        window.location.hash === "#game" ||
        window.location.hash.startsWith("#game?")
      ) {
        this.cargarPosicionDesdeURL();
      }
    };
    window.addEventListener("hashchange", this.hashChangeHandler);
  }

  disconnectedCallback() {
    if (this.hashChangeHandler) {
      window.removeEventListener("hashchange", this.hashChangeHandler);
    }
  }

  cargarPosicionDesdeURL() {
    // Leer parámetros FEN y PGN si existen en la URL
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const fen = params.get("fen");
    const pgn = params.get("pgn");

    if (fen) {
      const fenDecodificado = decodeURIComponent(fen);

      // Intentar cargar desde el pgn si existe
      if (pgn && pgn.trim() !== "") {
        try {
          this.chess.loadPgn(decodeURIComponent(pgn));
          this.tablero.posicion$.next(this.chess.fen());

          // Limpiar el historial para que empiece desde esta posición
          this.panel.actualizarHistorial([], true);
          return;
        } catch (e) {
          console.error("Error al cargar PGN, intentando con FEN:", e);
        }
      }

      // Si no hay pgn cargar  desde fen
      try {
        this.chess.load(fenDecodificado);
        this.tablero.posicion$.next(this.chess.fen());

        // Limpiar el historial
        this.panel.actualizarHistorial([], true);
      } catch (e) {
        console.error("Error al cargar FEN:", e);
        // Si hay error mantener posición inicial
        this.chess.reset();
        this.tablero.posicion$.next(this.chess.fen());
        this.actualizarHistorial();
      }
    } else {
      // Si no hay fen reiniciar el tablero
      this.chess.reset();
      this.tablero.posicion$.next(this.chess.fen());
      this.actualizarHistorial();
    }
  }

  render() {
    this.innerHTML = `
      <main>
        <div class="game-container">
          <div class="board-wrapper">
            <tablero-ajedrez id="tablero"></tablero-ajedrez>
            <button id="btn-reiniciar" class="btn-reset">Reiniciar Juego</button>
          </div>
          <panel-control id="panel"></panel-control>
        </div>
        <div id="modal-fin-juego" class="modal-overlay" style="display: none;">
          <div class="modal-content">
            <div class="modal-icon" id="modal-icon"></div>
            <h2 id="modal-titulo"></h2>
            <p id="modal-mensaje"></p>
            <button id="btn-nueva-partida" class="btn-primary">Nueva Partida</button>
          </div>
        </div>
        <promotion-dialog id="promotion-dialog"></promotion-dialog>
      </main>
    `;
  }

  setupReferences() {
    this.tablero = this.querySelector("#tablero");
    this.panel = this.querySelector("#panel");
    this.modal = this.querySelector("#modal-fin-juego");
    this.modalTitulo = this.querySelector("#modal-titulo");
    this.modalMensaje = this.querySelector("#modal-mensaje");
    this.modalIcon = this.querySelector("#modal-icon");
    this.btnNuevaPartida = this.querySelector("#btn-nueva-partida");
    this.btnReiniciar = this.querySelector("#btn-reiniciar");
    this.promotionDialog = this.querySelector("#promotion-dialog");
  }

  setupEventListeners() {
    this.tablero.addEventListener("intento-movimiento", (evento) => {
      this.manejarIntentoMovimiento(evento.detail);
    });

    this.promotionDialog.addEventListener("promotion-selected", (evento) => {
      this.promotionDialog.close();
      // El movimiento ya incluye la promoción seleccionada
      this.manejarIntentoMovimiento(evento.detail);
    });

    this.promotionDialog.addEventListener("promotion-cancelled", () => {
      // Restaurar la posición actual para cancelar el movimiento
      this.tablero.posicion$.next(this.chess.fen());
    });

    this.btnNuevaPartida.addEventListener("click", () => {
      this.cerrarModal();
      this.reiniciarPartida();
    });

    this.btnReiniciar.addEventListener("click", () => {
      this.reiniciarPartida();
    });

    // Escuchar evento de Lista Jugadas
    document.addEventListener("moveSelected", (evento) => {
      const { fen } = evento.detail;
      // Actualizar la posición del tablero
      this.tablero.posicion$.next(fen);
    });
  }

  async manejarIntentoMovimiento(detalle) {
    const { from, to, promotion } = detalle;

    let movimiento;
    try {
      movimiento = this.chess.move({
        from,
        to,
        promotion,
      });
    } catch (e) {
      return;
    }

    if (movimiento) {
      this.tablero.posicion$.next(this.chess.fen());
      this.actualizarHistorial();

      // Guardar jugada en el backend
      const jugadaData = {
        usuarioId: obtenerUsuarioId(), // usuario logueadp
        fen: this.chess.fen(),
        moveUciFrom: from,
        moveUciTo: to,
        moveSan: movimiento.san,
        pgn: this.chess.pgn(),
      };

      try {
        await crearJugada(jugadaData);
      } catch (error) {
        console.error("Error al guardar jugada:", error);
      }

      setTimeout(() => {
        this.verificarFinDeJuego();
      }, 250);
    }
  }

  actualizarHistorial() {
    const historial = this.chess.history({ verbose: true });
    const historialUCI = historial.map(
      (mov) => `${mov.from}${mov.to}${mov.promotion || ""}`
    );

    // Determinar el color del primer movimiento del historial
    // Si no hay historial empieza con blancas
    const primerMovimientoBlancas =
      historial.length === 0 || historial[0].color === "w";

    this.panel.actualizarHistorial(historialUCI, primerMovimientoBlancas);
  }

  verificarFinDeJuego() {
    if (this.chess.isCheckmate()) {
      const ganador = this.chess.turn() === "w" ? "Negras" : "Blancas";
      setTimeout(() => {
        this.mostrarModal(
          "¡Jaque Mate!",
          `${ganador} ganan la partida`,
          "victoria"
        );
      }, 100);
    } else if (this.chess.isDraw()) {
      let razon = "Tablas";
      if (this.chess.isStalemate()) {
        razon = "Ahogado (Stalemate)";
      } else if (this.chess.isThreefoldRepetition()) {
        razon = "Triple repetición";
      } else if (this.chess.isInsufficientMaterial()) {
        razon = "Material insuficiente";
      }
      setTimeout(() => {
        this.mostrarModal("Empate", razon, "empate");
      }, 300);
    } else if (this.chess.isCheck()) {
      const jugadorEnJaque = this.chess.turn() === "w" ? "Blancas" : "Negras";
    }
  }

  mostrarModal(titulo, mensaje, tipo) {
    this.modalTitulo.textContent = titulo;
    this.modalMensaje.textContent = mensaje;

    // Configurar el icono según el tipo
    this.modalIcon.className = "modal-icon";
    if (tipo === "victoria") {
      this.modalIcon.classList.add("icon-victoria");
      this.modalIcon.textContent = "👑";
    } else if (tipo === "empate") {
      this.modalIcon.classList.add("icon-empate");
      this.modalIcon.textContent = "🤝";
    }

    this.modal.style.display = "flex";
  }

  cerrarModal() {
    this.modal.style.display = "none";
  }

  reiniciarPartida() {
    // Limpiar la URL
    window.location.hash = "#game";

    this.chess.reset();
    this.tablero.posicion$.next(this.chess.fen());
    this.actualizarHistorial();
  }
}

export { AppAjedrez };
