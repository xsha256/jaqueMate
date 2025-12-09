// Este archivo importa y registra los componentes principales
// Para SPA: cada componente importa sus propias dependencias
import './style.css';
import { AppAjedrez } from './components/app-ajedrez/app-ajedrez.js';
// Cuando agregues el router, importa aquí las vistas principales
// import { OtraVista } from './components/otra-vista/otra-vista.js';

customElements.define('app-ajedrez', AppAjedrez);
// customElements.define('otra-vista', OtraVista);
