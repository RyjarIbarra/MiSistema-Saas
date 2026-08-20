import { abrirCambiarPassword } from "./cambiarPassword.js";
import { cleanupLoader, hideLoader, showLoader } from "./loader.js";
import { getRoute, registerMenuRoutes } from "./routes.js";
const $ = (id) => document.getElementById(id);
var currentPath = 'dashboard/dashboard';
const SIDEBAR_STATE_KEY = 'sidebarState';
const MOBILE_BREAKPOINT = 768;
const SIDEBAR_TRANSITION_MS = 300;
let sidebarTransitionTimer;
const STATIC_DASHBOARD_KEY = '8H3J5N1';
const STATIC_DASHBOARD_MODULE = 'Dashboard';
const MODULE_ICON_MAP = {
    'Facturación Venta': 'fa-solid fa-money-check',
    'Clientes': 'fa-solid fa-users',
    'Proveedores': 'fa-solid fa-truck-fast',
    'Productos': 'fa-solid fa-boxes-stacked',
    'Banco': 'fa-solid fa-bank',
    'Configuración': 'fa-solid fa-gears',
    'Usuarios': 'fa-solid fa-user-group'
};

function getStoredMenu() {
    try {
        const raw = sessionStorage.getItem('userMenu');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error leyendo menu del usuario:', error);
        return [];
    }
}

function getOptionIcon(option, fallback = 'fa-regular fa-circle') {
    return option?.icon || fallback;
}

function getModuleIcon(module) {
    const firstChildIcon = (module.children || []).find(option => option?.icon)?.icon;
    return MODULE_ICON_MAP[module.module] || firstChildIcon || 'fa-solid fa-folder-open';
}

function createSubmenuOption(option) {
    const item = document.createElement('li');
    item.className = 'submenu-item';

    const link = document.createElement('a');
    link.className = option?.path ? 'submenu-link option' : 'submenu-link';
    link.href = '#';

    if (option?.path && option?.key) {
        link.dataset.key = option.key;
    }

    const icon = document.createElement('i');
    icon.className = getOptionIcon(option, 'fa-regular fa-circle');
    link.appendChild(icon);

    const label = document.createElement('span');
    label.textContent = option?.label || 'Sin nombre';
    link.appendChild(label);

    if (!option?.path) {
        link.classList.add('disabled');
        link.setAttribute('aria-disabled', 'true');
    }

    item.appendChild(link);
    return item;
}

function createModuleItem(module) {
    const item = document.createElement('li');
    item.className = 'menu-item has-submenu';

    const link = document.createElement('a');
    link.className = 'menu-link';
    link.href = '#';

    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'menu-icon';
    const icon = document.createElement('i');
    icon.className = getModuleIcon(module);
    iconWrapper.appendChild(icon);

    const text = document.createElement('span');
    text.className = 'menu-text';
    text.textContent = module.module;

    const arrow = document.createElement('i');
    arrow.className = 'fas fa-chevron-down submenu-arrow';

    link.append(iconWrapper, text, arrow);

    const submenu = document.createElement('ul');
    submenu.className = 'submenu';
    (module.children || []).forEach(option => submenu.appendChild(createSubmenuOption(option)));

    item.append(link, submenu);
    return item;
}

function renderMenuFromSession() {
    const menuContainer = document.getElementById('menu');
    if (!menuContainer) {
        return;
    }

    const storedMenu = getStoredMenu();
    registerMenuRoutes(storedMenu);

    const dashboardItem = menuContainer.querySelector('.menu-item');
    menuContainer.innerHTML = '';

    if (dashboardItem) {
        menuContainer.appendChild(dashboardItem);
    }

    storedMenu
        .filter(module => module?.module && module.module !== STATIC_DASHBOARD_MODULE)
        .forEach(module => {
            if (!Array.isArray(module.children) || module.children.length === 0) {
                return;
            }

            menuContainer.appendChild(createModuleItem(module));
        });
}

function bindOptionLinks() {
    document.querySelectorAll('.option').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.getAttribute('data-key');

            if (!key) {
                return;
            }

            const route = getRoute(key);
            loadView(route);

            if (isMobileViewport()) {
                setSidebarMode('mobile-closed', false);
            }
        });
    });
}

// Cargar información del usuario
function loadUserInfo() {
    const username = sessionStorage.getItem('username');
    const rol = sessionStorage.getItem('rol');
    const email = sessionStorage.getItem('email');
    if (username && rol) {
        $('username').textContent = username;
        $('email').textContent = email;        
        $('avatar').textContent = username.charAt(0).toUpperCase();
        //Dropdown
        $('ddAvatar').textContent = username.charAt(0).toUpperCase();
        $('ddName').textContent = username;
        $('ddEmail').textContent = email;
        $('ddRol').textContent = rol;
    }
}
loadUserInfo();



