/// Validaciones y funciones utilitarias

export const ICON_EDITAR = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>`;

export const ICON_ELIMINAR = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

export const ICON_VER = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;

/* Iconos SVG (lucide) de acciones de estado — usan currentColor para colorearse desde el botón.
   Regla del proyecto: los iconos de grilla son SVG, nunca emoji ni Font Awesome. */
const SVG = (paths) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
export const ICON_ENTREGAR = SVG(`<path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/>`);
export const ICON_COBRAR = SVG(`<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`);
export const ICON_RECHAZAR = SVG(`<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>`);
export const ICON_ANULAR = SVG(`<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>`);
export const ICON_DEPOSITAR = SVG(`<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>`);
export const ICON_ENDOSAR = SVG(`<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>`);
export const ICON_DEVOLVER = SVG(`<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>`);
export const ICON_ACREDITAR = SVG(`<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>`);
export const ICON_DIFERIDO = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
/**
 * Configura la navegación por teclado para los elementos interactivos
 */
export function Enter() {
  document.querySelectorAll('input, select, textarea, button').forEach((elemento, index, elementos) => {
    elemento.addEventListener('keydown', (e) => { 
      if (e.key === 'Enter') {
        e.preventDefault(); // Evita que el Enter envíe el formulario

        // Buscar el siguiente elemento visible y habilitado
        for (let i = index + 1; i < elementos.length; i++) {
          const siguiente = elementos[i];
          if (!siguiente.disabled && siguiente.offsetParent !== null) {
            siguiente.focus();
            break;
          }
        }
      }
    });
  });
}

/**
 * Valida todos los campos obligatorios de un contenedor
 * @param {string} containerSelector - Selector del contenedor (ej: '#miFormulario')
 * @returns {boolean} - true si todos los campos son válidos, false si hay errores
 */
export function validarCampos(form) {
    // Si no se pasa un formulario, buscar en todo el documento
    const contexto = form || document;

    // Buscar todos los campos requeridos dentro del formulario
    const requiredFields = contexto.querySelectorAll('[data-required="true"]:not(:disabled)');
    
    let hasErrors = false;

    requiredFields.forEach(field => {
        const value = field.value.trim();
        
        if (value === '' || value === null) {
            // Marcar campo con error
            field.classList.add('is-invalid');
            hasErrors = true;
            
            // Al hacer focus, quitar el error
            field.addEventListener('focus', function() {
                this.classList.remove('is-invalid');
            }, { once: true });
            
        } else {
            // Quitar error si tiene valor
            field.classList.remove('is-invalid');
        }
    });

    return !hasErrors;
}

/**
 * Limpia los mensajes de error de todos los campos requeridos
 */
export function dataRequiredClear() {
    document.querySelectorAll('[data-required="true"]').forEach(field => {        
        field.classList.remove('is-invalid');
    });
}

/**
 * Calcula la cantidad de filas visibles en una tabla dentro de un contenedor
 * @returns {number} - Número de filas visibles
 */
export function calcularFilasVisibles() {
  const container = document.querySelector('.table-container');
  if (!container) return 0;

  const table = container.querySelector('table');
  if (!table) return 0;

  const tbody = table.querySelector('tbody');
  const thead = table.querySelector('thead');
  const primeraFila = tbody?.querySelector('tr');

  if (!tbody || !primeraFila) return 0;

  const containerHeight = container.getBoundingClientRect().height;
  const theadHeight = thead ? thead.getBoundingClientRect().height : 0;
  const alturaFila = primeraFila.getBoundingClientRect().height;

  if (containerHeight <= 0 || alturaFila <= 0) return 0;

  const tbodyStyles = window.getComputedStyle(tbody);
  const margenSuperiorBody = Number.parseFloat(tbodyStyles.marginTop || "0") || 0;
  const margenInferiorBody = Number.parseFloat(tbodyStyles.marginBottom || "0") || 0;
  const espacioDisponible = containerHeight - theadHeight - margenSuperiorBody - margenInferiorBody;

  return Math.max(1, Math.floor(espacioDisponible / alturaFila));
}

/**
 * Formatea una fecha en formato 'YYYY-MM-DD' a 'DD/MM/YYYY'
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} - Fecha formateada en 'DD/MM/YYYY'
 */
export function formatearFecha(fecha) {
  const [año, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${año}`;
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Corta un texto a una longitud dada y agrega tooltip con el valor completo.
 * @param {string} texto - Texto a mostrar.
 * @param {number} largoMaximo - Cantidad máxima de caracteres visibles.
 * @returns {string} - HTML listo para insertar en una grilla.
 */
export function textoConElipsis(texto, largoMaximo = 40) {
  const textoCompleto = String(texto ?? "");
  const textoSeguro = escaparHtml(textoCompleto);
  const clase = "texto-con-elipsis";

  if (!textoCompleto || textoCompleto.length <= largoMaximo) {
    return `<span class="${clase}" title="${textoSeguro}">${textoSeguro}</span>`;
  }

  const textoCorto = escaparHtml(`${textoCompleto.slice(0, largoMaximo).trimEnd()}...`);
  return `<span class="${clase}" title="${textoSeguro}">${textoCorto}</span>`;
}

/**
 * Configura los eventos de entrada para campos numéricos
 */
export function configurarInputs() {
  const inputs = document.querySelectorAll('[data-tipo="numero"]');
  
  /**
   * Restringe la entrada solo a números
   * @param {Event} e - Evento de entrada
   */
  inputs.forEach(input => {
    input.addEventListener('input', function(e) {
      this.value = this.value.replace(/\D/g, '');
    });
  });
  
}

