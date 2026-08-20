# Convenciones de frontend — `apps/web`

Front en JavaScript vanilla (ES modules). Estas reglas son obligatorias al crear o
modificar pantallas para mantener la consistencia visual entre módulos.

## 1. Iconos de grilla: SVG, nunca emoji ni Font Awesome

Los iconos de las **acciones y de las filas** de una grilla (ver/editar/eliminar y
cualquier acción de estado) deben ser **SVG** (estilo lucide). **Prohibido** usar
emoji (`🚫`, `✅`, …) o Font Awesome (`<i class="fa-solid ...">`) para esos iconos.

Reutilizar las constantes ya definidas en [js/utilidades.js](js/utilidades.js):

- `ICON_VER`, `ICON_EDITAR`, `ICON_ELIMINAR` — acciones CRUD estándar.
- `ICON_ENTREGAR`, `ICON_COBRAR`, `ICON_RECHAZAR`, `ICON_ANULAR`, `ICON_DEPOSITAR`,
  `ICON_ENDOSAR`, `ICON_DEVOLVER`, `ICON_ACREDITAR` — acciones de estado (cheques).
- `ICON_DIFERIDO` — indicador inline.

Los iconos de acción de estado usan `stroke="currentColor"`, así que el color se
aplica en el botón: `<button class="btn-icon" style="color:#dc2626">${ICON_RECHAZAR}</button>`.
Si hace falta un icono nuevo, agregarlo como constante SVG en `utilidades.js` (helper
`SVG(paths)`), no incrustar Font Awesome. Tomar los paths de https://lucide.dev.

> Nota: la ilustración grande del estado vacío (`.empty-state`) sí usa Font Awesome
> en todo el sistema; esta regla aplica a los iconos de acción/fila, no a esa ilustración.

## 2. Fechas en grilla: `formatearFecha`

Las fechas que llegan del backend como `yyyy-MM-dd` se muestran como `dd/MM/yyyy`
(ej. `20/08/2026`) usando `formatearFecha(fecha)` de `utilidades.js`. Guardar el caso
nulo: `const f = fecha ? formatearFecha(fecha) : ""`.

## 3. Importes: input de texto con formato por moneda

Los campos de importe son `type="text"` con el atributo `data-importe`, no `type="number"`.
El formateo por moneda (PYG sin decimales; otras con 2 decimales y coma) se activa con
`formatearImportes(moneda)` y se envía el número crudo con `quitarFormato(valor, moneda)`.
Para mostrar un importe guardado, `importeFormato(valor, moneda)`.

## 4. Cards con pestañas de alto fijo

Las pantallas con pestañas que deben tener alto fijo según el viewport (Datos Maestros,
Cheques) usan la clase `maestros-card`/`cheques-card` sobre `tim-card` (ver `css/style.css`):
alto `calc(100vh - 70px - 40px)`, la tabla scrollea internamente y la paginación queda
anclada abajo.