function getBreadcrumbItems(key) {
    var items = [];
    
    // Siempre agregar "Inicio" (Dashboard)
    items.push({ 
        label: 'Inicio', 
        key: '8H3J5N1' // Key del dashboard
    });
    
    // Si no es el dashboard, agregar la ruta actual
    if (key !== '8H3J5N1') {
        try {
            const route = getRoute(key);
            items.push({ 
                label: route.view, 
                key: key 
            });
        } catch (error) {
            console.error('Error obteniendo ruta:', error);
        }
    }
    
    return items;
}

function createClickHandler(itemKey) {
    return function() {
        try {
            const route = getRoute(itemKey);
            loadView(route);
        } catch (error) {
            console.error('Error en click handler:', error);
        }
    };
}

function renderBreadcrumb(key) {
    const iframe = document.getElementById('iframeLayout');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const breadcrumb = iframeDoc.getElementById('breadcrumb');
    
    if (!breadcrumb) {
        console.warn('Breadcrumb no encontrado en el iframe');
        return;
    }
    
    var items = getBreadcrumbItems(key);
    
    breadcrumb.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var isLast = i === items.length - 1;
        
        var link = iframeDoc.createElement('a');
        link.className = 'breadcrumb-item';
        if (isLast) {
            link.className = link.className + ' active';
        }
        link.textContent = item.label;
        
        if (!isLast) {
            link.onclick = createClickHandler(item.key);
        }
        
        breadcrumb.appendChild(link);
        
        if (!isLast) {
            var separator = iframeDoc.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.innerHTML = '&rsaquo;';
            breadcrumb.appendChild(separator);
        }
    }
}

function navigateTo(key) {
    renderBreadcrumb(key);

    var submenuLinks = document.querySelectorAll('.option');
    for (var i = 0; i < submenuLinks.length; i++) {
        submenuLinks[i].classList.remove('active');
    }
    
    const activeLink = document.querySelector(`.option[data-key="${key}"]`);
    
    if (activeLink) {        
        activeLink.classList.add('active');
    }
}

function isMobileViewport() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function closeOpenSubmenus() {
    document.querySelectorAll('.menu-item.has-submenu.open').forEach(item => {
        item.classList.remove('open');
    });
}

function updateLogo(isMini) {
    const logoText = document.getElementById('logoText');
    const logoSubtext = document.getElementById('logoSubtext');

    if (!logoText || !logoSubtext) {
        return;
    }

    logoText.textContent = isMini ? 'MS' : 'Mi Sistema';
    logoSubtext.style.display = isMini ? 'none' : '';
}

function updateToggleButton(isOpen) {
    const menuToggle = document.getElementById('menu-toggle');
    if (!menuToggle) {
        return;
    }

    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Contraer menu lateral' : 'Expandir menu lateral');
}

function setSidebarMode(mode, persist = true, animate = true) {
    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    const isMobile = isMobileViewport();

    if (!sidebar || !topbar || !mainContent) {
        return;
    }

    const wasMini = sidebar.classList.contains('mini');
    const nextMini = !isMobile && mode === 'mini';
    const shouldAnimateResize = animate && !isMobile && wasMini !== nextMini;

    clearTimeout(sidebarTransitionTimer);

    if (shouldAnimateResize) {
        sidebar.classList.add('is-resizing');
    } else {
        sidebar.classList.remove('is-resizing');
    }

    sidebar.classList.remove('mini', 'active');
    topbar.classList.remove('mini');
    mainContent.classList.remove('mini');
    overlay?.classList.remove('show');
    overlay?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sidebar-mobile-open');

    if (isMobile) {
        clearTimeout(sidebarTransitionTimer);
        sidebar.classList.remove('is-resizing');
        updateLogo(false);

        if (mode === 'mobile-open') {
            sidebar.classList.add('active');
            overlay?.classList.add('show');
            overlay?.setAttribute('aria-hidden', 'false');
            document.body.classList.add('sidebar-mobile-open');
            updateToggleButton(true);
        } else {
            updateToggleButton(false);
        }
        return;
    }

    if (mode === 'mini') {
        closeOpenSubmenus();
        updateLogo(true);
        sidebar.classList.add('mini');
        topbar.classList.add('mini');
        mainContent.classList.add('mini');
        updateToggleButton(false);
    } else {
        updateLogo(false);
        updateToggleButton(true);
    }

    if (shouldAnimateResize) {
        sidebarTransitionTimer = setTimeout(() => {
            sidebar.classList.remove('is-resizing');
        }, SIDEBAR_TRANSITION_MS);
    }

    if (persist) {
        localStorage.setItem(SIDEBAR_STATE_KEY, mode === 'mini' ? 'mini' : 'expanded');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');

    if (isMobileViewport()) {
        const nextMode = sidebar?.classList.contains('active') ? 'mobile-closed' : 'mobile-open';
        setSidebarMode(nextMode, false);
        return;
    }

    const nextMode = sidebar?.classList.contains('mini') ? 'expanded' : 'mini';
    setSidebarMode(nextMode);
}

function initSidebarState() {
    const savedMode = localStorage.getItem(SIDEBAR_STATE_KEY);
    setSidebarMode(savedMode === 'mini' ? 'mini' : 'expanded', false, false);
}

// Toggle de submenús
function initSubmenuToggles() {
    document.querySelectorAll('.has-submenu > .menu-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const sidebar = document.getElementById('sidebar');
            
            // Si el sidebar está en modo mini, no abrir submenús
            if (sidebar.classList.contains('mini')) {
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
                //const view = link.getAttribute('data-main');
                //loadView(view);
            }
        });
    });
}

