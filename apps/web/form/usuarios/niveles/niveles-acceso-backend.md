# Módulo Niveles de Acceso

Documentación funcional y técnica para implementar el backend del módulo `Niveles de Acceso` según la interfaz actual del frontend.

Ubicación frontend relacionada:
- [niveles-acceso.html](/Users/macbookpro/Documents/Proyect_Front/MiSistema/form/configuraciones/usuarios/niveles-acceso.html)
- [niveles-acceso.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/form/configuraciones/usuarios/niveles-acceso.js)

## 1. Objetivo

El módulo permite:

1. Crear un nivel de acceso.
2. Asignar permisos por cada opción del sistema.
3. Configurar, por opción:
   - `view`
   - `create`
   - `update`
   - `delete`
4. Mantener un registro completo de todas las opciones disponibles del sistema en cada acceso.

El frontend hoy trabaja con una matriz completa de opciones. Cada acceso debe tener siempre todas las opciones del sistema, aunque sus permisos estén en `false`.

---

## 2. Estructura que espera el frontend

### 2.1 Objeto principal

El frontend trabaja con esta estructura:

```json
{
  "id": 1,
  "name": "Supervisor de Ventas",
  "description": "Puede operar ventas y consultar clientes",
  "active": true,
  "permissions": [
    {
      "key": "8H3J5N1",
      "module": "Dashboard",
      "option": "Dashboard",
      "view": true,
      "create": false,
      "update": false,
      "delete": false
    }
  ]
}
```

### 2.2 Campos esperados

#### Acceso
- `id`: `number`
- `name`: `string`
- `description`: `string | ""`
- `active`: `boolean`
- `permissions`: `AccessPermission[]`

#### Permiso por opción
- `key`: `string`
- `module`: `string`
- `option`: `string`
- `view`: `boolean`
- `create`: `boolean`
- `update`: `boolean`
- `delete`: `boolean`

---

## 3. Opciones actuales del sistema

Hoy el frontend maneja estas opciones:

| key | módulo | opción |
|---|---|---|
| `8H3J5N1` | Dashboard | Dashboard |
| `5F2V8A1` | Facturación Venta | Lista de Facturas |
| `5F2V8A2` | Facturación Venta | Nueva Factura |
| `7P9Q1R3` | Clientes | Lista de Clientes |
| `6B8C0D2` | Productos | Lista de Productos |
| `6B8C0D4` | Productos | Clasificación |
| `6B8C0D3` | Productos | Ajuste de Stock |
| `7P9Q1R4` | Configuración | Empresa |
| `7LOQ1G2` | Configuración | Definiciones |
| `3S5T7V9` | Usuarios | Usuarios del Sistema |
| `3S5T7V8` | Usuarios | Niveles de Acceso |
| `2H6I8S4` | Usuarios | Historial |

Esto puede crecer. En el nuevo modelo, el backend ya no depende de una tabla catálogo separada para las opciones; el identificador persistido pasa a ser `module_key`.

---

## 4. Diseño recomendado en PostgreSQL

La forma recomendada ahora es usar 2 tablas:

1. `access`
2. `access_level`

### 4.1 Tabla cabecera de accesos

```sql
CREATE TABLE IF NOT EXISTS public.access (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL UNIQUE,
    description     VARCHAR(255),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_active ON public.access(active);
```

### 4.2 Tabla detalle de permisos por opcion

`module_key` reemplaza a `system_option_id` y ya no tiene referencia foránea.

```sql
CREATE TABLE IF NOT EXISTS public.access_level (
    id                  BIGSERIAL PRIMARY KEY,
    access_id           BIGINT NOT NULL REFERENCES public.access(id) ON DELETE CASCADE,
    module_key          VARCHAR(20) NOT NULL,
    module_name         VARCHAR(100) NOT NULL,
    option_name         VARCHAR(150) NOT NULL,
    can_view            BOOLEAN NOT NULL DEFAULT FALSE,
    can_create          BOOLEAN NOT NULL DEFAULT FALSE,
    can_update          BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_access_module_key UNIQUE (access_id, module_key)
);

CREATE INDEX idx_access_level_access_id ON public.access_level(access_id);
CREATE INDEX idx_access_level_module_key ON public.access_level(module_key);
```

