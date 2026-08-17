# Reglas de arquitectura y negocio — `apps/api`

Backend principal (Spring Boot, JDBC manual). Estas reglas son obligatorias al
agregar o modificar código. Están pensadas para mantener el sistema desacoplado
y las transacciones correctas.

## 1. Cada dominio es dueño de su(s) tabla(s)

Cada `*Impl` administra **solo** las tablas de su dominio:

- `ClienteImpl` → `public.cliente`
- `DocumentoImpl` → `public.documento`, `public.documento_detalle`
- `ProductoImpl` → `public.producto`, etc.

**Prohibido:** que una implementación haga `INSERT`/`UPDATE`/`DELETE` (o lógica de
alta/edición) sobre la tabla de otro dominio. Ejemplo de lo que NO se hace:
facturación (`DocumentoImpl`) insertando directamente en `public.cliente`.

Las lecturas puntuales por `JOIN` dentro de una consulta propia están permitidas;
lo que no se permite es **modificar** datos de otro dominio por fuera de su `Impl`.

## 2. Acceso entre dominios: por inyección de dependencias

Cuando un dominio necesita una operación de otro, la usa a través de la **interfaz
`Service`** del otro dominio, inyectada con `private final`:

```java
@Service
@RequiredArgsConstructor
public class DocumentoImpl implements DocumentoService {
    private final DataSourceManager dsManager;
    private final ClienteService clienteService;   // ← se usa por inyección, no se toca la tabla
    ...
    long cliid = clienteService.resolverClienteId(conn, ruc, razon);
}
```

- La implementación llamada (`ClienteImpl`) lleva `@Service`.
- La dependencia se declara como `private final <Interfaz>Service` y la inyecta
  Lombok vía `@RequiredArgsConstructor` (no usar `@Autowired` en campos).

## 3. Transacciones: pasar la `Connection`

El proyecto maneja transacciones a mano (`conn.setAutoCommit(false)` +
`commit`/`rollback`). Si una operación de otro dominio debe formar parte de la
transacción del llamador, el método recibe la `Connection` y **no abre una propia**:

```java
// En ClienteService
long resolverClienteId(Connection conn, String cliruc, String clinom) throws SQLException;
```

Así, si el documento falla y hace `rollback`, el alta del cliente también se revierte.
Si la operación es independiente (no transaccional), puede abrir su propia conexión
con `dsManager.getDataSource()`.

## 4. Convenciones existentes a respetar

- Un `Controller` → un `Service` (interfaz) → un `Impl`.
- Conexiones vía `DataSourceManager` (multi-tenant, resuelve la BD del tenant por JWT).
- Respuestas con `ResponseBuilder` y `DefaultResponse`.
- Logs con `@Slf4j`.

---

### Historial de decisiones

- **Alta de cliente desde facturación:** el método que resuelve/crea el cliente por
  RUC vivía como método privado en `DocumentoImpl` e insertaba en `public.cliente`.
  Se movió a `ClienteImpl.resolverClienteId(Connection, ruc, nombre)` y `DocumentoImpl`
  lo consume por inyección de `ClienteService`, respetando la regla 1.
