// Toggle para desplegar/recoger el panel de movimientos
const toggleButton = document.querySelector('.toggle-moves');
const movesPanel = document.querySelector('.moves-panel');
const gameContainer = document.querySelector('.game-container');

toggleButton.addEventListener('click', () => {
    movesPanel.classList.toggle('open');
    gameContainer.classList.toggle('panel-open');
});
