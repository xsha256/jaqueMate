// Importar estilos globales
import "./style.css";

// Importar y registrar todos los WebComponents
import './webComponents.js';

// Importar el router
import { router } from './router.js';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener contenedores
    const app = document.querySelector('#app');
    const contentContainer = document.querySelector('#content');
    const footerContainer = document.querySelector('#footer');

    // Renderizar header y footer (componentes persistentes)
    app.innerHTML = '<game-header></game-header>';
    footerContainer.innerHTML = '<game-footer></game-footer>';

    // Gestionar navegación por eventos del header
    document.addEventListener('navigate', (event) => {
        const route = event.detail.route;
        router(route, contentContainer);
    });

    // Renderizar la ruta inicial (home)
    router('', contentContainer);
});
