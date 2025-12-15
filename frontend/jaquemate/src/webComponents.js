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
import "./components/promotion-dialog/promotion-dialog.js";

// WebComponents
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
