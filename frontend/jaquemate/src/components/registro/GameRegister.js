/*GameRegister*/
//Es un webcomponent para el formulario de registro

import style from './GameRegister.css?inline';

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
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" placeholder="Tu nombre completo" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="tu@email.com" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
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
        
        const nombre = this.shadowRoot.querySelector('#nombre').value;
        const email = this.shadowRoot.querySelector('#email').value;
        const password = this.shadowRoot.querySelector('#password').value;

        // Validar campos
        if (!nombre || !email || !password) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Aquí iría la llamada al backend para registrarse
        console.log('Intento de registro:', { nombre, email, password });

        // TO DO: Implementar llamada a API backend
        // Si es exitoso, guardar token en localStorage
        // localStorage.setItem('access_token', token);
        // window.dispatchEvent(new Event('authStateChanged'));
        // Navegar a home o game
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
