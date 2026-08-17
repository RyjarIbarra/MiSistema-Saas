# ModalProducto - Requisitos Backend

## Objetivo

El frontend ahora usa un componente reusable `ModalProducto.js` para listar productos dentro de un modal con carga incremental por scroll.

El endpoint utilizado es:

`POST /producto/stockDetallado/list`

## Comportamiento esperado por el frontend

El frontend envía un `DefaultFilter` con:

```json
{
  "texto": "coca",
  "limit": 500,
  "offset": 0
}
```

Luego vuelve a llamar con:

```json
{
  "texto": "coca",
  "limit": 500,
  "offset": 500
}
```

y así sucesivamente.

## Requisitos importantes del endpoint

### 1. Debe respetar `limit` y `offset`

Esto es obligatorio para que el scroll incremental funcione bien.

### 2. Debe devolver `totalRecords`

El frontend usa `totalRecords` para saber si todavía hay más productos por cargar.

### 3. Debe aplicar un orden fijo y determinístico

Muy importante.

Si el backend no ordena siempre igual, el frontend puede:

- repetir productos
- saltear productos
- mezclar el orden entre una carga y otra

Se recomienda ordenar por ejemplo por:

```sql
ORDER BY prodesc ASC, proid ASC
```

o cualquier orden fijo estable.

### 4. El filtro `texto` debe buscar al menos por

- código
- descripción

Idealmente también por GTIN o código de barras si existe.

## Campos que el frontend espera

El frontend hoy soporta varios nombres por compatibilidad, pero lo ideal es devolver estos:

```json
{
  "proid": 15,
  "procod": "P00015",
  "prodesc": "Coca-Cola 1.5L",
  "stock_actual": 38
}
```

## Respuesta esperada

```json
{
  "success": true,
  "objectsList": [
    {
      "proid": 15,
      "procod": "P00015",
      "prodesc": "Coca-Cola 1.5L",
      "stock_actual": 38
    }
  ],
  "totalRecords": 1248
}
```

## Recomendación de performance

Como el frontend carga de 500 en 500:

- el query debe usar paginación real en SQL
- el filtro `texto` debe estar optimizado
- si la vista `VStockDetallado` es pesada, conviene revisar índices sobre las columnas usadas en búsqueda y orden

## Resumen

Para que el componente reusable funcione correctamente en todo el sistema, el backend debe garantizar:

1. `limit`
2. `offset`
3. `totalRecords`
4. búsqueda por `texto`
5. orden fijo estable