/**
 * Configura la navegación entre pestañas
 */
export function Tab() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(item => {
        item.addEventListener("click", function(){

            const tabNombre = this.dataset.tabnom;
            
            // Remover clase 'active' de todos los tabs
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Agregar clase 'active' al tab clickeado
            this.classList.add('active');
            
            // Ocultar todos los contenidos
            contents.forEach(content => content.classList.remove('active'));
            
            // Mostrar el contenido correspondiente
            const contentToShow = document.getElementById('tab-' + tabNombre);
            if(contentToShow) {
                contentToShow.classList.add('active');
            }
            
        });
    });
}

/**
 * Activa una pestaña y su contenido correspondiente
 * @param {string} tabNombre - Nombre de la pestaña a activar
 */
export function tabActive(tabNombre) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    // Remove 'active' from all tabs and contents
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    // Activate the cab tab button 
    const activeTab = document.getElementById(`cab-${tabNombre}`);        
    activeTab.classList.add('active');

    // Activate the corresponding content panel
    const activeContent = document.getElementById(`tab-${tabNombre}`);
    if (activeContent) activeContent.classList.add('active');
}

/**
 * Remueve el formato numérico de un valor, convirtiéndolo a número
 * @param {string|number} valor - Valor numérico con formato (ej. '123.45')
 * @returns {number} - Valor numérico sin formato
 */
export function RemoveFormatoNumero(valor) {
    return Number(valor.replace(/\D/g, ''));
}

// Quita el formato para enviar al backend
export function quitarFormato(valor, moneda = 'PYG') {
    if (!valor) return null;

    if (moneda === 'PYG') {
        // Quitar puntos de miles → "15.000" a 15000
        return parseInt(valor.replace(/\./g, '')) || null;
    } else {
        // Quitar puntos de miles y reemplazar coma decimal por punto → "65.000,34" a 65000.34
        return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || null;
    }
}

// Coloca el formato para mostrar en pantalla
export function importeFormato(valor, moneda = 'PYG') {
    if (valor === null || valor === undefined || valor === '') return '';

    if (moneda === 'PYG') {
        // 15000 → "15.000"
        return parseInt(valor).toLocaleString('es-PY').replace(/,/g, '.');
    } else {
        // 65000.34 → "65.000,34"
        const partes = parseFloat(valor).toFixed(2).split('.');
        const parteEntera = parseInt(partes[0]).toLocaleString('es-PY').replace(/,/g, '.');
        return `${parteEntera},${partes[1]}`;
    }
}

/**
 * Formatea los valores de importe en los campos correspondientes
 * @param {string} moneda - Moneda a utilizar para el formato ('PYG' o 'USD')
 */
export function formatearImportes(moneda = 'PYG') {
    const inputs = document.querySelectorAll('[data-importe]');

    inputs.forEach(input => {
        // Reemplazamos solo NUESTRO handler de 'input' (sin clonar el nodo), así se
        // conservan otros listeners del input —como el Enter de navegación—.
        if (input._fmtImporteHandler) {
            input.removeEventListener('input', input._fmtImporteHandler);
        }
        const handler = (e) => { e.target.value = aplicarFormato(e.target.value, moneda); };
        input._fmtImporteHandler = handler;
        input.addEventListener('input', handler);
    });
}

/**
 * Aplica el formato numérico correspondiente a un valor de importe
 * @param {string} valor - Valor numérico sin formato
 * @param {string} moneda - Moneda a utilizar para el formato ('PYG' o 'USD')
 * @returns {string} - Valor numérico formateado
 */
// function aplicarFormato(valor, moneda) {
//     if (moneda === 'PYG') {
//         valor = valor.replace(/\D/g, '');
//         return valor ? parseInt(valor).toLocaleString('es-PY').replace(/,/g, '.') : '';
//     } else {
//         valor = valor.replace(/[^0-9,]/g, '');
//         const partes = valor.split(',');
//         if (partes.length > 2) valor = partes[0] + ',' + partes[1];
//         if (partes[1]?.length > 2) valor = partes[0] + ',' + partes[1].slice(0, 2);
//         return valor;
//     }
// }
function aplicarFormato(valor, moneda) {
    if (moneda === 'PYG') {
        // Solo enteros con puntos de miles — Ej: 15.000
        valor = valor.replace(/\D/g, '');
        return valor ? parseInt(valor).toLocaleString('es-PY').replace(/,/g, '.') : '';
    } else {
        // Enteros con puntos de miles + hasta 2 decimales con coma — Ej: 65.000,34
        valor = valor.replace(/[^0-9,]/g, '');

        const partes = valor.split(',');

        // Evitar más de una coma
        if (partes.length > 2) {
            valor = partes[0] + ',' + partes[1];
        }

        // Formatear la parte entera con puntos de miles
        let parteEntera = partes[0].replace(/\D/g, '');
        if (parteEntera) {
            parteEntera = parseInt(parteEntera).toLocaleString('es-PY').replace(/,/g, '.');
        }

        // Máximo 2 decimales
        if (partes.length === 2) {
            const parteDecimal = partes[1].slice(0, 2);
            return `${parteEntera},${parteDecimal}`;
        }

        return parteEntera;
    }
}

/**
 * Limpia los valores de importe en los campos correspondientes
 */
export function limpiarImportes() {
    document.querySelectorAll('[data-importe]').forEach(input => {
        input.value = '';
    });
}
