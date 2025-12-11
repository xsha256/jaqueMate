/**
 * Registro de WebComponents, hemos creado este archivo en vez de hacerlo en main
 *
 * Este archivo importa y registra todos los WebComponents que hay en todo el prioyecto.
 * Se importa una sola vez en main.js para mantener la aplicación limpia
 * y evitar conflictos de merge. Porque si surgen problemas en el merge, no serán faciles de solucionar.
 * Mejor evitarlos directamente.
 */

///////// Importar componentes //////////////
import { AppAjedrez } from "./components/app-ajedrez/app-ajedrez.js";
import { GameFooter } from "./components/footer/GameFooter.js";
import { GameHome } from "./components/home/home.js";
import { GameMoves } from "./components/listaJugadas/GameMoves.js";
import { GameLogin } from "./components/login/GameLogin.js";
import { GameHeader } from "./components/menu/GameHeader.js";
import { PanelControl } from "./components/panel-control/panel-control.js";
import { GameProfile } from "./components/perfil/GameProfile.js";
import { GameRegister } from "./components/registro/GameRegister.js";
import { TableroAjedrez } from "./components/tablero-ajedrez/tablero-ajedrez.js";

///////// Registrar WebComponents ////////////
customElements.define("game-header", GameHeader);
customElements.define("game-footer", GameFooter);
customElements.define("game-moves", GameMoves);
customElements.define("game-home", GameHome);
customElements.define("game-profile", GameProfile);
customElements.define("game-login", GameLogin);
customElements.define("game-register", GameRegister);
customElements.define("app-ajedrez", AppAjedrez);
customElements.define("panel-control", PanelControl);
customElements.define("tablero-ajedrez", TableroAjedrez);
