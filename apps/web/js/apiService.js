import { manejarErrorAPI } from "./PSQLError.js";

// Detección automática de entorno (sin listas de puertos que mantener):
//  - Docker/nginx sirve en el puerto estándar 80/443 (o sin puerto) -> rutas relativas, proxy nginx, sin CORS.
//  - Cualquier otro puerto (Live Server: 5500, 5501, 5502, 5503, ...) -> dev, rutas absolutas al backend.
const _port = window.location.port;
const IS_DEV = _port !== "" && _port !== "80" && _port !== "443";

const BASE_URL        = IS_DEV ? "http://localhost:9095/pdv/"    : "/pdv/";
const REPORT_BASE_URL = IS_DEV ? "http://localhost:9096/report/" : "/report/";
//const BASE_URL = "https://all-eagles-roll.loca.lt/conta/"; // ajusta según tu backend

//npx localtunnel --port 9094 executar en el puerto donde esta corriendo el backend
//npx serve executar en la carpeta donde esta el indext.html para ver la app en el navegador

// Endpoints que NO necesitan autorización
const noAuthEndpoints = ["/auth/sign_in"];

// Función genérica de request
async function request(endpoint, method = "GET", data = null, entidad = 'Registro') {
    const headers = {
        "Content-Type": "application/json"
    };
    const token = sessionStorage.getItem("token");

    // Agregar Authorization solo si no está en la lista noAuthEndpoints
    if (token && !noAuthEndpoints.includes(endpoint)) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };     

    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();        
        // Verificar si la respuesta no fue exitosa (incluyendo 400, 500, etc)
        if (!response.ok || !result.success) {                        
            throw new Error(`Error en la petición ${method} ${endpoint}: ${result.error || result.message || "Error en la petición"}`);
        }

        return result;
    } catch (err) {                        
        manejarErrorAPI(err, entidad);        
        throw err;
    }
}

// Métodos específicos
export async function getData(endpoint, entidad = 'Registro') {
  return request(endpoint, "GET", null, entidad);
}

export async function postData(endpoint, data, entidad = 'Registro') {
  return request(endpoint, "POST", data, entidad);
}

export async function putData(endpoint, data, entidad = 'Registro') {
  return request(endpoint, "PUT", data, entidad);
}

export async function deleteData(endpoint, entidad = 'Registro') {
  return request(endpoint, "DELETE", null, entidad);
}

export async function postFormData(endpoint, formData, entidad = 'Registro') {
    const headers = {};
    const token = sessionStorage.getItem("token");

    if (token && !noAuthEndpoints.includes(endpoint)) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: formData
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(`Error en la petición POST ${endpoint}: ${result.error || result.message || "Error en la petición"}`);
        }

        return result;
    } catch (err) {
        manejarErrorAPI(err, entidad);
        throw err;
    }
}

export async function downloadFile(endpoint, defaultFilename = "archivo", entidad = 'Registro') {
    const headers = {};
    const token = sessionStorage.getItem("token");

    if (token && !noAuthEndpoints.includes(endpoint)) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers
        });

        if (!response.ok) {
            let errorMessage = "Error al descargar archivo";
            try {
                const result = await response.json();
                errorMessage = result.error || result.message || errorMessage;
            } catch {
                const resultText = await response.text();
                errorMessage = resultText || errorMessage;
            }
            throw new Error(`Error en la petición GET ${endpoint}: ${errorMessage}`);
        }

        const blob = await response.blob();
        const disposition = response.headers.get("Content-Disposition") || "";
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
        const filename = filenameMatch?.[1] || defaultFilename;

        return { blob, filename };
    } catch (err) {
        manejarErrorAPI(err, entidad);
        throw err;
    }
}

export async function postBinaryData(endpoint, data = {}, defaultFilename = "archivo", entidad = "Registro", baseUrl = REPORT_BASE_URL) {
    const headers = {
        "Content-Type": "application/json"
    };
    const token = sessionStorage.getItem("token");

    if (token && !noAuthEndpoints.includes(endpoint)) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(data || {})
        });

        if (!response.ok) {
            let errorMessage = "Error al generar archivo";
            const contentType = response.headers.get("Content-Type") || "";

            try {
                if (contentType.includes("application/json")) {
                    const result = await response.json();
                    errorMessage = result.error || result.message || errorMessage;
                } else {
                    const resultText = await response.text();
                    errorMessage = resultText || errorMessage;
                }
            } catch {
                errorMessage = "Error al generar archivo";
            }

            throw new Error(`Error en la petición POST ${endpoint}: ${errorMessage}`);
        }

        const blob = await response.blob();
        const disposition = response.headers.get("Content-Disposition") || "";
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
        const filename = filenameMatch?.[1] || defaultFilename;
        return { blob, filename };
    } catch (err) {
        manejarErrorAPI(err, entidad);
        throw err;
    }
}

export async function SearchRuc(ruc) {
    try {

        const headers = {
            "Content-Type": "application/json"
        };

        const options = {
            method: "GET",
            headers
        }; 

        const response = await fetch(`http://localhost:9097/fact/registro-txt/buscar?q=${ruc}`, options);
        const result = await response.json();

        return result;

    } catch (error) {
        console.error(error);
    }
}
