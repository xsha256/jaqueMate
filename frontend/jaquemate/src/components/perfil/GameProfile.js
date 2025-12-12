/* GameProfile - webcomponent */

import style from './GameProfile.css?inline';
import { obtenerUsuarioId, actualizarPerfil, obtenerPerfilPorId } from '../../services/api.service.js';

class GameProfile extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userPassword = null; // Almacenar temporalmente
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.loadUserData();
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <div class="profile-container">
                <h1>Mi Perfil</h1>
                
                <form id="profileForm">
                    <!-- Nombre -->
                    <div class="form-group">
                        <label for="usuario">Usuario</label>
                        <input type="text" id="usuario" name="usuario" placeholder="Tu usuario" required>
                    </div>

                    <!-- Email (no editable) -->
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="tu@email.com" disabled>
                        <small class="info-text">El email no puede ser modificado</small>
                    </div>

                    <!-- Contraseña Actual -->
                    <div class="form-group">
                        <label for="passwordActual">Contraseña Actual</label>
                        <div class="password-group">
                            <input type="password" id="passwordActual" name="passwordActual" placeholder="••••••••">
                            <button type="button" class="toggle-password" id="togglePasswordActual">👁️</button>
                        </div>
                    </div>

                    <!-- Contraseña Nueva -->
                    <div class="form-group">
                        <label for="passwordNueva">Nueva Contraseña</label>
                        <div class="password-group">
                            <input type="password" id="passwordNueva" name="passwordNueva" placeholder="••••••••">
                            <button type="button" class="toggle-password" id="togglePasswordNueva">👁️</button>
                        </div>
                    </div>

                    <!-- Confirmar Contraseña -->
                    <div class="form-group">
                        <label for="passwordConfirm">Confirmar Nueva Contraseña</label>
                        <div class="password-group">
                            <input type="password" id="passwordConfirm" name="passwordConfirm" placeholder="••••••••">
                            <button type="button" class="toggle-password" id="togglePasswordConfirm">👁️</button>
                        </div>
                        <small class="info-text" id="passwordMatchStatus"></small>
                    </div>

                    <button type="submit" class="submit-btn">Guardar Cambios</button>
                </form>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attachEventListeners() {
        const form = this.shadowRoot.querySelector('#profileForm');
        const toggleButtons = this.shadowRoot.querySelectorAll('.toggle-password');
        const passwordNueva = this.shadowRoot.querySelector('#passwordNueva');
        const passwordConfirm = this.shadowRoot.querySelector('#passwordConfirm');

        // Toggle de contraseñas
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePasswordVisibility(button);
            });
        });

        // Validar coincidencia de contraseñas
        passwordNueva.addEventListener('input', () => {
            this.validatePasswordMatch();
        });
        passwordConfirm.addEventListener('input', () => {
            this.validatePasswordMatch();
        });

        // Envío del formulario
        form.addEventListener('submit', (e) => {
            this.handleProfileUpdate(e);
        });
    }

    togglePasswordVisibility(button) {
        const inputId = button.id.replace('togglePassword', '');
        let fieldId;
        
        if (inputId === 'Actual') fieldId = 'passwordActual';
        else if (inputId === 'Nueva') fieldId = 'passwordNueva';
        else if (inputId === 'Confirm') fieldId = 'passwordConfirm';

        const input = this.shadowRoot.querySelector(`#${fieldId}`);
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        button.textContent = isPassword ? '🙈' : '👁️';
    }

    validatePasswordMatch() {
        const passwordNueva = this.shadowRoot.querySelector('#passwordNueva').value;
        const passwordConfirm = this.shadowRoot.querySelector('#passwordConfirm').value;
        const statusText = this.shadowRoot.querySelector('#passwordMatchStatus');

        if (!passwordNueva && !passwordConfirm) {
            statusText.textContent = '';
            return;
        }

        if (passwordNueva === passwordConfirm && passwordNueva.length > 0) {
            statusText.textContent = '✓ Las contraseñas coinciden';
            statusText.className = 'info-text match';
        } else if (passwordConfirm.length > 0) {
            statusText.textContent = '✗ Las contraseñas no coinciden';
            statusText.className = 'info-text error';
        } else {
            statusText.textContent = '';
            statusText.className = 'info-text';
        }
    }

    async loadUserData() {
        try {
            const usuarioId = obtenerUsuarioId();
            
            if (!usuarioId) {
                alert('No hay usuario autenticado');
                return;
            }

            const response = await obtenerPerfilPorId(usuarioId);
            
            if (response && response.usuario) {
                const usuario = response.usuario;
                this.shadowRoot.querySelector('#usuario').value = usuario.usuario || '';
                this.shadowRoot.querySelector('#email').value = usuario.email || '';
            } else {
                alert('Error al cargar datos del perfil');
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            alert(`Error: ${error.message}`);
        }
    }

    handleProfileUpdate(event) {
        event.preventDefault();

        const usuario = this.shadowRoot.querySelector('#usuario').value;
        const passwordActual = this.shadowRoot.querySelector('#passwordActual').value;
        const passwordNueva = this.shadowRoot.querySelector('#passwordNueva').value;
        const passwordConfirm = this.shadowRoot.querySelector('#passwordConfirm').value;

        // Validaciones
        if (!usuario.trim()) {
            alert('El usuario no puede estar vacío');
            return;
        }

        if ((passwordNueva || passwordConfirm) && passwordNueva !== passwordConfirm) {
            alert('Las nuevas contraseñas no coinciden');
            return;
        }

        if (passwordNueva && passwordNueva.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        this.performProfileUpdate(usuario, passwordNueva);
    }

    async performProfileUpdate(usuario, passwordNueva) {
        try {
            const usuarioId = obtenerUsuarioId();
            
            if (!usuarioId) {
                alert('No hay usuario autenticado');
                return;
            }

            // Construir objeto de actualización
            const perfilData = { usuario };
            if (passwordNueva) {
                perfilData.password = passwordNueva;
            }

            const response = await actualizarPerfil(usuarioId, perfilData);
            
            if (response && response.message) {
                alert('Perfil actualizado correctamente');
                
                // Limpiar campos de contraseña
                this.shadowRoot.querySelector('#passwordActual').value = '';
                this.shadowRoot.querySelector('#passwordNueva').value = '';
                this.shadowRoot.querySelector('#passwordConfirm').value = '';
                this.validatePasswordMatch();
            } else {
                alert('Error al actualizar perfil');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

export { GameProfile };
