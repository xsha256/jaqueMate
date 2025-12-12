/*GameRegister*/
//Es un webcomponent para el formulario de registro

import style from './GameRegister.css?inline';
import { registrarUsuario, guardarUsuarioId } from '../../services/api.service.js';

class GameRegister extends HTMLElement {
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
                <h1>Crear Cuenta</h1>
                
                <form id="registerForm">
                    <div class="form-group">
                        <label for="usuario">Usuario</label>
                        <input type="text" id="usuario" name="usuario" placeholder="Tu usuario" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="tu@email.com" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirmar Contraseña</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required>
                    </div>

                    <button type="submit" class="submit-btn">Registrarse</button>
                </form>

                <div class="form-footer">
                    <p>¿Ya tienes cuenta? <a href="#login">Inicia sesión aquí</a></p>
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attachEventListeners() {
        const form = this.shadowRoot.querySelector('#registerForm');
        const loginLink = this.shadowRoot.querySelector('a[href="#login"]');

        // Envío del formulario
        form.addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        // Navegación a login
        loginLink.addEventListener('click', (e) => {
            this.handleNavigation(e);
        });
    }

    handleRegister(event) {
        event.preventDefault();

        const usuario = this.shadowRoot.querySelector('#usuario').value;
        const email = this.shadowRoot.querySelector('#email').value;
        const password = this.shadowRoot.querySelector('#password').value;
        const confirmPassword = this.shadowRoot.querySelector('#confirmPassword').value;

        // Validar campos
        if (!usuario || !email || !password || !confirmPassword) {
            this.showNotification('Error', 'Todos los campos son obligatorios', 'error');
            return;
        }

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            this.showNotification('Error', 'Las contraseñas no coinciden', 'error');
            return;
        }

        // Validar longitud mínima
        if (password.length < 6) {
            this.showNotification('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        this.performRegister(usuario, email, password);
    }

    async performRegister(usuario, email, password) {
        try {
            const response = await registrarUsuario({ usuario, email, password });

            // Verificar si el registro fue exitoso
            // La respuesta puede tener diferentes estructuras, verificamos todas las posibilidades
            const registroExitoso = response && (
                (response.usuario && response.usuario.id) || // Formato: {usuario: {id: ...}}
                response.id || // Formato directo: {id: ...}
                (response.message && response.message.toLowerCase().includes('exitoso')) // Por mensaje
            );

            if (registroExitoso) {
                // Mostrar notificación de éxito
                this.showNotification('¡Registro exitoso!', 'Ahora puedes iniciar sesión con tus credenciales', 'success');

                // Redirigir a login después de un breve delay
                setTimeout(() => {
                    const navigationEvent = new CustomEvent('navigate', {
                        detail: { route: '#login' },
                        bubbles: true,
                        composed: true
                    });
                    this.dispatchEvent(navigationEvent);
                }, 2000);
            } else {
                this.showNotification('Error', 'No se pudo completar el registro. Intenta de nuevo.', 'error');
            }
        } catch (error) {
            console.error('Error al registrarse:', error);

            // Mostrar mensaje de error específico
            if (error.message.includes('409') || error.message.includes('duplicado') || error.message.includes('ya existe')) {
                this.showNotification('Usuario duplicado', 'El usuario o email ya está registrado. Intenta con otro.', 'error');
            } else {
                this.showNotification('Error', error.message || 'Ocurrió un error al registrar el usuario', 'error');
            }
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

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

export { GameRegister };
