/* GameHeader - WebComponent para el Header de JaqueMate*/
import style from './GameHeader.css?inline';

class GameHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.refreshHeader();
        
        // Escuchar cambios en el almacenamiento (otra pestaña)
        window.addEventListener('storage', () => {
            this.refreshHeader();
        });

        // Escuchar eventos personalizados (misma pestaña)
        window.addEventListener('authStateChanged', () => {
            this.refreshHeader();
        });
    }

    render() {
        const template = document.createElement('template'); 
        template.innerHTML = `
            <style>${style}</style> 
            <header>
                <nav>
                    <div class="nav-left">
                        <a href="#home" class="nav-btn logo">JaqueMate</a>
                        <a href="#game" class="nav-btn" id="botonJuego" hidden>Juego</a>
                    </div>
                    <div class="nav-right">
                        <a href="#login" class="nav-btn" id="loginLink">Login</a>
                        <a href="#register" class="nav-btn" id="registerLink">Registro</a>
                        <button class="nav-btn logout-btn" id="botonLogout" hidden>Logout</button>
                    </div>
                </nav>
            </header>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Eventos de navegación para enlaces
        const links = this.shadowRoot.querySelectorAll('a.nav-btn');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e);
            });
        });

        // Evento para botón logout
        const logoutBtn = this.shadowRoot.querySelector('#botonLogout');
        logoutBtn.addEventListener('click', () => {
            this.handleLogout();
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

    handleLogout() {
        // Eliminar token
        localStorage.removeItem('access_token');
        
        // Disparar evento personalizado
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Navegar a login
        const navigationEvent = new CustomEvent('navigate', {
            detail: { route: '#login' },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(navigationEvent);
        
        // Refrescar header
        this.refreshHeader();
    }

    refreshHeader() {
        const token = localStorage.getItem('access_token');
        
        const botonJuego = this.shadowRoot.querySelector('#botonJuego');
        const botonLogout = this.shadowRoot.querySelector('#botonLogout');
        const loginLink = this.shadowRoot.querySelector('#loginLink');
        const registerLink = this.shadowRoot.querySelector('#registerLink');

        if (token) {
            // Usuario logeado
            botonLogout.removeAttribute('hidden');
            botonJuego.removeAttribute('hidden');
            loginLink.parentElement.style.display = 'none';
            registerLink.parentElement.style.display = 'none';
        } else {
            // Usuario NO logeado
            botonJuego.setAttribute('hidden', true);
            botonLogout.setAttribute('hidden', true);
            loginLink.parentElement.style.display = 'block';
            registerLink.parentElement.style.display = 'block';
        }
    }
}

export { GameHeader };