document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
document.getElementById('sidebarOverlay')?.addEventListener('click', () => setSidebarMode('mobile-closed', false));
window.addEventListener('resize', () => {
    const savedMode = localStorage.getItem(SIDEBAR_STATE_KEY);
    setSidebarMode(isMobileViewport() ? 'mobile-closed' : savedMode || 'expanded', false, false);
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileViewport()) {
        setSidebarMode('mobile-closed', false);
    }
});

// async function loadView(route) {
//     const iframeLayout = document.getElementById('iframeLayout');
//     try {
//         iframeLayout.src = 'form' + route.path;
//         // Esperar a que el iframe cargue
//         await new Promise((resolve) => {
//             iframeLayout.onload = resolve;
//         });
//         // Ahora renderizar el breadcrumb
//         navigateTo(route.key);               
//     } catch (error) {
//         console.error('Error cargando vista:', error);       
//     }
// }
// En menu.js
async function loadView(route) {
    const iframeLayout = document.getElementById('iframeLayout');
    const skeleton = document.getElementById('iframeSkeleton');
    
    try {
        // Fade out iframe
        iframeLayout.classList.add('loading');
        
        // Mostrar skeleton
        await new Promise(resolve => setTimeout(resolve, 200));
        skeleton.classList.add('show');
        
        // Limpiar loader anterior
        cleanupLoader();

        // Limpiar toasts remanentes del formulario anterior: viven en este documento (el top) y,
        // si el iframe que los creó navega, su timer de auto-cierre muere y quedarían congelados.
        document.querySelectorAll('.toast-container').forEach((c) => c.remove());

        // Cambiar src
        iframeLayout.src = 'form' + route.path;
        
        // Esperar carga
        await new Promise((resolve) => {
            iframeLayout.onload = resolve;
        });

        aplicarEstiloScrollIframe(iframeLayout);
        
        // Ocultar skeleton
        skeleton.classList.remove('show');
        
        // Pequeño delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fade in iframe
        iframeLayout.classList.remove('loading');
        
        navigateTo(route.key);       
        
    } catch (error) {
        skeleton.classList.remove('show');
        iframeLayout.classList.remove('loading');
        console.error('Error cargando vista:', error);       
    }
}

function aplicarEstiloScrollIframe(iframe) {
    const iframeDoc = iframe?.contentDocument;
    if (!iframeDoc) {
        return;
    }

    let styleTag = iframeDoc.getElementById("iframe-scrollbar-hidden-style");
    if (!styleTag) {
        styleTag = iframeDoc.createElement("style");
        styleTag.id = "iframe-scrollbar-hidden-style";
        styleTag.textContent = `
            html,
            body {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }

            html::-webkit-scrollbar,
            body::-webkit-scrollbar {
                width: 0;
                height: 0;
                display: none;
            }
        `;
        iframeDoc.head?.appendChild(styleTag);
    }
}

renderMenuFromSession();
initSidebarState();
initSubmenuToggles();
bindOptionLinks();
loadView(getRoute(STATIC_DASHBOARD_KEY));


// ── User Profile Dropdown ──
const userProfile = document.getElementById('userProfile');
const profileDropdown = document.getElementById('profileDropdown');

userProfile.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = profileDropdown.classList.contains('show');
    profileDropdown.classList.toggle('show', !isOpen);
    userProfile.classList.toggle('open', !isOpen);
});

document.addEventListener('click', () => {
    profileDropdown.classList.remove('show');
    userProfile.classList.remove('open');
});

document.getElementById('iframeLayout').addEventListener('load', function () {
    aplicarEstiloScrollIframe(this);
    this.contentDocument?.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        userProfile.classList.remove('open');
    });
});

profileDropdown.addEventListener('click', (e) => e.stopPropagation());

// Navegar a opciones del menú
document.querySelectorAll('.dd-item[data-key]').forEach(item => {
    item.addEventListener('click', () => {
        const key = item.dataset.key;
        // Aquí lanzas tu lógica de navegación, ej:
        // loadPage(key);
        profileDropdown.classList.remove('show');
        userProfile.classList.remove('open');
    });
});

// Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', () => {
    // Tu lógica de logout: limpiar token, redirigir, etc.
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('rol');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('userMenu');
    window.location.href = 'index.html';
});

// Desde el dropdown del perfil
document.getElementById('btnCambiarPassword').addEventListener('click', () => {
    abrirCambiarPassword();
});
