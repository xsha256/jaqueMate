# Componentes Web Personalizados

Esta carpeta contiene los componentes web personalizados de la aplicación de ajedrez.

## Estructura de Componentes

Cada componente sigue la estructura:
```
componente-nombre/
├── componente-nombre.js   # Lógica del componente (Web Component)
└── componente-nombre.css  # Estilos del componente
```

## Componentes Disponibles

### 1. `app-ajedrez`
**Archivo:** `app-ajedrez/app-ajedrez.js`

Componente contenedor principal que coordina:
- El tablero de ajedrez (`<tablero-ajedrez>`)
- El panel de control (`<panel-control>`)
- La lógica del juego con chess.js

**Estilo visual:**
- Fondo con gradiente oscuro (#1a1a1a → #242424)
- Contenedor con efecto glassmorphism
- Bordes redondeados y sombras elegantes
- Hover effect en el tablero con glow rojo (#c41e3a)

**CSS:** `app-ajedrez/app-ajedrez.css`

---

### 2. `tablero-ajedrez`
**Archivo:** `tablero-ajedrez/tablero-ajedrez.js`

Componente que renderiza un tablero de ajedrez interactivo usando chessboard.js y RxJS.

**Características:**
- NO valida jugadas (solo emite eventos)
- Usa BehaviorSubject de RxJS para gestionar la posición
- Soporta drag & drop de piezas
- Emite evento `intento-movimiento` en cada movimiento

**Estilo visual:**
- Marco oscuro (#2d2d2d) con borde #404040
- Casillas blancas: #e0e0e0
- Casillas negras: #c41e3a (rojo característico)
- Coordenadas oscuras y legibles
- Bordes redondeados

**CSS:** `tablero-ajedrez/tablero-ajedrez.css`

---

### 3. `panel-control`
**Archivo:** `panel-control/panel-control.js`

Panel lateral desplegable que muestra el historial de movimientos.

**Características:**
- Se puede abrir/cerrar con un botón toggle (📜)
- Muestra la notación algebraica de cada movimiento
- Auto-scroll al último movimiento
- Animación suave de apertura/cierre

**Estilo visual:**
- Fondo oscuro (#2d2d2d) con borde #404040
- Botón con hover effect rojo (#c41e3a)
- Lista de movimientos con hover interactivo
- Scrollbar personalizado con el tema de colores

**CSS:** `panel-control/panel-control.css`

---

## Paleta de Colores

Los componentes comparten una paleta de colores coherente:

| Color | Hex | Uso |
|-------|-----|-----|
| Negro principal | `#1a1a1a` | Fondo de app |
| Gris oscuro | `#242424` | Fondo secundario, gradientes |
| Gris medio | `#2d2d2d` | Fondo de componentes |
| Gris borde | `#404040` | Bordes |
| Gris oscuro items | `#3a3a3a` | Fondo de items en lista |
| Gris borde items | `#505050` | Bordes de items |
| Gris claro texto | `#b0b0b0` | Texto secundario |
| Blanco suave | `#e0e0e0` | Texto principal, casillas blancas |
| Rojo característico | `#c41e3a` | Acentos, hover, casillas negras |

---

## Cómo Usar los Componentes

### Importar y registrar:
```javascript
import { AppAjedrez } from './components/app-ajedrez/app-ajedrez.js';
customElements.define('app-ajedrez', AppAjedrez);
```

### Usar en HTML:
```html
<app-ajedrez></app-ajedrez>
```

### Actualizar posición del tablero:
```javascript
const tablero = document.querySelector('tablero-ajedrez');
tablero.posicion$.next('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
```

### Escuchar eventos de movimiento:
```javascript
tablero.addEventListener('intento-movimiento', (e) => {
  console.log('Movimiento:', e.detail);
  // { desde, hasta, pieza, posicionAnterior }
});
```

---

## Arquitectura

Los componentes usan:
- **Web Components API** para encapsulación
- **RxJS** para gestión de estado reactivo
- **chess.js** para validación de movimientos
- **chessboard.js** para renderizado del tablero
- **CSS modular** cargado dinámicamente con fetch()

Cada componente es autónomo y gestiona sus propias dependencias.
