/**
 * Router para JaqueMate
 * Mapea rutas a componentes web components
 * 
 * Rutas disponibles:
 * - '' o '#home' → game-home (página principal)
 * - '#game' → game-board (interfaz del juego)
 * - '#login' → game-login (formulario de login)
 * - '#register' → game-register (formulario de registro)
 */

export { router };

const routes = new Map([
    ['', 'game-home'],
    ['#home', 'game-home'],
    ['#game', 'game-board'],
    ['#login', 'game-login'],
    ['#register', 'game-register']
]);

function router(route, container) {
    if (routes.has(route)) {
        // Obtiene el nombre del componente web y lo crea
        const componentName = routes.get(route);
        container.replaceChildren(document.createElement(componentName));
    } else {
        // Página no encontrada
        container.innerHTML = `<h2>404 - Página no encontrada</h2>`;
    }
}
