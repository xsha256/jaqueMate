import style from './home.css?inline';
import { estaAutenticado } from '../../services/api.service.js';

class GameHome extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <div class="home-container">
                <h1>Bienvenido a JaqueMate</h1>
                <p>
                    JaqueMate es un proyecto de 2º año de DAW. Trata de un juego de ajedrez desarrollado con tecnologías web modernas. 
                    Es una combinación de las asignaturas Desarrollo Web en entorno Cliente (DWEC) y Desarrollo Web en entorno Servidor (DWES).
                </p>
                <p>
                    Este proyecto combina la parte de backend y frontend para generar el ajedrez y darle funcionalidad.
                    Se utilizan las librerías "chess.js" y "chessboard.js" para el apartado del tablero.
                </p>

                <a href="#game" class="cta-button">Comenzar a Jugar</a>

                <div class="participants">
                    <h3>Equipo de Desarrollo</h3>
                    <ul>
                        <li>Richart Rubio - Frontend</li>
                        <li>Yordan Radkov - Frontend</li>
                        <li>Moha Amri - Backend</li>
                        <li>Patryk Kowalik - Backend</li>
                    </ul>
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attachEventListeners() {
        const ctaButton = this.shadowRoot.querySelector('.cta-button');
        ctaButton.addEventListener('click', (e) => {
            this.handleNavigation(e);
        });
    }

    handleNavigation(event) {
        event.preventDefault();
        const href = event.target.getAttribute('href');

        // Verificar si el usuario está autenticado
        if (!estaAutenticado()) {
            // Si no está autenticado, redirigir al login

            const navigationEvent = new CustomEvent('navigate', {
                detail: { route: '#login' },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(navigationEvent);
            return;
        }

        const navigationEvent = new CustomEvent('navigate', {
            detail: { route: href },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(navigationEvent);
    }
}

export { GameHome };
