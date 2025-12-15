import style from './GameHeader.css?inline';
import { obtenerUsuarioId, limpiarUsuarioId, estaAutenticado } from '../../services/api.service.js';

class GameHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.refreshHeader();
        
        // Escuchar cambios en el storage
        window.addEventListener('storage', () => {
            this.refreshHeader();
        });

        // Escuchar eventos en la misma pestaña
        window.addEventListener('authStateChanged', () => {
            this.refreshHeader();
        });
    }

    render() {
        const estaAutenticadoUser = estaAutenticado();
        const template = document.createElement('template');
        
        // Construir HTML dinámicamente dependiendo de la autenticación
        let botonesIzquierda = `
            <a href="#home" class="nav-btn logo">JaqueMate</a>
        `;
        
        if (estaAutenticadoUser) {
            botonesIzquierda += `
                <a href="#game" class="nav-btn" id="botonJuego">Juego</a>
                <a href="#moves" class="nav-btn" id="botonListaJugadas">Lista Jugadas</a>
            `;
        }
        
        let botonesDerechos = '';
        if (estaAutenticadoUser) {
            botonesDerechos = `
                <a href="#profile" class="nav-btn" id="botonPerfil">Perfil</a>
                <button class="nav-btn logout-btn" id="botonLogout">Logout</button>
            `;
        } else {
            botonesDerechos = `
                <a href="#login" class="nav-btn" id="loginLink">Login</a>
                <a href="#register" class="nav-btn" id="registerLink">Registro</a>
            `;
        }
        
        template.innerHTML = `
            <style>${style}</style> 
            <header>
                <nav>
                    <div class="nav-left">
                        ${botonesIzquierda}
                    </div>
                    <div class="nav-right">
                        ${botonesDerechos}
                    </div>
                </nav>
            </header>
        `;

        // Limpiar shadowRoot antes de poner nuevo contenido
        this.shadowRoot.innerHTML = '';
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

        // Evento para botón logout (solo si existe)
        const logoutBtn = this.shadowRoot.querySelector('#botonLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
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
        // Eliminar ID de usuario
        limpiarUsuarioId();
        
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
        // Simplemente vuelve a renderizar para actualizar los botones según el estado de autenticación
        this.render();
    }
}

export { GameHeader };
