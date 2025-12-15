class MovesObservable {
    constructor() {
        this.subscribers = [];
        this.moves = [];
    }

    //suscribirse a cambios de jugadas
    subscribe(callback) {
        this.subscribers.push(callback);
        //ejecutar inmediatamente con datos actuales
        callback(this.moves);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    //notificar a todos los suscriptores
    notify() {
        this.subscribers.forEach(callback => callback([...this.moves]));
    }

    //actualizar la lista de jugadas
    setMoves(newMoves) {
        this.moves = [...newMoves];
        this.notify();
    }

    //agregar una jugada
    addMove(move) {
        this.moves.push(move);
        this.notify();
    }

    //agregar multiples jugadas (para importacion csv)
    addMoves(newMoves) {
        this.moves.push(...newMoves);
        this.notify();
    }

    //obtener jugadas actuales
    getMoves() {
        return [...this.moves];
    }

    //limpiar todas las jugadas
    clear() {
        this.moves = [];
        this.notify();
    }
}

//instancia unica del observable
export const movesObservable = new MovesObservable();
