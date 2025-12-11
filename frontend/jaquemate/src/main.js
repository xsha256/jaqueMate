import './style.css';
import { AppAjedrez } from './components/app-ajedrez/app-ajedrez.js';

if (!customElements.get('app-ajedrez')) {
  customElements.define('app-ajedrez', AppAjedrez);
}
