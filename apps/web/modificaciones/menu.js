var routes = {
    '/dashboard': 'Dashboard',
    '/empresa': 'Empresa',
    '/clientes': 'Clientes',
    '/clientes/lista': 'Lista de Clientes',
    '/clientes/nuevo': 'Nuevo Cliente',
    '/clientes/categorias': 'Categorías de Clientes',
    '/proveedores': 'Proveedores',
    '/proveedores/lista': 'Lista de Proveedores',
    '/proveedores/nuevo': 'Nuevo Proveedor',
    '/proveedores/ordenes': 'Órdenes de Compra',
    '/productos': 'Productos',
    '/productos/lista': 'Lista de Productos',
    '/productos/nuevo': 'Nuevo Producto',
    '/productos/categorias': 'Categorías',
    '/productos/inventario': 'Inventario',
    '/reportes': 'Reportes',
    '/configuracion': 'Configuración'
};

var currentPath = '/dashboard';

function getBreadcrumbItems(path) {
    var segments = path.split('/');
    var items = [];
    var cleanSegments = [];
    
    for (var i = 0; i < segments.length; i++) {
        if (segments[i] !== '') {
            cleanSegments.push(segments[i]);
        }
    }
    
    items.push({ label: 'Inicio', path: '/dashboard' });
    
    if (cleanSegments.length > 0 && cleanSegments[0] !== 'dashboard') {
        var buildPath = '';
        for (var j = 0; j < cleanSegments.length; j++) {
            buildPath = buildPath + '/' + cleanSegments[j];
            if (routes[buildPath]) {
                items.push({ label: routes[buildPath], path: buildPath });
            }
        }
    }
    
    return items;
}

function createClickHandler(itemPath) {
    return function() {
        loadView(itemPath);
    };
}

function renderBreadcrumb(path) {
    var breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    var items = getBreadcrumbItems(path);
    
    breadcrumb.innerHTML = '';
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var isLast = i === items.length - 1;
        
        var link = document.createElement('a');
        link.className = 'breadcrumb-item';
        if (isLast) {
            link.className = link.className + ' active';
        }
        link.textContent = item.label;
        
        if (!isLast) {
            link.onclick = createClickHandler(item.path);
        }
        
        breadcrumb.appendChild(link);
        
        if (!isLast) {
            var separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.innerHTML = '&rsaquo;';
            breadcrumb.appendChild(separator);
        }
    }
}

function navigateTo(path) {
    currentPath = path;
    renderBreadcrumb(path);
    
    // Remover active de todos los links
    var menuLinks = document.querySelectorAll('.menu-link, .submenu-link');
    for (var i = 0; i < menuLinks.length; i++) {
        menuLinks[i].classList.remove('active');
    }
    
    // Buscar el link activo (puede ser del menú principal o submenú)
    const activeLink = document.querySelector(`.menu-link[data-main="${path}"], .submenu-link[data-main="${path}"]`);
    
    if (activeLink) {        
        activeLink.classList.add('active');
        
        // Si es un item de submenú, abrir el submenú padre
        const parentMenuItem = activeLink.closest('.has-submenu');
        if (parentMenuItem) {
            parentMenuItem.classList.add('open');
        }
    }
}

function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // Cerrar todos los submenús cuando se colapsa
    if (sidebar.classList.contains('collapsed')) {
        var openSubmenus = document.querySelectorAll('.menu-item.has-submenu.open');
        openSubmenus.forEach(function(item) {
            item.classList.remove('open');
        });
    }
}

// Toggle de submenús
function initSubmenuToggles() {
    document.querySelectorAll('.has-submenu > .menu-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const sidebar = document.getElementById('sidebar');
            
            // Si el sidebar está colapsado, no hacer nada
            if (sidebar.classList.contains('collapsed')) {
                return;
            }
            
            const parentItem = link.parentElement;
            const isOpen = parentItem.classList.contains('open');
            
            // Cerrar otros submenús
            document.querySelectorAll('.menu-item.has-submenu.open').forEach(item => {
                if (item !== parentItem) {
                    item.classList.remove('open');
                }
            });
            
            // Toggle del submenú actual
            parentItem.classList.toggle('open');
            
            // Si se abrió el submenú, cargar la vista padre
            if (!isOpen) {
                const view = link.getAttribute('data-main');
                loadView(view);
            }
        });
    });
}

// Event listeners para items del menú
document.querySelectorAll('.menu-item:not(.has-submenu) .menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-main');
        loadView(view);
    });
});

// Event listeners para items de submenú
document.querySelectorAll('.submenu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-main');
        loadView(view);
    });
});

document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);

async function loadView(viewName) {
    const mainContent = document.getElementById('mainContent');
    try {              
        const response = await fetch(`./form${viewName}${viewName}.html`);
        const html = await response.text();        
        mainContent.innerHTML = html;
        loadScriptsFromHTML(mainContent);
        navigateTo(`${viewName}`);        
    } catch (error) {
        console.error('Error cargando vista:', error);
        mainContent.innerHTML = '<p>Error al cargar la vista</p>';
    }
}

function loadScriptsFromHTML(container) {
    const oldScripts = container.querySelectorAll("script");
    
    oldScripts.forEach(oldScript => {
        const newScript = document.createElement("script");

        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }

        oldScript.remove();
        document.body.appendChild(newScript);
    });
}

// Inicializar
initSubmenuToggles();
loadView('/dashboard');