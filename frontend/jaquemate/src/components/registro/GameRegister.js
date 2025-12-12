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
            alert('Todos los campos son obligatorios');
            return;
        }

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Validar longitud mínima
        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        this.performRegister(usuario, email, password);
    }

    async performRegister(usuario, email, password) {
        try {
            const response = await registrarUsuario({ usuario, email, password });
            
            // Verificar si el registro fue exitoso
            if (response.message === 'Usuario registrado exitosamente' && response.usuario && response.usuario.id) {
                // Guardar ID del usuario en localStorage
                guardarUsuarioId(response.usuario.id);
                
                // Disparar evento de cambio de estado de autenticación
                window.dispatchEvent(new Event('authStateChanged'));
                
                alert('¡Registro exitoso! Bienvenido.');
                
                // Navegar a home o game
                const navigationEvent = new CustomEvent('navigate', {
                    detail: { route: '#home' },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(navigationEvent);
            } else {
                alert('Error en el registro. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error al registrarse:', error);
            
            // Mostrar mensaje de error específico si es un usuario duplicado
            if (error.message.includes('409') || error.message.includes('duplicado')) {
                alert('El usuario o email ya existe. Intenta con otro.');
            } else {
                alert(`Error: ${error.message}`);
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
}

export { GameRegister };
