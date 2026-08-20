// toast.js

/**
 * Muestra una notificación toast
 * @param {string} title - Título del toast
 * @param {string} message - Mensaje del toast
 * @param {string} type - Tipo de toast: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Duración en milisegundos (por defecto 5000)
 */
/**
 * Documento de nivel superior accesible. Los formularios se cargan dentro de un iframe
 * (menu.html); si el toast se crea en el iframe, el topbar del documento padre lo tapa y
 * su X no recibe el clic. Renderizándolo en el documento raíz queda por encima de todo.
 */
function topDocument() {
    try {
        if (window.top && window.top.document && window.top.document.body) {
            return window.top.document;
        }
    } catch (e) {
        // window.top de otro origen: usamos el documento local
    }
    return document;
}

function showToast(title, message, type = 'info', duration = 5000) {
    const doc = topDocument();

    // Crear contenedor si no existe
    let container = doc.querySelector('.toast-container');
    if (!container) {
        container = doc.createElement('div');
        container.className = 'toast-container';
        doc.body.appendChild(container);
    }

    // Iconos según el tipo
    const icons = {
        info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
        </svg>`,
        success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>`,
        warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
            </svg>`,
        error: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                </svg>
               `
    };

    // Crear el toast
    const toast = doc.createElement('div');
    toast.className = `toast-personalizado ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${icons[type] || icons.info}
        </div>
        <div class="toast-content">
            <h4 class="toast-title">${title}</h4>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" aria-label="Cerrar">×</button>
    `;

    // Botón cerrar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    // Agregar al contenedor
    container.appendChild(toast);

    // Auto-cerrar después de la duración especificada.
    // El timer se agenda en la ventana del documento DUEÑO del toast (el top), no en la del
    // iframe del formulario: así se dispara aunque el iframe cambie de página o esté throttleado.
    if (duration > 0) {
        const win = doc.defaultView || window;
        win.setTimeout(() => removeToast(toast), duration);
    }
}

/**
 * Elimina un toast con animación
 * @param {HTMLElement} toast - Elemento toast a eliminar
 */
function removeToast(toast) {
    if (toast.dataset.removing) return;   // idempotente: evita dobles llamadas (X + auto-cierre)
    toast.dataset.removing = '1';
    toast.classList.add('removing');

    // El toast vive en el documento raíz (fuera del iframe); agendamos en la ventana de ESE
    // documento para que el timer no dependa del iframe del formulario.
    const doc = toast.ownerDocument || document;
    const win = doc.defaultView || window;
    win.setTimeout(() => {
        toast.remove();

        // Eliminar contenedor si está vacío
        const container = doc.querySelector('.toast-container');
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 300); // Duración de la animación
}

// Funciones de ayuda para cada tipo
export function showInfoToast(title, message, duration = 5000) {
    showToast(title, message, 'info', duration);
}

export function showSuccessToast(title, message, duration = 5000) {
    showToast(title, message, 'success', duration);
}

export function showWarningToast(title, message, duration = 5000) {
    showToast(title, message, 'warning', duration);
}

export function showErrorToast(title, message, duration = 5000) {
    showToast(title, message, 'error', duration);
}