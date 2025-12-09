/* GameHeader - WebComponent para el Header de JaqueMate*/

class GameHeader extends HTMLElement {
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
            <link rel="stylesheet" href="./GameHeader.css">
            <header>
                <nav>
                    <div class="nav-left">
                        <a href="#home" class="nav-btn logo">JaqueMate</a>
                        <a href="#game" class="nav-btn">Juego</a>
                    </div>
                    <div class="nav-right">
                        <a href="#login" class="nav-btn">Login</a>
                        <a href="#register" class="nav-btn">Registro</a>
                    </div>
                </nav>
            </header>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.attachEventListeners();
    }

    attachEventListeners() {
        const links = this.shadowRoot.querySelectorAll('a.nav-btn');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e);
            });
        });
    }

    handleNavigation(event) {
        event.preventDefault();
        const href = event.target.getAttribute('href');
        
        // Disparar evento personalizado para que el router maneje la navegación
        const navigationEvent = new CustomEvent('navigate', {
            detail: { route: href },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(navigationEvent);
    }


}

// Registrar el WebComponent
customElements.define('game-header', GameHeader);

export { GameHeader };
