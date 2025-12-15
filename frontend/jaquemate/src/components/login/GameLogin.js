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
            this.showNotification('Error', 'Todos los campos son obligatorios', 'error');
            return;
        }

        try {
            const response = await loginUsuario({ usuario, password });

            // Verificar login
            const loginExitoso = response && (
                (response.usuario && response.usuario.id) || response.id || 
                (response.message && response.message.toLowerCase().includes('exitoso')) // Por cada mensaje
            );

            if (loginExitoso) {
                // Guardar ID del usuario en localStorage
                const usuarioId = response.usuario?.id || response.id;
                if (usuarioId) {
                    guardarUsuarioId(usuarioId);
                }
                
                window.dispatchEvent(new Event('authStateChanged'));

                // Mostrar notificación de completado
                this.showNotification('¡Bienvenido!', 'Has iniciado sesión correctamente', 'success');

                // Volver a home
                setTimeout(() => {
                    const navigationEvent = new CustomEvent('navigate', {
                        detail: { route: '#home' },
                        bubbles: true,
                        composed: true
                    });
                    this.dispatchEvent(navigationEvent);
                }, 1500);
            } else {
                this.showNotification('Error', 'No se pudo iniciar sesión. Verifica tus credenciales.', 'error');
            }
        } catch (error) {

            // Mostrar mensaje de error
            if (error.message.includes('401') || error.message.includes('inválidas') || error.message.includes('Credenciales')) {
                this.showNotification('Credenciales incorrectas', 'Usuario o contraseña incorrectos', 'error');
            } else {
                this.showNotification('Error', error.message || 'Ocurrió un error al iniciar sesión', 'error');
            }
        }
    }

    handleNavigation(event) {
        event.preventDefault();
        const href = event.target.getAttribute('href');

        // Evento personalizado para que el router maneje la navegación
        const navigationEvent = new CustomEvent('navigate', {
            detail: { route: href },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(navigationEvent);
    }

    showNotification(title, message, type = 'success') {
        // Eliminar notificación existente si hay alguna
        const existingNotification = this.shadowRoot.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear contenedor de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Icono según el tipo
        const icon = type === 'success' ? '✓' : '✕';

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        // Agregar al shadow DOM
        this.shadowRoot.appendChild(notification);

        // Quitar después de 4 segundos
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

export { GameLogin };