---

## 5. Datos iniciales recomendados

Ya no existe seed para `system_option`.

```sql
-- Sin seed obligatorio.
-- Las opciones llegan desde el frontend o desde otra fuente de configuración.
```

---

## 6. modelos sugeridos

## 6.1 AccessLevel

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessLevel {
    private String key;
    private String module;
    private String option;
    private boolean view;
    private boolean create;
    private boolean update;
    private boolean delete;
}
```

## 6.2 Access

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Access {
    private long id;
    private String name;
    private String description;
    private boolean active;
    private List<AccessLevel> permissions;
}
```

## 6.3 List DTO opcional

---

## 7. Contrato recomendado de API

Seguir el mismo patrón que ya usa el sistema:

- `list`
- `getById`
- `insert`
- `update`
- `delete`

Base path sugerido:

```text
/access
```

### 7.1 POST `/access/list`

Body:

```json
{
  "texto": "",
  "limit": 50,
  "offset": 0
}
```

Respuesta sugerida:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "error": null,
  "statusCode": 200,
  "timestamp": "2026-06-07T10:00:00",
  "totalRecords": 2,
  "objectsList": [
    {
      "id": 1,
      "name": "Supervisor de Ventas",
      "description": "Puede operar ventas y consultar clientes",
      "active": true
    }
  ],
  "data": null
}
```

### 7.2 GET `/access/getById?id=1`

Respuesta esperada por frontend:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Supervisor de Ventas",
    "description": "Puede operar ventas y consultar clientes",
    "active": true,
    "permissions": [
      {
        "key": "8H3J5N1",
        "module": "Dashboard",
        "option": "Dashboard",
        "view": true,
        "create": false,
        "update": false,
        "delete": false
      }
    ]
  }
}
```

### 7.3 POST `/access/insert`

Body:

```json
{
  "name": "Supervisor de Ventas",
  "description": "Puede operar ventas y consultar clientes",
  "active": true,
  "permissions": [
    {
      "key": "8H3J5N1",
      "module": "Dashboard",
      "option": "Dashboard",
      "view": true,
      "create": false,
      "update": false,
      "delete": false
    }
  ]
}
```

Notas:
- `id` debe enviarse en insert como 0.

### 7.4 PUT `/access/update`

Body:

```json
{
  "id": 1,
  "name": "Supervisor de Ventas",
  "description": "Actualizado",
  "active": true,
  "permissions": [
    {
      "key": "8H3J5N1",
      "module": "Dashboard",
      "option": "Dashboard",
      "view": true,
      "create": false,
      "update": false,
      "delete": false
    }
  ]
}
```

### 7.5 DELETE `/access/delete?id=1`

Debe borrar:
- el acceso
- todos sus permisos relacionados

Como la FK usa `ON DELETE CASCADE`, eso ya queda cubierto desde base.

---

## 8. Lógica de negocio recomendada

## 8.1 Insert

Pasos sugeridos:

1. Validar que `name` no esté repetido.
2. Insertar en `access`.
3. Cruzar contra `permissions` recibidos.
4. Insertar una fila en `access_level` por cada opción del sistema.

## 8.2 Update

Pasos sugeridos:

1. Validar que el `id` exista.
2. Validar unicidad de `name` excluyendo el mismo registro.
3. Actualizar cabecera en `access`.
4. El enfoque más simple y limpio:
   - borrar permisos actuales del acceso
   - reconstruir todos los permisos usando `module_key`
5. Insertar nuevamente todas las filas del acceso.

Este mismo patrón ya lo estás usando en otros lugares donde el detalle se reemplaza completo, y acá encaja muy bien.

## 8.3 GetById

Debe devolver siempre:
- el acceso
- todas las opciones

## 8.4 Delete

Solo elimina el acceso.

---

## 9. Diseño sugerido de capas

## 9.1 Controller

