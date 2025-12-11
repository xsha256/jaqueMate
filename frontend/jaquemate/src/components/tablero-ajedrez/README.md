# Componente Tablero de Ajedrez (`<tablero-escacs>`)

Web Component personalizado para mostrar un tablero de ajedrez interactivo usando chessboard.js y chess.js con soporte para RxJS.

## Características

- ✅ **Custom Element nativo** (sin frameworks)
- ✅ **Formato FEN** para posiciones
- ✅ **RxJS** para gestión reactiva de la posición
- ✅ **Responsive** y mantiene proporción cuadrada
- ✅ **Tablero fijo** con blancas abajo
- ✅ **Muestra coordenadas** (números y letras) de forma responsive
- ⚠️ **NO valida movimientos** - solo emite eventos de intentos

## Instalación

El componente ya está registrado globalmente. Solo necesitas importarlo:

```javascript
import TableroEscacs from './src/components/tablero-escacs/tablero-escacs.js';
```

## Uso Básico

### 1. Crear el tablero en HTML

```html
<tablero-escacs id="mi-tablero"></tablero-escacs>
```

### 2. Acceder al componente desde JavaScript

```javascript
const tablero = document.getElementById('mi-tablero');
```

### 3. Actualizar la posición mediante el Subject

El componente expone un `BehaviorSubject` llamado `posicion$` que acepta strings en formato FEN:

```javascript
// Posición inicial
tablero.posicion$.next('start');

// Posición personalizada (FEN)
tablero.posicion$.next('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
```

### 4. Escuchar eventos de movimiento

El componente emite un evento `intento-movimiento` **SIEMPRE** que el usuario hace drag&drop de una pieza, incluso si el movimiento es ilegal:

```javascript
tablero.addEventListener('intento-movimiento', (evento) => {
  const { desde, hasta, pieza, posicionAnterior } = evento.detail;

  console.log(`Usuario intentó mover ${pieza} de ${desde} a ${hasta}`);

  // IMPORTANTE: Debes validar el movimiento externamente
  // El tablero NO valida, solo reporta el intento
});
```

## Arquitectura Importante

### ⚠️ El componente NO valida movimientos

Esta es una decisión de diseño importante:

- El componente **solo dibuja** el tablero
- **Solo emite eventos** cuando hay drag&drop
- **NO decide** si un movimiento es legal o no
- **Siempre** revierte la pieza a su posición original (snapback)

La validación debe hacerse **externamente**, típicamente así:

```javascript
import { Chess } from 'chess.js';

// Instancia EXTERNA de chess.js para validación
const chess = new Chess();

tablero.addEventListener('intento-movimiento', (evento) => {
  const { desde, hasta } = evento.detail;

  // Validar externamente
  let movimiento;
  try {
    movimiento = chess.move({
      from: desde,
      to: hasta,
      promotion: 'q'
    });
  } catch (e) {
    console.log('Movimiento ilegal');
    return; // El tablero ya hizo snapback
  }

  // Si es legal, actualizar el tablero
  if (movimiento) {
    tablero.posicion$.next(chess.fen());

    // Guardar en BD
    guardarMovimiento({
      usuario: 'ID_USUARIO',
      posicionInicial: desde,
      posicionFinal: hasta,
      colorFichas: movimiento.color === 'w' ? 'blancas' : 'negras',
      pieza: movimiento.piece,
      fenAntes: evento.detail.posicionAnterior,
      fenDespues: chess.fen()
    });
  }
});
```

## API del Componente

### Propiedades

- `posicion$` (BehaviorSubject<string>): Subject para actualizar/suscribirse a cambios de posición

### Atributos HTML

- `posicion-inicial`: Posición FEN inicial (opcional)

```html
<tablero-escacs posicion-inicial="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"></tablero-escacs>
```

### Eventos

#### `intento-movimiento`

Se emite **siempre** que el usuario hace drag&drop, incluso para movimientos ilegales.

```javascript
evento.detail = {
  desde: string,           // Casilla origen (ej: 'e2')
  hasta: string,           // Casilla destino (ej: 'e4')
  pieza: string,           // Código de pieza (ej: 'wP')
  posicionAnterior: string // FEN antes del intento
}
```

