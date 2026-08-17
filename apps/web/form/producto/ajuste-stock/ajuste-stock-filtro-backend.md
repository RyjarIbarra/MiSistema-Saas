# Ajuste de Stock - Filtro personalizado para listado

## Objetivo

La grilla principal de Ajuste de Stock ya no debe filtrar en el front.

Ahora el frontend envía los filtros al backend para que:

- la fecha se filtre en base de datos
- el depósito se filtre en base de datos
- la paginación sea real desde SQL

---

## Endpoint a ajustar

`POST /ajusteStock/list`

---

## Nuevo request esperado

```json
{
  "texto": "",
  "fecha": "2026-07-18",
  "depositoId": 2,
  "limit": 10,
  "offset": 0
}
```

## Reglas

- `texto`: por ahora puede seguir viniendo vacío
- `fecha`: nullable
- `depositoId`: nullable
- `limit`: obligatorio
- `offset`: obligatorio

Si `fecha` viene `null`, no debe filtrar por fecha.

Si `depositoId` viene `null`, no debe filtrar por depósito.

---

## Ejemplos válidos

### Sin filtros

```json
{
  "texto": "",
  "fecha": null,
  "depositoId": null,
  "limit": 10,
  "offset": 0
}
```

### Solo fecha

```json
{
  "texto": "",
  "fecha": "2026-07-18",
  "depositoId": null,
  "limit": 10,
  "offset": 0
}
```

### Solo depósito

```json
{
  "texto": "",
  "fecha": null,
  "depositoId": 3,
  "limit": 10,
  "offset": 0
}
```

### Fecha + depósito

```json
{
  "texto": "",
  "fecha": "2026-07-18",
  "depositoId": 3,
  "limit": 10,
  "offset": 20
}
```

---

## Recomendación de modelo

Si hoy el backend usa `DefaultFilter`, conviene crear uno específico para esta grilla.

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockFilterDto {
    private String texto;
    private LocalDate fecha;
    private Long depositoId;
    private Integer limit;
    private Integer offset;
}
```

---

## SQL conceptual

```sql
SELECT
    a.ajstid,
    a.ajstfecha AS fecha,
    a.ajstdep_id AS deposito_id,
    dep.depnom AS deposito,
    a.ajstmotivo AS descripcion,
    COUNT(d.ajstdid) AS cantidad_productos,
    COALESCE(SUM(d.ajstdcantidad), 0) AS total_movimiento,
    COUNT(*) FILTER (WHERE d.ajstdtipo = 'SALIDA') AS salidas,
    COUNT(*) FILTER (WHERE d.ajstdtipo = 'ENTRADA') AS entradas,
    a.ajstestado AS estado
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
    AND (:fecha IS NULL OR a.ajstfecha = :fecha)
    AND (:depositoId IS NULL OR a.ajstdep_id = :depositoId)
GROUP BY
    a.ajstid,
    a.ajstfecha,
    a.ajstdep_id,
    dep.depnom,
    a.ajstmotivo,
    a.ajstestado
ORDER BY
    a.ajstfecha DESC,
    a.ajstid DESC
LIMIT :limit OFFSET :offset;
```

---

## Count para totalRecords

El `totalRecords` debe salir con los mismos filtros de `fecha` y `depositoId`.

No debe contarse después del `LIMIT/OFFSET`.

---

## Lo que espera el front

El frontend ya quedó preparado para enviar:

- `fecha`
- `depositoId`
- `limit`
- `offset`

Y espera seguir recibiendo:

```json
{
  "success": true,
  "totalRecords": 42,
  "objectsList": [
    {
      "ajstid": 15,
      "fecha": "2026-07-18",
      "depositoId": 2,
      "deposito": "Deposito - Casa Central",
      "descripcion": "Ajuste por diferencia de inventario",
      "cantidadProductos": 3,
      "totalMovimiento": 12.5,
      "salidas": 2,
      "entradas": 1,
      "estado": "CONFIRMADO"
    }
  ]
}
```

---

## Resultado esperado

Con este ajuste:

- el filtro de fecha deja de hacerse en JS
- el filtro de depósito deja de hacerse en JS
- la paginación del listado queda soportada directamente por la base de datos