```java
@RestController
@RequestMapping("/access")
@RequiredArgsConstructor
public class AccessController {

    private final AccessService accessService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<AccessLevelListItemDto>> list(@RequestBody DefaultFilter filtro) {
        return accessService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<AccessLevelDto>> getById(@RequestParam long id) {
        return accessService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<AccessLevelDto>> insert(@RequestBody AccessLevelDto dto) {
        return accessService.insert(dto);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<AccessLevelDto>> update(@RequestBody AccessLevelDto dto) {
        return accessService.update(dto);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Void>> delete(@RequestParam long id) {
        return accessService.delete(id);
    }
}
```

## 9.2 Service

```java
public interface AccessService {
    ResponseEntity<DefaultResponse<AccessLevelListItemDto>> list(DefaultFilter filtro);
    ResponseEntity<DefaultResponse<AccessLevelDto>> getById(long id);
    ResponseEntity<DefaultResponse<AccessLevelDto>> insert(AccessLevelDto dto);
    ResponseEntity<DefaultResponse<AccessLevelDto>> update(AccessLevelDto dto);
    ResponseEntity<DefaultResponse<Void>> delete(long id);
}
```

## 9.3 Repository / implementación

Si sigues el estilo actual del proyecto con JDBC manual:

- `AccessImpl`
- `AccessLevelImpl`

Métodos recomendados:
- `list(DefaultFilter filtro)`
- `getById(long id)`
- `insert(AccessLevelDto dto)`
- `update(AccessLevelDto dto)`
- `delete(long id)`
- `insertPermissions(long accessId, List<AccessLevelPermissionDto> permissions, Connection conn)`
- `deletePermissionsByAccess(long accessId, Connection conn)`

---

## 10. Query recomendada para getById

La idea es que el backend devuelva todas las opciones persistidas para el acceso. Si el frontend maneja una matriz más amplia, esa matriz puede completarse en backend antes de responder.

```sql
SELECT
    al.module_key,
    al.module_name,
    al.option_name,
    al.can_view,
    al.can_create,
    al.can_update,
    al.can_delete
FROM public.access_level al
WHERE al.access_id = :accessId
ORDER BY al.module_name, al.option_name;
```

---

## 11. Validaciones mínimas

## 11.1 Acceso
- `name` obligatorio
- `name` único
- `name` máximo 120 caracteres
- `description` máximo 255 caracteres

## 11.2 Permisos
- `key` obligatorio
- `key` se persistirá en `module_key`
- no debe haber duplicados de `key` dentro del mismo request

## 11.3 Reglas de negocio
- el acceso debe persistirse con todas las opciones del sistema
- si el request no manda una opción, el backend igual debe generarla en `false`
- si luego se crea una nueva opción del sistema, el backend debe poder incorporarla en la reconstrucción del detalle aunque el acceso sea viejo

---

## 12. Recomendación futura de relación con usuario

Si luego vas a enlazar usuarios con accesos, la tabla usuario debería tener algo así:

```sql
ALTER TABLE public.usuario
ADD COLUMN access_id BIGINT REFERENCES public.access(id);
```

Con eso un usuario hereda permisos desde su acceso.

---

## 13. Qué espera exactamente el frontend hoy

Hoy el frontend:

1. necesita abrir una pantalla de listado;
2. necesita abrir modal para crear o editar;
3. espera poder cargar un acceso completo con su matriz de permisos;
4. trabaja sobre una lista completa de opciones del sistema;
5. hoy persiste localmente, pero puede reemplazarse por API sin cambiar la UX.

Para alinearlo con API, el frontend solo necesitaría:

- `list`
- `getById`
- `insert`
- `update`
- `delete`

y opcionalmente:

---

## 14. Recomendación de implementación

La implementación más estable sería:

1. crear `access`
2. crear `access_level`
3. implementar DTOs
4. implementar controller + service + JDBC
5. luego conectar frontend reemplazando `localStorage` por API

---

## 15. Resumen corto

Backend recomendado:

- tabla maestra de accesos
- tabla detalle de permisos por acceso y opción

El frontend espera:

- un acceso con `id`, `name`, `description`, `active`
- un arreglo `permissions`
- cada permiso con `key`, `module`, `option`, `view`, `create`, `update`, `delete`

El punto importante es este:

> cada acceso debe devolver siempre todas las opciones del sistema, aunque todas estén en `false`
