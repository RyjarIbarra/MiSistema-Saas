// toast.js

/**
 * Muestra una notificación toast
 * @param {string} title - Título del toast
 * @param {string} message - Mensaje del toast
 * @param {string} type - Tipo de toast: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Duración en milisegundos (por defecto 5000)
 */
function showToast(title, message, type = 'info', duration = 5000) {
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
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
    const toast = document.createElement('div');
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

    // Auto-cerrar después de la duración especificada
    if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
    }

    // Agregar al contenedor
    container.appendChild(toast);
}

/**
 * Elimina un toast con animación
 * @param {HTMLElement} toast - Elemento toast a eliminar
 */
function removeToast(toast) {
    toast.classList.add('removing');
    
    setTimeout(() => {
        toast.remove();
        
        // Eliminar contenedor si está vacío
        const container = document.querySelector('.toast-container');
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