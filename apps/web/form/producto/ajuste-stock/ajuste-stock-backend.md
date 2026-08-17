# Ajuste de Stock - Backend

## Objetivo

El módulo **Ajuste de Stock** del frontend trabaja con una estructura **cabecera / detalle**.

Se necesita implementar en backend:

1. tablas en PostgreSQL
2. modelos
3. endpoints básicos
4. lógica de guardado del ajuste
5. impacto sobre stock

El ajuste puede tener movimientos de:

- `DESCUENTO`
- `AUMENTO`

Cada ajuste tiene:

- una cabecera con fecha, motivo y depósito
- uno o varios productos en el detalle

---

## 1. Estructura en PostgreSQL

Las tablas `public.ajuste_stock` (cabecera) y `public.ajuste_stock_detalle` (detalle) junto con sus índices y constraints **ya están creadas en el archivo `SCHEMA_SQL.java`** del backend. Se crean automáticamente al instanciar la BD de un nuevo tenant.

Referencias rápidas de las columnas relevantes para el backend:

| Tabla | Columnas clave |
|---|---|
| `ajuste_stock` | `ajstid`, `ajstfecha`, `ajstdep_id` (FK → `deposito.depid`), `ajstmotivo`, `ajstestado` (`BORRADOR` / `CONFIRMADO` / `ANULADO`) |
| `ajuste_stock_detalle` | `ajstdid`, `ajstdajst_id` (FK → `ajuste_stock.ajstid`, `ON DELETE CASCADE`), `ajstdpro_id` (FK → `producto.proid`), `ajstdtipo` (`DESCUENTO` / `AUMENTO`), `ajstdstock_actual`, `ajstdcantidad`, `ajstdstock_result` |

Constraints de negocio ya aplicadas:
- `chk_ajstestado` — estado válido.
- `chk_ajstdtipo` — tipo de movimiento válido.
- `chk_ajstdcantidad` — cantidad estrictamente > 0.

---

## 2. Observación importante sobre stock

El frontend hoy carga el stock actual solo como referencia visual.

La **verdad del stock** debe calcularla el backend.

Por eso, al guardar:

1. el backend debe volver a consultar el stock real del producto
2. validar si el `DESCUENTO` no supera el stock disponible
3. calcular el stock resultante real
4. guardar el detalle
5. actualizar el stock

No conviene confiar ciegamente en `stock_actual` ni `stock_resultante` enviados desde el front.

Se pueden guardar igual en el detalle como snapshot histórico, pero el cálculo final debe hacerlo backend.

---

## 3. Modelos sugeridos

## 3.1 Entidad cabecera

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStock {
    private long ajstid;
    private LocalDate ajstfecha;
    private long ajstdep_id;
    private String ajstmotivo;
    private String ajstestado;
    private OffsetDateTime ajstcreated_at;
    private OffsetDateTime ajstupdated_at;
}
```

## 3.2 Entidad detalle

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockDetalle {
    private long ajstdid;
    private long ajstdajst_id;
    private long ajstdpro_id;
    private String ajstdtipo;
    private BigDecimal ajstdstock_actual;
    private BigDecimal ajstdcantidad;
    private BigDecimal ajstdstock_result;
    private OffsetDateTime ajstdcreated_at;
}
```

## 3.3 Request para insert/update

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockRequestDto {
    private Long ajstid;
    private LocalDate fecha;
    private Long depositoId;
    private String motivo;
    private List<AjusteStockDetalleRequestDto> detalle;
}
```

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockDetalleRequestDto {
    private Long productoId;
    private String tipoMovimiento;   // DESCUENTO | AUMENTO
    private BigDecimal cantidad;
}
```

