-- jaquemate db

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE IF NOT EXISTS jugadas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    move_san TEXT,
    move_uci_from TEXT,
    move_uci_to TEXT,
    fen TEXT,
    pgn TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


