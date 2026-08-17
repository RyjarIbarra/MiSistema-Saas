# Venta - Endpoint para obtener precio de producto

## Objetivo

En el módulo **Nueva Factura**, el modal de productos solo se usa para seleccionar el producto.

El precio **no** debe venir dentro del endpoint de listado de stock detallado, porque el precio depende del contexto comercial de la venta:

- producto seleccionado
- tipo de precio
- moneda

Por eso el frontend necesita un endpoint separado para consultar el precio del producto una vez que el usuario lo selecciona en el modal.

---

## Endpoint sugerido

- `POST /producto/precioVenta`

## Request esperado

```json
{
  "productoId": 15,
  "tipoPrecio": 1,
  "moneda": "PYG"
}
```

## Campos

| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| `productoId` | long | sí | id del producto seleccionado |
| `tipoPrecio` | integer | sí | tipo de precio a consultar |
| `moneda` | string | sí | por ejemplo `PYG`, `USD` |

---

## Response esperada

Esta respuesta debera ser siempre la respuesta por defecto que maneja el backend.
```json
{
  "success": true,
  "message": "Operación exitosa",
  "error": null,
  "statusCode": 200,
  "timestamp": "2026-07-25T10:00:00",
  "objectList": [
    {
      "productoId": 15,
      "tipoPrecio": 1,
      "moneda": "PYG",
      "precio": 125000,
      "iva": 10
    }
  ],
  "data": null
}
```

## Campos de respuesta

| Campo | Tipo | Nota |
|---|---|---|
| `productoId` | long | producto consultado |
| `tipoPrecio` | integer | tipo de precio aplicado |
| `moneda` | string | moneda aplicada |
| `precio` | decimal | precio de venta encontrado |
| `iva` | integer / decimal | IVA del producto |

---

## Modelo sugerido

### Request

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaPrecioProductoRequestDto {
    private Long productoId;
    private Integer tipoPrecio;
    private String moneda;
}
```

### Response

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaPrecioProductoDto {
    private Long productoId;
    private Integer tipoPrecio;
    private String moneda;
    private BigDecimal precio;
    private BigDecimal iva;
}
```

---

## Lógica esperada

1. validar que `productoId` exista
2. validar que `tipoPrecio` venga informado o no, por defecto será 1
3. validar que `moneda` venga informada
4. buscar en la tabla de precios del producto la fila que coincida con:
   - `productoId`
   - `tipoPrecio`
   - `moneda`
5. devolver un listado de precios encontrado segun la condición de request
6. devolver también el IVA del producto

---

## Si no existe precio

Si no existe una configuración de precio para esa combinación, devolver error controlado.

### Ejemplo

```json
{
  "success": false,
  "error": "No existe precio configurado para el producto, tipo de precio y moneda seleccionados."
}
```

---

## SQL conceptual

La idea de búsqueda sería algo equivalente a:

```sql
SELECT
    p.proid AS producto_id,
    pp.tipo AS tipo_precio,
    pp.moneda,
    pp.precio,
    p.tasa_iva AS iva
FROM public.producto p
INNER JOIN public.producto_precio pp
    ON pp.producto_id = p.proid
WHERE
    p.proid = :productoId
    AND (pp.tipo IS NULL OR pp.tipo = :tipoPrecio)
    AND pp.moneda = :moneda
    AND COALESCE(pp.estado, TRUE) = TRUE
LIMIT 1;
```

El nombre real de la tabla de precios puede variar según cómo quedó tu backend.

---

## Qué espera el frontend

Cuando el usuario selecciona un producto en el modal:

1. el frontend guarda `productoId`
2. llama a este endpoint
3. con la respuesta completa automáticamente:
   - el campo `precio`
   - el IVA del ítem

De esta forma el modal de productos sigue siendo reutilizable y el cálculo del precio queda desacoplado del buscador.
