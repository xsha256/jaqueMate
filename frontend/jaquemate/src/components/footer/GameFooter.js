/**
 * GameFooter - WebComponent para el Footer de JaqueMate
 * 
 * Componente que renderiza el footer con información de participantes
 */

import style from './GameFooter.css?inline';

class GameFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <footer>
                <p>Participantes: Richart Rubio, Moha Amri, Patryk Kowalik, Yordan Radkov | DAW 2025</p>
            </footer>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

export { GameFooter };
