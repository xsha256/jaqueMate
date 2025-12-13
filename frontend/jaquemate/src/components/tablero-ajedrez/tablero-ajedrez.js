import { Chess } from "chess.js";
import { BehaviorSubject } from "rxjs";
import "./tablero-ajedrez.css";

class TableroAjedrez extends HTMLElement {
  constructor() {
    super();
    this.posicion$ = new BehaviorSubject("start");
    this.board = null;
    this.contenedorTablero = null;
    this.suscripcionPosicion = null;
    this.handleResize = null;
  }

  connectedCallback() {
    if (typeof window.Chessboard === "undefined") {
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
      window.removeEventListener("resize", this.handleResize);
    }
    if (this.board) {
      this.board.destroy();
    }
  }

  static get observedAttributes() {
    return ["posicion-inicial"];
  }

  attributeChangedCallback(nombre, valorAntiguo, valorNuevo) {
    if (nombre === "posicion-inicial" && valorNuevo && this.board) {
      this.posicion$.next(valorNuevo);
    }
  }

  inicializarComponente() {
    this.innerHTML = `
      <div class="contenedor-tablero-wrapper">
        <div id="tablero-chess" class="contenedor-tablero"></div>
      </div>
    `;

    this.contenedorTablero = this.querySelector("#tablero-chess");

    const config = {
      draggable: true,
      position: this.getAttribute("posicion-inicial") || "start",
      pieceTheme:
        "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
      showNotation: true,
      orientation: "white",
      snapbackSpeed: 500,
      snapSpeed: 100,
      onDragStart: this.alEmpezarArrastre.bind(this),
      onDrop: this.alSoltar.bind(this),
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

    window.addEventListener("resize", this.handleResize);
  }

  actualizarPosicion(posicion) {
    if (!this.board) return;

    try {
      this.board.position(posicion);
    } catch (e) {
      console.error("Error al actualizar posición:", e);
    }
  }

  alEmpezarArrastre(source, piece, position, orientation) {
    const chess = new Chess(this.posicion$.getValue());

    // No permitir arrastrar si el juego ha terminado
    if (chess.isGameOver()) {
      return false;
    }

    // Solo permitir arrastrar piezas del turno actual
    const turno = chess.turn();
    const esPiezaDelTurno =
      (turno === "w" && piece.search(/^w/) !== -1) ||
      (turno === "b" && piece.search(/^b/) !== -1);

    return esPiezaDelTurno;
  }

  alSoltar(casillaOrigen, casillaDestino, pieza) {
    console.log("alSoltar llamado:", casillaOrigen, "->", casillaDestino);

    // Si la casilla de destino es la misma que la de origen, no hacer nada
    if (casillaOrigen === casillaDestino) {
      console.log("Misma casilla, retornando vacío");
      return; // Esto permite soltar la pieza en su lugar original
    }

    const chess = new Chess(this.posicion$.getValue());

    // Primero verificar si es un movimiento de promoción
    const esPromocion = this.esMovimientoDePromocion(
      chess,
      casillaOrigen,
      casillaDestino
    );

    // Validar el movimiento (sin modificar el estado real)
    let movimientoTest;
    try {
      movimientoTest = chess.move({
        from: casillaOrigen,
        to: casillaDestino,
        promotion: esPromocion ? "q" : undefined,
      });
    } catch (e) {
      // Movimiento ilegal - chess.js lanza excepción
      console.log("Movimiento ILEGAL (excepción), retornando snapback");
      return "snapback";
    }

    if (!movimientoTest) {
      // Movimiento ilegal
      console.log("Movimiento ILEGAL, retornando snapback");
      return "snapback";
    }

    console.log("Movimiento válido:", movimientoTest);

    if (esPromocion) {
      console.log("Es promoción, abriendo diálogo");
      const promotionDialog = document.querySelector("promotion-dialog");
      if (promotionDialog) {
        promotionDialog.open(
          {
            from: casillaOrigen,
            to: casillaDestino,
          },
          pieza[0]
        );
      }
      return "snapback"; // Snapback hasta que se seleccione la pieza
    }

    // Movimiento normal válido - disparar evento
    // NO devolver snapback para que la pieza se quede en su lugar
    console.log("Disparando evento intento-movimiento");
    const eventoMovimiento = new CustomEvent("intento-movimiento", {
      detail: {
        from: casillaOrigen,
        to: casillaDestino,
        pieza,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(eventoMovimiento);
    // No devolver nada - la pieza se queda en la nueva posición
  }

  esMovimientoDePromocion(chess, from, to) {
    const piece = chess.get(from);
    if (!piece || piece.type !== "p") return false;

    const rank = to[1];
    const isWhitePawn = piece.color === "w";
    const isBlackPawn = piece.color === "b";

    if (isWhitePawn && rank === "8") return true;
    if (isBlackPawn && rank === "1") return true;

    return false;
  }

  obtenerPosicionActual() {
    if (!this.board) return "start";

    const posicion = this.board.position();

    try {
      const chess = new Chess();
      chess.clear();

      for (const casilla in posicion) {
        const pieza = posicion[casilla];
        const color = pieza[0] === "w" ? "w" : "b";
        const tipo = pieza[1].toLowerCase();
        chess.put({ type: tipo, color: color }, casilla);
      }

      return chess.fen();
    } catch (e) {
      console.error("Error al obtener FEN:", e);
      return "start";
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

export { TableroAjedrez };
