/* GameMoves WebComponent. Es la lista de Jugadas pero NO la que junto a tablero, sino la del boton Lista Jugadas */

import style from './GameMoves.css?inline';
import { movesObservable } from '../../observables/movesObservable.js';

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
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.loadDemoData();
        this.subscribeToObservable();
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
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
                            <th class="sortable" data-sort="player">Jugador ⇅</th>
                            <th class="sortable" data-sort="fen">FEN ⇅</th>
                            <th class="sortable" data-sort="uci">UCI ⇅</th>
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
                        <div class="modal-header">Vista Previa de CSV</div>
                        <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
                            Se importarán <span id="csvPreviewCount">0</span> jugada(s)
                        </p>
                        <table class="modal-preview-table" id="csvPreviewTable">
                            <thead>
                                <tr>
                                    <th>Jugador</th>
                                    <th>FEN</th>
                                    <th>UCI</th>
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
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attachEventListeners() {
        //filtro
        this.shadowRoot.querySelector('#playerFilter').addEventListener('input', (e) => {
            this.filterPlayer = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.applyFilters();
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
    }

    //datos demo - se reemplazaran con datos del observable/backend
    loadDemoData() {
        const demoMoves = [
            { player: 'Kasparov', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', uci: 'e2e4' },
            { player: 'Fischer', fen: 'rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP1PPP/RNBQKBNR w KQkq e3 0 2', uci: 'e2e4' },
            { player: 'Kasparov', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', uci: 'e7e5' },
            { player: 'Carlsen', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', uci: 'g1f3' },
            { player: 'Fischer', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq f3 1 2', uci: 'b8c6' },
            { player: 'Kasparov', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq c6 2 3', uci: 'f1b5' },
            { player: 'Carlsen', fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq b5 3 3', uci: 'a7a6' },
            { player: 'Fischer', fen: 'r1bqkbnr/p1pp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 w kq a6 0 4', uci: 'b5a4' },
            { player: 'Kasparov', fen: 'r1bqkbnr/p1pp1ppp/2n5/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq a4 1 4', uci: 'g8f6' },
            { player: 'Carlsen', fen: 'r1bqkb1r/p1pp1ppp/2n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq f6 2 5', uci: 'e1g1' },
            { player: 'Fischer', fen: 'r1bqkb1r/p1pp1ppp/2n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ2RK b kq - 3 5', uci: 'f8e7' },
            { player: 'Kasparov', fen: 'r1bqk2r/p1ppbppp/2n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ2RK w kq - 4 6', uci: 'f1e1' },
        ];

        this.moves = demoMoves;
        movesObservable.setMoves(demoMoves);
        this.applyFilters();
    }

    //suscribirse al observable
    subscribeToObservable() {
        this.unsubscribe = movesObservable.subscribe((moves) => {
            this.moves = moves;
            this.currentPage = 1;
            this.applyFilters();
        });
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
                    const moveIndex = this.moves.indexOf(this.filteredMoves[index]);

                    if (action === 'viewBoard') {
                        this.handleViewInBoard(this.filteredMoves[index]);
                    } else if (action === 'delete') {
                        this.handleDeleteMove(moveIndex);
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

    //ver jugada en tablero (emite evento)
    handleViewInBoard(move) {
        const event = new CustomEvent('moveSelected', {
            detail: {
                player: move.player,
                fen: move.fen,
                uci: move.uci
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
        console.log('moveSelected:', move.player, move.uci);
    }

    //eliminar jugada
    handleDeleteMove(index) {
        if (confirm('¿Eliminar esta jugada?')) {
            this.moves.splice(index, 1);
            movesObservable.setMoves(this.moves);
            console.log('jugada eliminada. total:', this.moves.length);
        }
    }

    //manejo de importacion csv
    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

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
        
        tbody.innerHTML = this.csvPreviewData.map((move) => `
            <tr>
                <td>${this.escapeHtml(move.player)}</td>
                <td>${this.escapeHtml(move.fen)}</td>
                <td>${move.uci}</td>
            </tr>
        `).join('');

        this.shadowRoot.querySelector('#csvPreviewCount').textContent = this.csvPreviewData.length;
        modal.classList.add('active');
    }

    //cerrar modal de csv
    closeCSVModal() {
        const modal = this.shadowRoot.querySelector('#csvModal');
        modal.classList.remove('active');
    }

    //confirmar importacion de csv
    confirmCSVImport() {
        //TODO: POST /api/moves/import con this.csvPreviewData
        movesObservable.addMoves(this.csvPreviewData);
        alert(`${this.csvPreviewData.length} jugada(s) importada(s)`);
        this.closeCSVModal();
        this.shadowRoot.querySelector('#csvFileInput').value = '';
    }

    //exportar a csv
    exportToCSV() {
        if (this.filteredMoves.length === 0) {
            alert('No hay jugadas para exportar');
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
}

export { GameMoves };