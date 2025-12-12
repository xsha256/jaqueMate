/* GameLogin */

//Es un WebComponent para el formulario de login

import style from './GameLogin.css?inline';
import { loginUsuario, guardarUsuarioId } from '../../services/api.service.js';

class GameLogin extends HTMLElement {
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
            <div class="form-container">
                <h1>Iniciar Sesión</h1>
                
                <form id="loginForm">
                    <div class="form-group">
                        <label for="usuario">Usuario</label>
                        <input type="text" id="usuario" name="usuario" placeholder="Tu usuario" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
                    </div>

                    <button type="submit" class="submit-btn">Entrar</button>
                </form>

                <div class="form-footer">
                    <p>¿No tienes cuenta? <a href="#register">Regístrate aquí</a></p>
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attachEventListeners() {
        const form = this.shadowRoot.querySelector('#loginForm');
        const registerLink = this.shadowRoot.querySelector('a[href="#register"]');

        // Envío del formulario
        form.addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        // Navegación a registro
        registerLink.addEventListener('click', (e) => {
            this.handleNavigation(e);
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const usuario = this.shadowRoot.querySelector('#usuario').value;
        const password = this.shadowRoot.querySelector('#password').value;

        // Validar campos
        if (!usuario || !password) {
            alert('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await loginUsuario({ usuario, password });
            
            // Verificar si el login fue exitoso
            if (response.message === 'Login exitoso' && response.usuario && response.usuario.id) {
                // Guardar ID del usuario en localStorage
                guardarUsuarioId(response.usuario.id);
                
                // Disparar evento de cambio de estado de autenticación
                window.dispatchEvent(new Event('authStateChanged'));
                
                alert('¡Bienvenido!');
                
                // Navegar a home o game
                const navigationEvent = new CustomEvent('navigate', {
                    detail: { route: '#home' },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(navigationEvent);
            } else {
                alert('Error en el login. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert(`Error: ${error.message}`);
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
}

export { GameLogin };
