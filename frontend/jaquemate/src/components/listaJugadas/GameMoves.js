import style from './GameMoves.css?inline';
import { obtenerTodasJugadas, obtenerUsuarioId,  confirmarImportacionJugadas, eliminarJugada } from '../../services/api.service.js';

class GameMoves extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        //estado
        this.moves = [];
        this.filteredMoves = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortBy = null;
        this.sortOrder = 'asc';
        this.filterPlayer = '';
        this.csvPreviewData = [];
        this.unsubscribe = null;
        this.pendingMoveToView = null;
        this.pendingMoveToDelete = null;
        this.filterDebounceTimer = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.loadFromBackend();
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.filterDebounceTimer) {
            clearTimeout(this.filterDebounceTimer);
        }
    }

    render() {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <div class="moves-wrapper">
                <!-- Header -->
                <div class="moves-header">
                    <h1>Lista de Jugadas</h1>
                </div>

                <!-- Filtros -->
                <div class="filters-section">
                    <div class="filter-group">
                        <label for="playerFilter">Filtrar por Jugador:</label>
                        <input type="text" id="playerFilter" placeholder="Nombre del jugador">
                    </div>
                </div>

                <!-- Tabla de Jugadas -->
                <table class="moves-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-sort="player">Jugador</th>
                            <th class="sortable" data-sort="fen">FEN</th>
                            <th class="sortable" data-sort="uci">UCI</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="movesTableBody">
                        <tr><td colspan="4" style="text-align: center; padding: 2rem;">Cargando jugadas...</td></tr>
                    </tbody>
                </table>

                <!-- Paginación y CSV -->
                <div class="bottom-section">
                    <div class="csv-buttons">
                        <div class="file-input-wrapper">
                            <input type="file" id="csvFileInput" accept=".csv" />
                            <label for="csvFileInput" class="file-input-label">📤 Importar CSV</label>
                        </div>
                        <button class="main-btn" id="exportCsvBtn">📥 Exportar CSV</button>
                    </div>

                    <div class="pagination-section">
                        <span class="pagination-info">
                            Página <span id="currentPage">1</span> de <span id="totalPages">1</span>
                            | Total: <span id="totalMoves">0</span> jugadas
                        </span>
                        <div class="pagination-buttons">
                            <button class="pagination-btn" id="firstPageBtn">⏮ Primera</button>
                            <button class="pagination-btn" id="prevPageBtn">◀ Anterior</button>
                            <button class="pagination-btn" id="nextPageBtn">Siguiente ▶</button>
                            <button class="pagination-btn" id="lastPageBtn">Última ⏭</button>
                        </div>
                    </div>
                </div>

                <!-- Modal para Preview de CSV -->
                <div class="modal-overlay" id="csvModal">
                    <div class="modal">
                        <div class="modal-header">Vista Previa de Importación CSV</div>
                        <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem; text-align: center; font-size: 1rem;">
                            Se importarán <span class="csv-preview-count" id="csvPreviewCount">0</span> jugada(s)
                        </p>
                        <table class="modal-preview-table" id="csvPreviewTable">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Jugador</th>
                                    <th>FEN</th>
                                    <th>UCI</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="csvPreviewBody">
                            </tbody>
                        </table>
                        <div class="modal-actions">
                            <button class="modal-btn cancel" id="csvCancelBtn">Cancelar</button>
                            <button class="modal-btn confirm" id="csvConfirmBtn">Guardar en Base de Datos</button>
                        </div>
                    </div>
                </div>

                <!-- Modal para Confirmación de Ver Jugada -->
                <div class="modal-overlay" id="viewMoveModal">
                    <div class="modal">
                        <div class="modal-header">Ver Jugada en Tablero</div>
                        <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: 1rem;">
                            ¿Deseas ir al tablero para ver esta posición y continuar jugando desde este punto?
                        </p>
                        <div class="modal-actions">
                            <button class="modal-btn cancel" id="viewMoveCancelBtn">Cancelar</button>
                            <button class="modal-btn confirm" id="viewMoveConfirmBtn">D'acord</button>
                        </div>
                    </div>
                </div>

                <!-- Modal para Confirmación de Eliminar Jugada -->
                <div class="modal-overlay" id="deleteMoveModal">
                    <div class="modal">
                        <div class="modal-header">Eliminar Jugada</div>
                        <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: 1rem;">
                            ¿Estás seguro de que deseas eliminar esta jugada? Esta acción no se puede deshacer.
                        </p>
                        <div class="modal-actions">
                            <button class="modal-btn cancel" id="deleteMoveCancelBtn">Cancelar</button>
                            <button class="modal-btn confirm" id="deleteMoveConfirmBtn">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attachEventListeners() {
        //filtro con debounce
        this.shadowRoot.querySelector('#playerFilter').addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();

            // Limpiar el timer anterior
            if (this.filterDebounceTimer) {
                clearTimeout(this.filterDebounceTimer);
            }

            this.filterDebounceTimer = setTimeout(() => {
                this.filterPlayer = value;
                this.currentPage = 1;
                this.applyFilters();
            }, 300);
        });

        //ordenamiento
        this.shadowRoot.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sortField = th.dataset.sort;
                this.handleSort(sortField, th);
            });
        });

        //paginacion
        this.shadowRoot.querySelector('#firstPageBtn').addEventListener('click', () => this.goToPage(1));
        this.shadowRoot.querySelector('#prevPageBtn').addEventListener('click', () => this.previousPage());
        this.shadowRoot.querySelector('#nextPageBtn').addEventListener('click', () => this.nextPage());
        this.shadowRoot.querySelector('#lastPageBtn').addEventListener('click', () => this.goToLastPage());

        //csv import
        this.shadowRoot.querySelector('#csvFileInput').addEventListener('change', (e) => {
            this.handleCSVUpload(e);
        });

        //csv modal
        this.shadowRoot.querySelector('#csvCancelBtn').addEventListener('click', () => {
            this.closeCSVModal();
        });

        this.shadowRoot.querySelector('#csvConfirmBtn').addEventListener('click', () => {
            this.confirmCSVImport();
        });

        //csv export
        this.shadowRoot.querySelector('#exportCsvBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        //modal ver jugada
        this.shadowRoot.querySelector('#viewMoveCancelBtn').addEventListener('click', () => {
            this.closeViewMoveModal();
        });

        this.shadowRoot.querySelector('#viewMoveConfirmBtn').addEventListener('click', () => {
            this.confirmViewMove();
        });

        //modal eliminar jugada
        this.shadowRoot.querySelector('#deleteMoveCancelBtn').addEventListener('click', () => {
            this.closeDeleteMoveModal();
        });

        this.shadowRoot.querySelector('#deleteMoveConfirmBtn').addEventListener('click', () => {
            this.confirmDeleteMove();
        });
    }

    // Cargar datos del backend
    async loadFromBackend() {
        try {
            // Llamar al backend para obtener todas las jugadas de todos los usuarios
            const response = await obtenerTodasJugadas({
                page: 0,
                size: 100, // Cargar más jugadas por defecto
                sort: ['createdAt,desc'] // Más recientes primero
            });

            // Mapear datos del backend
            if (response && response.content) {
                this.moves = response.content.map(jugada => ({
                    id: jugada.id,
                    player: jugada.usuarioNombre,
                    fen: jugada.fen,
                    uci: jugada.moveUci,
                    moveSan: jugada.moveSan,
                    createdAt: jugada.createdAt,
                    pgn: jugada.pgn
                }));

                this.currentPage = 1;
                this.applyFilters();
            } else {
                this.moves = [];
                this.applyFilters();
            }
        } catch (error) {
            alert(`Error al cargar jugadas: ${error.message}`);
            this.moves = [];
            this.applyFilters();
        }
    }

    //aplicar filtros y actualizar tabla
    applyFilters() {
        this.filteredMoves = this.moves.filter(move => {
            if (this.filterPlayer && !move.player.toLowerCase().includes(this.filterPlayer)) {
                return false;
            }
            return true;
        });

        //aplicar ordenamiento
        if (this.sortBy) {
            this.filteredMoves.sort((a, b) => {
                let aVal = a[this.sortBy];
                let bVal = b[this.sortBy];

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (this.sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        this.updateTable();
    }

    //actualizar tabla con paginacion
    updateTable() {
        const tbody = this.shadowRoot.querySelector('#movesTableBody');
        const totalPages = Math.ceil(this.filteredMoves.length / this.itemsPerPage) || 1;

        //validar página actual
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedMoves = this.filteredMoves.slice(start, end);

        //mostrar mensaje si no hay datos
        if (paginatedMoves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><p>No hay jugadas que mostrar</p></td></tr>';
        } else {
            tbody.innerHTML = paginatedMoves.map((move, index) => `
                <tr data-index="${start + index}">
                    <td>${this.escapeHtml(move.player)}</td>
                    <td class="fen-cell" title="${move.fen}">${this.escapeHtml(move.fen)}</td>
                    <td class="uci-cell">${move.uci}</td>
                    <td class="actions-cell">
                        <button class="action-btn view-board" data-index="${start + index}" data-action="viewBoard">👁 Ver tablero</button>
                        <button class="action-btn delete" data-index="${start + index}" data-action="delete">🗑 Eliminar</button>
                    </td>
                </tr>
            `).join('');

            //event listeners para botones
            tbody.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    const index = parseInt(e.target.dataset.index);

                    if (action === 'viewBoard') {
                        this.handleViewInBoard(this.filteredMoves[index]);
                    } else if (action === 'delete') {
                        this.handleDeleteMove(this.filteredMoves[index]);
                    }
                });
            });
        }

        //actualizar paginacion
        this.shadowRoot.querySelector('#currentPage').textContent = this.currentPage;
        this.shadowRoot.querySelector('#totalPages').textContent = totalPages;
        this.shadowRoot.querySelector('#totalMoves').textContent = this.filteredMoves.length;

        //actualizar botones
        this.shadowRoot.querySelector('#firstPageBtn').disabled = this.currentPage === 1;
        this.shadowRoot.querySelector('#prevPageBtn').disabled = this.currentPage === 1;
        this.shadowRoot.querySelector('#nextPageBtn').disabled = this.currentPage === totalPages;
        this.shadowRoot.querySelector('#lastPageBtn').disabled = this.currentPage === totalPages;
    }

    //manejo del ordenamiento
    handleSort(field, thElement) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortOrder = 'asc';
        }

        //actualizar clases visuales
        this.shadowRoot.querySelectorAll('th.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });

        if (this.sortOrder === 'asc') {
            thElement.classList.add('sorted-asc');
        } else {
            thElement.classList.add('sorted-desc');
        }

        this.currentPage = 1;
        this.applyFilters();
    }

    //paginacion
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredMoves.length / this.itemsPerPage) || 1;
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.updateTable();
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateTable();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredMoves.length / this.itemsPerPage) || 1;
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateTable();
        }
    }

    goToLastPage() {
        const totalPages = Math.ceil(this.filteredMoves.length / this.itemsPerPage) || 1;
        this.goToPage(totalPages);
    }

    //ver jugada en tablero
    handleViewInBoard(move) {
        // Guardar el FEN de la jugada a visualizar
        this.pendingMoveToView = move;

        // Mostrar modal de confirmación
        const modal = this.shadowRoot.querySelector('#viewMoveModal');
        modal.classList.add('active');
    }

    closeViewMoveModal() {
        const modal = this.shadowRoot.querySelector('#viewMoveModal');
        modal.classList.remove('active');
        this.pendingMoveToView = null;
    }

    confirmViewMove() {
        if (this.pendingMoveToView) {
            // Navegar a #game con el FEN y PGN como parámetros
            const fenEncodificado = encodeURIComponent(this.pendingMoveToView.fen);
            const pgnEncodificado = this.pendingMoveToView.pgn ? encodeURIComponent(this.pendingMoveToView.pgn) : '';
            const route = `#game?fen=${fenEncodificado}&pgn=${pgnEncodificado}`;

            const navigationEvent = new CustomEvent('navigate', {
                detail: { route: route },
                bubbles: true,
                composed: true
            });
            document.dispatchEvent(navigationEvent);

            // Actualizar el hash para que la URL se actualice
            window.location.hash = route;
        }
        this.closeViewMoveModal();
    }

    //eliminar jugada
    handleDeleteMove(move) {
        // Guardar la jugada a eliminar
        this.pendingMoveToDelete = move;

        // Mostrar modal de confirmación
        const modal = this.shadowRoot.querySelector('#deleteMoveModal');
        modal.classList.add('active');
    }

    closeDeleteMoveModal() {
        const modal = this.shadowRoot.querySelector('#deleteMoveModal');
        modal.classList.remove('active');
        this.pendingMoveToDelete = null;
    }

    async confirmDeleteMove() {
        if (this.pendingMoveToDelete) {
            try {
                // Eliminar del backend
                await eliminarJugada(this.pendingMoveToDelete.id);

                // Recargar la lista desde el backend
                await this.loadFromBackend();
            } catch (error) {
                alert(`Error al eliminar jugada: ${error.message}`);
            }
        }
        this.closeDeleteMoveModal();
    }

    //manejo de importacion csv
    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Guardar el archivo para luego enviarlo al backend
        this.csvFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                this.csvPreviewData = this.parseCSV(csv);

                if (this.csvPreviewData.length === 0) {
                    alert('CSV vacio o formato incorrecto');
                    return;
                }

                this.showCSVPreview();
            } catch (error) {
                alert('Error al leer CSV: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    //parsear csv (formato: player,fen,uci o player,"fen",uci)
    parseCSV(csv) {
        const lines = csv.split('\n');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            //parsear linea con o sin comillas en fen
            let match = line.match(/^([^,]+),"([^"]+)",([^,]+)$/);
            if (!match) {
                //intentar sin comillas (fen puede tener espacios)
                match = line.match(/^([^,]+),(.+),([^,]+)$/);
                if (match) {
                    data.push({
                        player: match[1].trim(),
                        fen: match[2].trim(),
                        uci: match[3].trim()
                    });
                }
            } else {
                data.push({
                    player: match[1].trim(),
                    fen: match[2].trim(),
                    uci: match[3].trim()
                });
            }
        }
        return data;
    }

    //mostrar preview de csv en modal
    showCSVPreview() {
        const modal = this.shadowRoot.querySelector('#csvModal');
        const tbody = this.shadowRoot.querySelector('#csvPreviewBody');

        tbody.innerHTML = this.csvPreviewData.map((move, index) => `
            <tr data-csv-index="${index}">
                <td style="font-weight: bold;">${index + 1}</td>
                <td>${this.escapeHtml(move.player)}</td>
                <td class="fen-preview" title="${this.escapeHtml(move.fen)}">${this.escapeHtml(move.fen)}</td>
                <td class="uci-preview">${move.uci}</td>
                <td>
                    <button class="csv-delete-btn" data-csv-index="${index}">🗑 Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Añadir event listeners a los botones de eliminar
        tbody.querySelectorAll('.csv-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.csvIndex);
                this.removeCSVPreviewRow(index);
            });
        });

        this.updateCSVPreviewCount();
        modal.classList.add('active');
    }

    //eliminar una fila del preview del csv
    removeCSVPreviewRow(index) {
        // Eliminar del array de datos
        this.csvPreviewData.splice(index, 1);

        // Re-renderizar la tabla
        const tbody = this.shadowRoot.querySelector('#csvPreviewBody');
        tbody.innerHTML = this.csvPreviewData.map((move, idx) => `
            <tr data-csv-index="${idx}">
                <td style="font-weight: bold;">${idx + 1}</td>
                <td>${this.escapeHtml(move.player)}</td>
                <td class="fen-preview" title="${this.escapeHtml(move.fen)}">${this.escapeHtml(move.fen)}</td>
                <td class="uci-preview">${move.uci}</td>
                <td>
                    <button class="csv-delete-btn" data-csv-index="${idx}">🗑 Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Re-añadir event listeners
        tbody.querySelectorAll('.csv-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.csvIndex);
                this.removeCSVPreviewRow(idx);
            });
        });

        this.updateCSVPreviewCount();

        // Si no quedan jugadas cerrar el modal
        if (this.csvPreviewData.length === 0) {
            this.closeCSVModal();
            this.showNotification(
                'Sin Jugadas',
                'No quedan jugadas para importar',
                'error'
            );
        }
    }

    //actualizar contador de jugadas en el modal
    updateCSVPreviewCount() {
        this.shadowRoot.querySelector('#csvPreviewCount').textContent = this.csvPreviewData.length;
    }

    //cerrar modal de csv
    closeCSVModal() {
        const modal = this.shadowRoot.querySelector('#csvModal');
        modal.classList.remove('active');
    }

    //confirmar importacion de csv
    async confirmCSVImport() {
        try {
            const usuarioId = obtenerUsuarioId();
            if (!usuarioId) {
                this.showNotification(
                    'Error de Autenticación',
                    'Debes iniciar sesión para importar jugadas',
                    'error'
                );
                return;
            }

            // Transformar los datos al formato esperado por el backend
            const jugadasParaBackend = this.csvPreviewData.map(jugada => ({
                fen: jugada.fen,
                jugadas: jugada.uci 
            }));

            // Confirmar la importación con los datos
            const confirmResponse = await confirmarImportacionJugadas(usuarioId, jugadasParaBackend);
            
            // Cerrar modal y limpiar antes de mostrar la notificación
            this.closeCSVModal();
            this.shadowRoot.querySelector('#csvFileInput').value = '';
            this.csvFile = null;
            const cantidadImportadas = this.csvPreviewData.length;
            this.csvPreviewData = [];

            // Mostrar mensaje de completado
            this.showNotification(
                'Importación Exitosa',
                `${cantidadImportadas} jugada(s) importada(s) correctamente`,
                'success'
            );

            // Recargar la lista de jugadas desde la BD
            await this.loadFromBackend();
        } catch (error) {
            this.showNotification(
                'Error al Importar',
                error.message || 'No se pudieron importar las jugadas',
                'error'
            );
        }
    }

    //exportar a csv
    exportToCSV() {
        if (this.filteredMoves.length === 0) {
            this.showNotification(
                'Sin Jugadas',
                'No hay jugadas para exportar',
                'error'
            );
            return;
        }

        let csv = 'player,fen,uci\n';
        this.filteredMoves.forEach(move => {
            csv += `${move.player},"${move.fen}",${move.uci}\n`;
        });

        //descargar archivo
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jugadas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    //escapar html en strings
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    //mostrar notificacion toast
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

export { GameMoves };