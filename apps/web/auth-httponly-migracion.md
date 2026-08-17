# Migracion a autenticacion con cookie HttpOnly

## Objetivo

Documentar la migracion futura del sistema actual de autenticacion basado en `sessionStorage` hacia un esquema con cookie `HttpOnly` para el token de sesion.

Esta etapa **no se implementa ahora**. Este archivo sirve como guia funcional y tecnica para cuando se haga la migracion.

---

## Estado actual

Hoy el frontend hace esto al iniciar sesion:

```js
sessionStorage.setItem('token', response.data.itoken);
sessionStorage.setItem('username', response.data.username);
sessionStorage.setItem('rol', response.data.rol);
sessionStorage.setItem('email', response.data.email);
sessionStorage.setItem('userMenu', JSON.stringify(response.data.menu || []));
```

Y luego el frontend envia el token en cada request asi:

```js
headers["Authorization"] = `Bearer ${token}`;
```

### Problema del esquema actual

- El token queda accesible desde JavaScript.
- Si existe una vulnerabilidad XSS, el token puede ser robado.
- El usuario puede ver facilmente el token en `sessionStorage`.
- La autenticacion depende de logica manual del frontend.

---

## Objetivo de seguridad

Mover el token JWT a una cookie:

- `HttpOnly`
- `Secure`
- `SameSite=Lax` o `SameSite=Strict` segun necesidad

De esta forma:

- El navegador guarda el token automaticamente.
- El navegador envia el token automaticamente al backend.
- JavaScript no puede leer el token.
- Se reduce el riesgo de robo del token por XSS.

---

## Resultado esperado

### Despues de la migracion

- El backend ya no necesita devolver `itoken` para que el frontend lo guarde.
- El frontend ya no debe guardar token en `sessionStorage`.
- El frontend debe seguir pudiendo usar:
  - `username`
  - `rol`
  - `email`
  - `menu`
- El backend debe autenticar leyendo la cookie del request.
- El logout debe invalidar la cookie.

---

## Flujo funcional esperado

### 1. Login

#### Frontend envia:

```http
POST /auth/sign_in
Content-Type: application/json
```

```json
{
  "email": "usuario@correo.com",
  "password": "secreto"
}
```

#### Backend responde:

- Cookie `HttpOnly` con el token
- JSON con datos de usuario y menu

Ejemplo conceptual:

```http
Set-Cookie: access_token=jwt_aqui; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800
```

```json
{
  "success": true,
  "data": {
    "username": "Juan",
    "rol": "ADMIN",
    "email": "usuario@correo.com",
    "menu": []
  }
}
```

### 2. Requests autenticados

- El frontend hace `fetch` con `credentials: "include"`.
- El navegador envia la cookie automaticamente.
- El backend valida el token desde cookie.

### 3. Logout

#### Frontend envia:

```http
POST /auth/logout
```

#### Backend responde:

Una cookie vencida para eliminar la sesion:

```http
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

---

## Cambios necesarios en el backend

## 1. Modificar `POST /auth/sign_in`

### Requerimientos

- Seguir validando usuario y password como hoy.
- Generar el JWT como hoy.
- En vez de depender del frontend para guardar el token, el backend debe enviarlo como cookie.

### Recomendacion

Nombre de cookie:

```text
access_token
```

### Atributos recomendados

- `HttpOnly=true`
- `Secure=true` en produccion
- `SameSite=Lax`
- `Path=/`
- `Max-Age` segun duracion de sesion

### Respuesta esperada del body

El backend puede mantener esta estructura:

```json
{
  "success": true,
  "data": {
    "username": "Juan",
    "rol": "ADMIN",
    "email": "usuario@correo.com",
    "menu": [...]
  }
}
```

### Sobre `itoken`

Opciones posibles:

#### Opcion recomendada
No devolver mas `itoken` en el body.

#### Opcion temporal
Seguir devolviendo `itoken` por compatibilidad mientras se migra el frontend, pero luego eliminarlo.

---

## 2. Modificar el filtro JWT o la capa de seguridad

Actualmente el backend probablemente lee:

```http
Authorization: Bearer <token>
```

Debe adaptarse para leer tambien, o preferentemente en esta nueva etapa leer principalmente, desde cookie:

```text
access_token
```

### Logica esperada

1. Buscar la cookie `access_token`.
2. Si existe, extraer el valor.
3. Validar JWT.
4. Cargar usuario autenticado en el contexto de seguridad.
5. Si no existe o es invalido, responder no autorizado.

### Recomendacion de compatibilidad

Durante la transicion se puede aceptar:

1. cookie `access_token`
2. header `Authorization`

Luego, cuando todo el frontend este migrado, dejar solo cookie.

---

## 3. Crear endpoint `POST /auth/logout`

### Objetivo

Eliminar la sesion del navegador invalidando la cookie.

### Respuesta esperada

```http
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

### Respuesta JSON sugerida

```json
{
  "success": true,
  "message": "Sesion cerrada correctamente"
}
```

---

## 4. Configurar CORS correctamente

Como se usaran cookies, el backend debe permitir credenciales.

### Obligatorio

- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin` no puede ser `*`
- debe ser el origen exacto del frontend

### Ejemplo conceptual

```text
http://localhost:5500
```

o el puerto/origen real donde se sirva el frontend.

### Nota

Si no se configura esto, el navegador no enviara ni aceptara correctamente la cookie en requests cross-origin.

---

## 5. Revisar politica CSRF

Cuando la autenticacion usa cookies, aparece el riesgo de CSRF.

### Minimo recomendado

- `SameSite=Lax`

### Si el sistema luego lo requiere

- token CSRF adicional
- validacion de origen
- validacion de `Referer` o `Origin` donde aplique

Para una primera etapa interna, `HttpOnly + Secure + SameSite=Lax` ya mejora bastante el esquema actual.

---

## Cambios necesarios en el frontend

## 1. Dejar de guardar token en `sessionStorage`

### Estado actual

Archivo actual:

[js/index.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/js/index.js)

Hoy se guarda:

```js
sessionStorage.setItem('token', response.data.itoken);
```

### Futuro esperado

Eliminar esa linea.

Se puede seguir guardando:

```js
sessionStorage.setItem('username', response.data.username);
sessionStorage.setItem('rol', response.data.rol);
sessionStorage.setItem('email', response.data.email);
sessionStorage.setItem('userMenu', JSON.stringify(response.data.menu || []));
```

---

## 2. Modificar `fetch` para enviar cookies

Archivo actual:

[js/apiService.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/js/apiService.js)

### Futuro esperado

Agregar:

```js
credentials: "include"
```

al objeto `fetch`.

Ejemplo:

```js
const options = {
    method,
    headers,
    credentials: "include"
};
```

---

## 3. Eliminar envio manual de `Authorization`

Archivo actual:

[js/apiService.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/js/apiService.js)

Hoy existe logica como:

```js
const token = sessionStorage.getItem("token");
if (token && !noAuthEndpoints.includes(endpoint)) {
    headers["Authorization"] = `Bearer ${token}`;
}
```

### Futuro esperado

Eliminar esa dependencia del token en `sessionStorage`.

La autenticacion debe viajar por cookie.

---

## 4. Ajustar logout del frontend

Archivo actual:

[js/menu.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/js/menu.js)

Hoy el logout solo limpia storage y redirige.

### Futuro esperado

1. Llamar al endpoint `POST /auth/logout`
2. Esperar confirmacion
3. Limpiar:
   - `username`
   - `rol`
   - `email`
   - `userMenu`
4. Redirigir a `index.html`

---

## 5. Manejo de sesion expirada

Como el frontend ya no leera el token directamente, el control de sesion dependera mas de la respuesta del backend.

### Recomendacion

Cuando una API responda `401` o `403`:

1. limpiar datos de sesion del frontend
2. redirigir al login
3. mostrar mensaje amigable si hace falta

---

## Datos que si pueden seguir en `sessionStorage`

Estos datos no son el token y pueden mantenerse temporalmente para la UI:

- `username`
- `rol`
- `email`
- `userMenu`

### Alternativa mas limpia a futuro

Crear endpoint:

```http
GET /auth/me
```

que devuelva:

- usuario actual
- rol
- email
- menu

Asi el frontend podria reconstruir estado al entrar a `menu.html` sin depender tanto de `sessionStorage`.

---

## Recomendacion de implementacion por etapas

## Etapa 1

### Backend

- `POST /auth/sign_in` envia cookie `HttpOnly`
- el filtro JWT acepta cookie
- crear `POST /auth/logout`
- configurar CORS con credenciales

### Frontend

- agregar `credentials: "include"`
- dejar de guardar token
- dejar de enviar `Authorization`
- mantener `username`, `rol`, `email`, `menu` en `sessionStorage`

## Etapa 2

- crear `GET /auth/me`
- reducir dependencia de `sessionStorage`
- reconstruir sesion y menu desde backend

---

## Compatibilidad durante la migracion

Para evitar cortes bruscos se recomienda esta secuencia:

1. backend acepta cookie y tambien `Authorization`
2. frontend empieza a usar cookie
3. se valida funcionamiento completo
4. se elimina `Authorization` del frontend
5. opcionalmente se elimina `itoken` del response

---

## Riesgos y observaciones

## 1. Esto no oculta los datos del frontend

Aunque el token pase a cookie `HttpOnly`, el usuario seguira pudiendo ver:

- requests en `Network`
- HTML descargado
- JS descargado
- CSS descargado
- respuestas JSON con datos que la UI necesita

La mejora apunta a proteger el **token**, no a ocultar el frontend.

## 2. `HttpOnly` no existe para `sessionStorage`

Solo se puede usar `HttpOnly` en cookies.

## 3. `Secure=true` requiere HTTPS en produccion

En local se puede necesitar un manejo especial segun el entorno.

## 4. CORS mal configurado rompe el login

Si se usan cookies cross-origin y no se permite `credentials`, el flujo no funcionara.

---

## Checklist para la futura implementacion

### Backend

- [ ] `POST /auth/sign_in` envia cookie `access_token`
- [ ] body del login mantiene `username`, `rol`, `email`, `menu`
- [ ] filtro JWT lee token desde cookie
- [ ] endpoint `POST /auth/logout`
- [ ] CORS con `allowCredentials(true)`
- [ ] origenes configurados explicitamente
- [ ] politica `SameSite` definida

### Frontend

- [ ] quitar `sessionStorage.setItem('token', ...)`
- [ ] agregar `credentials: "include"` en `fetch`
- [ ] quitar `Authorization: Bearer ...`
- [ ] actualizar logout para llamar al backend
- [ ] manejar `401/403`

---

## Archivos del frontend afectados cuando se implemente

- [js/index.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/js/index.js)
- [js/apiService.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/js/apiService.js)
- [js/menu.js](/Users/macbookpro/Documents/Proyect_Front/MiSistema/js/menu.js)

---

## Conclusion

La migracion a cookie `HttpOnly` es recomendable para este sistema porque mejora de forma clara la proteccion del token sin cambiar la experiencia funcional del usuario.

La mejor ruta para este proyecto es:

1. mover solo el token a cookie
2. mantener datos de UI en `sessionStorage` en una primera etapa
3. mas adelante agregar `/auth/me` si se quiere una sesion todavia mas limpia
