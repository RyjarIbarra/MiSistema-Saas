# MiSistema SaaS — monorepo

Sistema SaaS multi-tenant. Tres apps desplegables + dos bases Postgres, orquestado
con un solo `docker-compose.yml`.

```
MiSistemaSaas/
├── apps/
│   ├── web/       # front vanilla (HTML/CSS/JS) + nginx — unico puerto expuesto
│   ├── api/       # Spring Boot — CRUD, auth, negocio (context-path /pdv)
│   └── reports/   # Spring Boot + JasperReports — solo lectura + PDFs (context-path /report)
├── docker-compose.yml
├── .env           # NO se commitea
├── .env.example
└── README.md
```

## Arquitectura de datos (multi-tenant)

- **`db-admin`** aloja la base central **`LicenciasMS`** (tablas `licencias`, `usuarios`).
  `api` y `reports` se conectan siempre aca primero (via `ConnectionU`).
- **`db-clientes`** aloja las bases de cada cliente (tenant). En cada request, el backend
  lee de la tabla `licencias` el `db_host/db_port/db_user/db_password` del tenant y abre
  un pool a esa base (via `DataSourceManager`).

> ⚠️ Los registros de la tabla `licencias` deben tener **`db_host = 'db-clientes'`** para
> que los backends encuentren las bases de tenant dentro de Docker. Ver "Restaurar bases".

## Puertos

| Servicio      | Dentro de Docker | Publicado en tu Mac |
| ------------- | ---------------- | ------------------- |
| `web` (nginx) | 80               | **80** → http://localhost |
| `api`         | 9095             | 9095 (solo dev)     |
| `reports`     | 9096             | 9096 (solo dev)     |
| `db-admin`    | 5432             | **5433**            |
| `db-clientes` | 5432             | **5434**            |

`5433/5434` evitan chocar con tu Postgres local del Mac (que usa 5432).

## Puesta en marcha

1. Crear el `.env` (ya incluido con defaults; ajustar si hace falta):

   ```bash
   cp .env.example .env   # si no existe
   ```

2. Levantar solo las bases y restaurar tus dumps (ver abajo):

   ```bash
   docker compose up -d db-admin db-clientes
   ```

3. Levantar todo:

   ```bash
   docker compose up -d --build
   ```

4. Abrir http://localhost

## Restaurar bases (dumps `.sql` de tu Postgres local)

Las bases se restauran a mano desde tu Mac apuntando a los puertos publicados.

```bash
# Base central del administrador -> db-admin (5433)
psql -h localhost -p 5433 -U macbookpro -d LicenciasMS -f /ruta/al/dump_admin.sql

# Base de un cliente -> db-clientes (5434). Crear la DB antes si el dump no la crea.
createdb -h localhost -p 5434 -U macbookpro nombre_db_cliente
psql -h localhost -p 5434 -U macbookpro -d nombre_db_cliente -f /ruta/al/dump_cliente.sql
```

Despues de restaurar la central, corregir los hosts de los tenants para que apunten al
contenedor y no a `localhost`:

```sql
-- conectarse a LicenciasMS (db-admin, 5433) y ejecutar:
UPDATE licencias SET db_host = 'db-clientes' WHERE db_host IN ('localhost', '127.0.0.1');
-- las que tengan IP 192.168.x se revisan una a una segun donde viva cada base.
```

## Convencion de rutas (nginx)

Todo pasa por nginx (mismo origen → sin CORS):

| Ruta del navegador | Va a                        |
| ------------------ | --------------------------- |
| `/pdv/...`         | `api:9095/pdv/...`          |
| `/api/...`         | `api:9095/pdv/...` (alias)  |
| `/report/...`      | `reports:9096/report/...`   |

El front usa rutas relativas (`/pdv/`, `/report/`) en `apps/web/js/apiService.js`.

## Comandos utiles

```bash
docker compose up -d --build         # levantar todo
docker compose logs -f reports       # logs de un servicio
docker compose up -d --build api     # redeployar solo la api
docker compose down                  # apagar (conserva datos)
docker compose down -v               # apagar y BORRAR las bases (volumenes)
```

## Riesgos / notas conocidas

- **JWT hardcodeado y duplicado.** El `SECRET_KEY` esta escrito igual en
  `apps/api/.../Config/JwtService.java` y `apps/reports/.../Config/JwtService.java`.
  Si cambia el secret, el algoritmo o la estructura de claims, **hay que tocar los dos**.
  (Mejora futura: leerlo de una variable de entorno compartida.)
- **`fact` (facturacion electronica) es una API aparte.** El front llama a
  `localhost:9097/fact/...` en `apiService.js`. Ese servicio NO es parte de este SaaS ni
  de este compose; funciona independiente.
- **App de administracion de licencias:** pendiente. Ira en su propio repo y se conectara
  a `db-admin` (`LicenciasMS`).
- Los puertos de `api`, `reports`, `db-admin` y `db-clientes` son de desarrollo. En
  produccion se dejan solo el 80/443 de nginx.
- `dev`: podes correr los backends desde IntelliJ contra las bases del compose
  (`docker compose up -d db-admin db-clientes`); sin variables de entorno, `ConnectionU`
  usa `config.properties` (localhost).
