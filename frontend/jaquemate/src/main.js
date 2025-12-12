// Importar estilos globales
import "./style.css";

// Importar y registrar todos los WebComponents
import './webComponents.js';

// Importar el router
import { router } from './router.js';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener contenedores
    const app = document.getElementById('app');
    const contentContainer = document.getElementById('content');
    const footerContainer = document.getElementById('footer');

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

/**
 * Archivo principal de la aplicación JaqueMate
 * 
 * Este archivo es el punto de entrada de la aplicación.
 * Importa las librerías necesarias, registra los WebComponents,
 * e inicializa el router para gestionar la navegación.
 */
