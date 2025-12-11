/* GameLogin */

//Es un WebComponent para el formulario de login

import style from './GameLogin.css?inline';

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
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="tu@email.com" required>
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

    handleLogin(event) {
        event.preventDefault();
        
        const email = this.shadowRoot.querySelector('#email').value;
        const password = this.shadowRoot.querySelector('#password').value;

        // Validar campos
        if (!email || !password) {
            alert('Todos los campos son obligatorios');
            return;
        }

        // Aquí iría la llamada al backend para autenticarse
        console.log('Intento de login:', { email, password });

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

export { GameLogin };
