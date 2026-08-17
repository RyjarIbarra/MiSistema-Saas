// Archivo routes.js
const routes = [
    { key: '8H3J5N1', path: '/dashboard/dashboard.html', view: 'Dashboard' },
    { key: '5F2V8A1', path: '/facturacion/venta/lista.html', view: 'Lista de Facturas' },
    { key: '5F2V8A2', path: '/facturacion/venta/venta.html', view: 'Nueva Factura' },
    { key: '7P9Q1R3', path: '/cliente/cliente.html', view: 'Clientes' },
    { key: '7P9Q1R4', path: '/configuraciones/empresa/empresa.html', view: 'Empresa' },
    { key: '7LOQ1G2', path: '/configuraciones/definiciones/definiciones.html', view: 'Configuración Principal' },
    { key: '6B8C0D2', path: '/producto/producto.html', view: 'Productos' },
    { key: '6B8C0D3', path: '/producto/ajuste-stock/ajuste-stock.html', view: 'Ajuste de Stock' },
    { key: '6B8C0D4', path: '/producto/clasificaciones/clasificaciones.html', view: 'Clasificación de Productos' },
    { key: '3S5T7V9', path: '/usuarios/usuarios.html', view: 'Usuarios del Sistema' },
    { key: '3S5T7V8', path: '/usuarios/niveles/niveles-acceso.html', view: 'Niveles de Acceso' },
    { key: '2H6I8S4', path: '/usuarios/historial/historial.html', view: 'Historial del Sistema' },
];

function normalizePath(path) {
    if (!path) {
        return null;
    }

    return path.startsWith('/') ? path : `/${path}`;
}

function upsertRoute(route) {
    if (!route?.key || !route?.path) {
        return;
    }

    const normalizedRoute = {
        key: route.key,
        path: normalizePath(route.path),
        view: route.view
    };

    const index = routes.findIndex(item => item.key === normalizedRoute.key);
    if (index >= 0) {
        routes[index] = normalizedRoute;
        return;
    }

    routes.push(normalizedRoute);
}

export function registerMenuRoutes(menuModules = []) {
    menuModules.forEach(module => {
        (module.children || []).forEach(option => {
            if (!option?.path) {
                return;
            }

            upsertRoute({
                key: option.key,
                path: option.path,
                view: option.label
            });
        });
    });
}

export function getRoute(key) {
    const route = routes.find(r => r.key === key);
    if (!route) {
        throw new Error(`Ruta no encontrada para la clave: ${key}`);
    }
    return route;
}