## 3.4 DTO para grilla principal

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockListItemDto {
    private long ajstid;
    private LocalDate fecha;
    private long depositoId;
    private String deposito;
    private String descripcion;
    private int cantidadProductos;
    private BigDecimal totalMovimiento;
    private int descuentos;
    private int aumentos;
}
```

## 3.5 DTO para getById

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockDetalleItemDto {
    private long detalleId;
    private long productoId;
    private String codigo;
    private String producto;
    private String tipoMovimiento;
    private BigDecimal stockActual;
    private BigDecimal cantidad;
    private BigDecimal stockResultante;
}
```

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockGetByIdDto {
    private long ajstid;
    private LocalDate fecha;
    private long depositoId;
    private String deposito;
    private String motivo;
    private List<AjusteStockDetalleItemDto> detalle;
}
```

---

## 4. Endpoints sugeridos

Base:

`ajusteStock/`

### 4.1 Listado

`POST /ajusteStock/list`

Request:

```json
{
  "texto": "",
  "limit": 90,
  "offset": 0
}
```

Debe devolver `DefaultResponse<AjusteStockListItemDto>`.

### 4.2 Obtener por id

`GET /ajusteStock/getById/{id}`

o si seguís tu estilo actual:

`GET /ajusteStock/getById?id=1`

Debe devolver cabecera + detalle.

### 4.3 Insertar

`POST /ajusteStock/insert`

Request:

```json
{
  "fecha": "2026-07-17",
  "depositoId": 2,
  "motivo": "Ajuste por diferencia de inventario",
  "detalle": [
    {
      "productoId": 125,
      "tipoMovimiento": "DESCUENTO",
      "cantidad": 2
    },
    {
      "productoId": 230,
      "tipoMovimiento": "AUMENTO",
      "cantidad": 5
    }
  ]
}
```

### 4.4 Actualizar

`PUT /ajusteStock/update`

Mismo modelo, incluyendo `ajstid`.

### 4.5 Eliminar o anular

Acá recomiendo **anular** y no borrar físicamente, porque afecta stock histórico.

Opción sugerida:

`PUT /ajusteStock/anular`

Request:

```json
{
  "ajstid": 15
}
```

Al anular:

1. revertir el movimiento de stock
2. marcar cabecera como `ANULADO`

---

## 5. Lógica de negocio recomendada

## 5.1 Insert

Al insertar un ajuste:

1. validar cabecera
2. validar que exista al menos un detalle
3. recorrer detalle
4. por cada producto:
   - consultar stock real
   - validar existencia
   - si es `DESCUENTO`, validar stock suficiente
   - calcular stock resultante
5. insertar cabecera
6. insertar detalle
7. actualizar stock de producto
8. confirmar transacción completa

Todo esto debe ir en una sola transacción.

---

## 5.2 Update

Si se permite editar un ajuste ya guardado:

1. traer ajuste original
2. revertir el impacto de stock del detalle anterior
3. aplicar validaciones del nuevo detalle
4. recalcular stock
5. reemplazar detalle completo
6. volver a aplicar impacto del nuevo ajuste

Esto también debe ser transaccional.

Si querés simplificar la primera versión, podés:

- permitir solo insert
- permitir solo anulación después
- no permitir update

Eso reduce mucho riesgo.

---

## 5.3 Recomendación práctica

Para una primera etapa estable:

1. `list`
2. `getById`
3. `insert`
4. `anular`

y dejar `update` para una segunda etapa.

---

## 6. SQL conceptual de listado

La grilla principal del frontend necesita:

- fecha
- motivo
- cantidad de productos
- total de movimiento
- resumen descuentos / aumentos

Consulta conceptual:

```sql
SELECT
    a.ajstid,
    a.ajstfecha AS fecha,
    a.ajstdep_id AS deposito_id,
    dep.depnom AS deposito,
    a.ajstmotivo AS descripcion,
    COUNT(d.ajstdid) AS cantidad_productos,
    COALESCE(SUM(d.ajstdcantidad), 0) AS total_movimiento,
    COUNT(*) FILTER (WHERE d.ajstdtipo = 'DESCUENTO') AS descuentos,
    COUNT(*) FILTER (WHERE d.ajstdtipo = 'AUMENTO') AS aumentos
FROM public.ajuste_stock a
INNER JOIN public.deposito dep
    ON dep.depid = a.ajstdep_id
LEFT JOIN public.ajuste_stock_detalle d
    ON d.ajstdajst_id = a.ajstid
WHERE
    (
        COALESCE(:texto, '') = ''
        OR UPPER(a.ajstmotivo) LIKE UPPER(CONCAT('%', :texto, '%'))
    )
GROUP BY
    a.ajstid,
    a.ajstfecha,
    a.ajstdep_id,
    dep.depnom,
    a.ajstmotivo
ORDER BY
    a.ajstfecha DESC,
    a.ajstid DESC
LIMIT :limit OFFSET :offset;
```

---

## 7. Qué espera hoy el frontend al guardar

Actualmente el frontend trabaja con esta idea:

```json
{
  "fecha": "2026-07-17",
  "depositoId": 2,
  "descripcion": "Ajuste por diferencia de inventario",
  "detalle": [
    {
      "productoId": 15,
      "codigo": "15",
      "descripcion": "Coca-Cola 1.5L",
      "tipoMovimiento": "DESCUENTO",
      "stockActual": 38,
      "cantidad": 2,
      "stockResultante": 36
    }
  ]
}
```

Pero para backend yo recomiendo recibir una versión más limpia:

```json
{
  "fecha": "2026-07-17",
  "depositoId": 2,
  "motivo": "Ajuste por diferencia de inventario",
  "detalle": [
    {
      "productoId": 15,
      "tipoMovimiento": "DESCUENTO",
      "cantidad": 2
    }
  ]
}
```

Eso es mejor porque:

- evita confiar en cálculos del front
- reduce payload
- hace más segura la lógica

---

## 8. Estructura correcta del depósito

El depósito ya forma parte de la **cabecera del ajuste**, no del detalle.

Eso significa que:

- un ajuste completo se realiza sobre un solo depósito
- todos los productos del detalle pertenecen a ese mismo depósito
- el backend debe validar que el stock consultado para cada producto corresponda al `depositoId` de la cabecera

Por lo tanto:

- `depositoId` debe venir en `AjusteStockRequestDto`
- `ajstdep_id` debe guardarse en `ajuste_stock`
- `ajuste_stock_detalle` no necesita columna de depósito, salvo que en el futuro se quiera permitir mezclar varios depósitos dentro de un mismo ajuste, cosa que hoy no aplica

---

## 9. Resumen corto

Tablas (ya creadas en `SCHEMA_SQL.java`):

1. `ajuste_stock`
2. `ajuste_stock_detalle`

Backend debe implementar como mínimo:

1. `POST /ajusteStock/list`
2. `GET /ajusteStock/getById`
3. `POST /ajusteStock/insert`
4. `PUT /ajusteStock/anular`

Y debe manejar el impacto en stock por depósito dentro de una transacción.
