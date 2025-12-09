/**
 * Registro centralizado de WebComponents
 * 
 * Este archivo importa y registra todos los WebComponents de la aplicación.
 * Se importa una sola vez en main.js para mantener la aplicación limpia
 * y evitar conflictos de merge.
 */

// Importar componentes
import { GameHeader } from './components/menu/GameHeader.js';
import { GameFooter } from './components/footer/GameFooter.js';

// Componentes pendientes (se añadirán cuando se creen)
// import { GameHome } from './components/home/GameHome.js';
// import { GameBoard } from './components/board/GameBoard.js';
// import { GameLogin } from './components/auth/GameLogin.js';
// import { GameRegister } from './components/auth/GameRegister.js';

// Registrar WebComponents
customElements.define('game-header', GameHeader);
customElements.define('game-footer', GameFooter);

// Registrar componentes pendientes (descomentar cuando se creen)
// customElements.define('game-home', GameHome);
// customElements.define('game-board', GameBoard);
// customElements.define('game-login', GameLogin);
// customElements.define('game-register', GameRegister);