### Métodos Públicos

- `obtenerPosicionActual()`: Retorna el FEN de la posición actual
- `establecerPosicionDesdeObjeto(obj)`: Establece posición desde objeto
- `obtenerPosicionComoObjeto()`: Retorna posición como objeto
- `limpiarTablero()`: Limpia todas las piezas del tablero

## Ejemplo Completo

```javascript
import TableroEscacs from './src/components/tablero-escacs/tablero-escacs.js';
import { Chess } from 'chess.js';

// Crear instancia EXTERNA de chess.js para validación
const chess = new Chess();
const tablero = document.getElementById('mi-tablero');

// Escuchar intentos de movimiento
tablero.addEventListener('intento-movimiento', (evento) => {
  const { desde, hasta, posicionAnterior } = evento.detail;

  // Validar externamente
  const movimiento = chess.move({ from: desde, to: hasta, promotion: 'q' });

  if (movimiento) {
    // Movimiento legal - actualizar tablero
    tablero.posicion$.next(chess.fen());

    // Preparar datos para BD
    const datosParaBD = {
      usuario: getCurrentUserId(),
      posicionInicial: desde,
      posicionFinal: hasta,
      colorFichas: movimiento.color === 'w' ? 'blancas' : 'negras',
      pieza: movimiento.piece,
      fenAntes: posicionAnterior,
      fenDespues: chess.fen(),
      timestamp: new Date().toISOString()
    };

    // Guardar en BD
    fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosParaBD)
    });
  } else {
    console.log('Movimiento ilegal - ya se hizo snapback');
  }
});

// Suscribirse a cambios de posición (opcional)
tablero.posicion$.subscribe(nuevaPosicion => {
  console.log('Posición actualizada:', nuevaPosicion);
});

// Reiniciar juego
function reiniciar() {
  chess.reset();
  tablero.posicion$.next('start');
}

// Deshacer movimiento
function deshacer() {
  const movimiento = chess.undo();
  if (movimiento) {
    tablero.posicion$.next(chess.fen());
  }
}
```

## Datos para Guardar en Base de Datos

Para cada movimiento válido, debes guardar:

```javascript
{
  usuario: string,         // ID del usuario
  posicionInicial: string, // Casilla origen (ej: 'e2')
  posicionFinal: string,   // Casilla destino (ej: 'e4')
  colorFichas: string,     // 'blancas' o 'negras'
  pieza: string,           // Tipo de pieza ('p', 'n', 'b', 'r', 'q', 'k')
  fenAntes: string,        // FEN antes del movimiento
  fenDespues: string,      // FEN después del movimiento
  san: string,             // Notación algebraica (ej: 'Nf3')
  captura: string | null,  // Pieza capturada si existe
  timestamp: string        // ISO timestamp
}
```

## Responsive

El tablero es completamente responsive:

- Mantiene proporción cuadrada perfecta (1:1)
- Se adapta al ancho del contenedor
- Las coordenadas (números y letras) escalan automáticamente
- Las piezas mantienen proporciones correctas

```css
tablero-escacs {
  width: 100%;
  max-width: 600px; /* Ajusta según necesites */
}
```

## Consideraciones

1. **El tablero es fijo**: Siempre muestra blancas abajo (no se puede voltear)
2. **No tiene lógica de juego**: Solo es una vista
3. **La validación es externa**: Usa chess.js fuera del componente
4. **Los movimientos ilegales se revierten automáticamente**: El componente hace snapback
5. **Usa formato FEN**: Todas las posiciones son strings FEN

## Troubleshooting

### El tablero no se muestra
- Asegúrate de que jQuery y chessboard.js estén cargados antes del componente
- Verifica que las imágenes de las piezas estén en `/public/img/chesspieces/wikipedia/`

### Los movimientos no funcionan
- Recuerda que DEBES validar externamente y actualizar `posicion$.next()`
- El componente NO mueve piezas automáticamente

### El evento no se emite
- Verifica que estés usando el nombre correcto: `'intento-movimiento'`
- Asegúrate de agregar el listener después de que el componente esté en el DOM
