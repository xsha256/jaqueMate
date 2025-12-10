/**
 * Registro de WebComponents, hemos creado este archivo en vez de hacerlo en main
 * 
 * Este archivo importa y registra todos los WebComponents que hay en todo el prioyecto.
 * Se importa una sola vez en main.js para mantener la aplicación limpia
 * y evitar conflictos de merge. Porque si surgen problemas en el merge, no serán faciles de solucionar.
 * Mejor evitarlos directamente.
 */

///////// Importar componentes ////////////// 
import { GameHeader } from './components/menu/GameHeader.js';
import { GameFooter } from './components/footer/GameFooter.js';
//import { GameHome } from './components/home/GameHome.js';

// Componentes pendientes (se añadirán cuando se creen)
// import { GameBoard } from './components/board/GameBoard.js';
// import { GameMoves } from './components/moves/GameMoves.js';
// import { GameLogin } from './components/auth/GameLogin.js';
// import { GameRegister } from './components/auth/GameRegister.js';

///////// Registrar WebComponents //////////// 
customElements.define('game-header', GameHeader);
customElements.define('game-footer', GameFooter);
//customElements.define('game-home', GameHome);

///////////// Registrar componentes pendientes (descomentar cuando se creen) ///////////////////////////////
// customElements.define('game-board', GameBoard);
// customElements.define('game-moves', GameMoves);
// customElements.define('game-login', GameLogin);
// customElements.define('game-register', GameRegister);
