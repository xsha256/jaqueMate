# Configuración de la API

## 📋 Configuración rápida

Para conectar el frontend con tu backend, solo necesitas editar **un archivo**:

### 1. Edita la configuración de la API

Abre el archivo [`src/config/api.config.js`](src/config/api.config.js) y cambia la URL:

```javascript
// Cambia esta línea por la URL de tu backend
export const API_BASE_URL = 'http://localhost:3000/api';
```

**Ejemplos:**

- **Desarrollo local:** `http://localhost:3000/api`
- **Producción:** `https://api.tudominio.com/api`
- **Otro puerto:** `http://localhost:8080/api`

### 2. ¡Listo!

El frontend ya está configurado para enviar los movimientos a tu backend automáticamente.

---

## 🔌 Endpoints que usa el frontend

El frontend hace peticiones a estos endpoints:

### Guardar movimiento
```
POST /api/movimientos
Content-Type: application/json

Body:
{
  "usuario": "ID_USUARIO",
  "posicionInicial": "e2",
  "posicionFinal": "e4",
  "colorFichas": "blancas",
  "pieza": "p",
  "fenAntes": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "fenDespues": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "san": "e4",
  "captura": null,
  "timestamp": "2025-12-11T10:30:00.000Z"
}
```

### Obtener historial de un usuario
```
GET /api/movimientos/usuario/:usuarioId
```

### Crear nueva partida
```
POST /api/partidas
Content-Type: application/json

Body:
{
  "usuario": "ID_USUARIO",
  "fechaInicio": "2025-12-11T10:30:00.000Z"
}
```

### Actualizar partida
```
PATCH /api/partidas/:partidaId
Content-Type: application/json

Body:
{
  "estado": "finalizada",
  "resultado": "victoria_blancas"
}
```

---

## 🛠️ Estructura del código

```
src/
├── config/
│   └── api.config.js          # ⚙️ CONFIGURACIÓN AQUÍ
├── services/
│   └── api.service.js         # Funciones para llamar a la API
└── components/
    └── app-ajedrez/
        └── app-ajedrez.js     # Llama a guardarMovimiento()
```

---

## 🔍 Cómo funciona

1. **Usuario mueve una pieza** en el tablero
2. **Se valida el movimiento** con chess.js
3. **Si es válido**, se llama a `guardarMovimiento()` en [`app-ajedrez.js:111`](src/components/app-ajedrez/app-ajedrez.js#L111)
4. **La función hace un POST** al endpoint `/api/movimientos`
5. **El backend guarda el movimiento** en la base de datos

---

## 📝 TODO: Agregar autenticación

Cuando implementes autenticación, necesitas:

1. Reemplazar `'ID_USUARIO'` por el ID real del usuario autenticado en [`app-ajedrez.js:97`](src/components/app-ajedrez/app-ajedrez.js#L97)

2. Agregar el token de autenticación en los headers. Edita [`api.config.js`](src/config/api.config.js):

```javascript
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer TU_TOKEN_AQUI'
};
```

---

## 🐛 Depuración

Los movimientos se registran en la consola del navegador:

- ✅ `Movimiento guardado en BD:` → Guardado exitoso
- ❌ `Error al guardar movimiento en BD:` → Error de conexión

Abre las DevTools (F12) para ver los logs.

---

## ⚠️ Notas importantes

- El juego **continúa funcionando** aunque falle el guardado en BD
- Los movimientos ilegales **NO** se envían al backend
- Todos los movimientos válidos se guardan automáticamente
