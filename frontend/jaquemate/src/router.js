/* Router con todas las rutas*/

export { router };

const routes = new Map([
    ['', 'game-home'],
    ['#home', 'game-home'],
    ['#game', 'app-ajedrez'],
    ['#moves', 'game-moves'],
    ['#profile', 'game-profile'],
    ['#login', 'game-login'],
    ['#register', 'game-register']
]);

function router(route, container) {

    const baseRoute = route.split('?')[0]; //Para mostrar el tablero iniciado 

    if (routes.has(baseRoute)) {
        const componentName = routes.get(baseRoute);
        container.replaceChildren(document.createElement(componentName));
    } else {
        // Página no encontrada
        container.innerHTML = `<h2>404 - Página no encontrada</h2>`;
    }
}

