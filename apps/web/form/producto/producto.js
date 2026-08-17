import {
    DeleteProducto,
    getByIdProducto,
    InsertProducto,
    migrateProducto,
    migrateTemplateProducto,
    listCategoria,
    listMarca,
    listProducto,
    listUbicacion,
    UpdateProducto
} from "../../js/apiEndpoints.js";
import { deleteData, downloadFile, getData, postData, postFormData, putData } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { cargaOptionsMoneda, cargaOptionsTiposPrecios, cargaOptionsUnidad } from "../../js/options.js";
import { PAISES_SIFEN } from "../../js/paises-sifen.js";
import { showSuccessToast, showWarningToast } from "../../js/toast.js";
import { calcularFilasVisibles, dataRequiredClear, Enter, Tab, tabActive, validarCampos, formatearImportes, limpiarImportes, quitarFormato, importeFormato } from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);

const setVal = (id, val) => $(id).value = val;

let modo = 'INS';
let modoPrecio = 'INS';
let proId = 0;
let precioEditIndex = -1;
let DefaultFilter = {
    texto: "",
    limit: 0,
    offset: 0
};
Enter();
Tab();
cleanupLoader();
formatearImportes('PYG');

$("unidad").innerHTML = await cargaOptionsUnidad();
$("moneda").innerHTML = await cargaOptionsMoneda();
$("tipoPrecio").innerHTML = await cargaOptionsTiposPrecios();
$("pais_origen").innerHTML = buildPaisOptions();
await cargarOpcionesClasificacion();

let currentPage = 1;
let currentBatch = 0;
let cachedData = [];
let precios = [];
let importPreviewRows = [];
let importPreviewHeaders = [];
let importSelectedFile = null;
let importErrorsCache = [];
let reopenImportModalAfterErrors = false;
let totalRecords = 0;
let FILAS_POR_PAGINA = calcularFilasVisibles();
const ROWS_PER_PAGE = FILAS_POR_PAGINA;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH; // 90
const pageInfo = $("pageinfo");

const btnAgregarPrecio = $("btnAgregarPrecio");
const btnImportExcel = $("btnImportExcel");

function setImportActionState(disabled) {
    $("btnSubirImportacion").disabled = disabled;
}

async function cargarOpcionesClasificacion() {
    const filtro = { texto: "", limit: 0, offset: 0 };
    const [categoriasResponse, marcasResponse, ubicacionesResponse] = await Promise.all([
        postData(listCategoria, filtro),
        postData(listMarca, filtro),
        postData(listUbicacion, filtro)
    ]);

    $("categoria").innerHTML = buildOptions(
        categoriasResponse.success ? categoriasResponse.objectsList || [] : [],
        "cat_id",
        "cat_nom"
    );
    $("marca").innerHTML = buildOptions(
        marcasResponse.success ? marcasResponse.objectsList || [] : [],
        "mar_id",
        "mar_nom"
    );
    $("ubicacion").innerHTML = buildOptions(
        ubicacionesResponse.success ? ubicacionesResponse.objectsList || [] : [],
        "ubi_id",
        "ubi_ubicacion"
    );
}

function buildOptions(items, valueKey, textKey) {
    return '<option value="">Seleccionar...</option>' + items
        .map((item) => `<option value="${item[valueKey]}">${item[textKey]}</option>`)
        .join("");
}

function buildPaisOptions() {
    return PAISES_SIFEN.map((item) => (
        `<option value="${item.codigo}">${item.descripcion}</option>`
    )).join("");
}

function parseIntegerOrNull(value) {
    const normalized = String(value ?? "").trim();
    if (normalized === "") return null;
    const parsed = Number.parseInt(normalized, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function parseDecimalOrNull(value) {
    const normalized = String(value ?? "").trim();
    if (normalized === "") return null;
    const parsed = Number.parseFloat(normalized.replace(",", "."));
    return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Carga un lote desde la API
 */
async function loadBatch(batchNumber) {
    const offset = batchNumber * RECORDS_PER_BATCH;

    DefaultFilter.texto = $("searchInput").value.trim();
    DefaultFilter.limit = RECORDS_PER_BATCH;
    DefaultFilter.offset = offset;

    const response = await postData(listProducto, DefaultFilter);
    
    if (response.success) {
        currentBatch = batchNumber;
        cachedData = response.objectsList || [];
        totalRecords = response.totalRecords || 0;
    }
    //pageInfo.textContent = `Mostrando 1 a ${FILAS_POR_PAGINA > totalRecords ? totalRecords : FILAS_POR_PAGINA} de ${totalRecords} registros`;
}

/**
 * Renderiza una página
 */
function renderPage(pageNumber) {    
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    pageNumber = pageNumber > totalPages ? totalPages : pageNumber;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    currentPage = pageNumber;
    const indexInBatch = (pageNumber - 1) % PAGES_PER_BATCH;
    const startIndex = indexInBatch * ROWS_PER_PAGE;
    const pageData = cachedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    pageInfo.textContent = `Total registros ${totalRecords}`;
    renderPaginationControls(totalPages);
    renderTable(pageData);
}

function renderPaginationControls(totalPages) {
    const pagesContainer = $("productoPaginationPages");
    if (!pagesContainer) {
        return;
    }

    pagesContainer.innerHTML = "";

    const items = [];
    const safeTotal = Math.max(1, totalPages);

    if (safeTotal <= 4) {
        for (let page = 1; page <= safeTotal; page += 1) {
            items.push(page);
        }
    } else if (currentPage <= 2) {
        items.push(1, 2, 3, "ellipsis", safeTotal);
    } else if (currentPage >= safeTotal - 1) {
        items.push(1, "ellipsis", safeTotal - 2, safeTotal - 1, safeTotal);
    } else {
        items.push(currentPage - 1, currentPage, currentPage + 1, "ellipsis", safeTotal);
    }

    items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";

        if (item === "ellipsis") {
            button.className = "pagination-ellipsis no-cursor";
            button.disabled = true;
            button.textContent = "...";
            pagesContainer.appendChild(button);
            return;
        }

        button.textContent = String(item);
        if (Number(item) === currentPage) {
            button.classList.add("active", "no-cursor");
        } else {
            button.addEventListener("click", async () => {
                const targetPage = Number(item);
                const newBatch = Math.floor((targetPage - 1) / PAGES_PER_BATCH);
                if (newBatch !== currentBatch) {
                    await loadBatch(newBatch);
                }
                renderPage(targetPage);
            });
        }

        pagesContainer.appendChild(button);
    });

    $("btnpagPrimero").disabled = currentPage <= 1;
    $("btnpagAnterior").disabled = currentPage <= 1;
    $("btnpagSiguiente").disabled = currentPage >= safeTotal;
    $("btnpagUltimo").disabled = currentPage >= safeTotal;
}


/**
 * Primera página
 */
async function firstPage() {
    if (currentBatch !== 0) await loadBatch(0);
    renderPage(1);
}

/**
 * Página anterior
 */
async function previousPage() {
    if (currentPage > 1) {
        const newBatch = Math.floor((currentPage - 2) / PAGES_PER_BATCH);
        if (newBatch !== currentBatch) await loadBatch(newBatch);
        renderPage(currentPage - 1);

    }
}
$("btnpagAnterior").addEventListener("click", async function(){
    previousPage()
});

/**
 * Página siguiente
 */
async function nextPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    if (currentPage < totalPages) {
        const newBatch = Math.floor(currentPage / PAGES_PER_BATCH);
        if (newBatch !== currentBatch) await loadBatch(newBatch);
        renderPage(currentPage + 1);
    }
}
$("btnpagSiguiente").addEventListener("click", async function(){
    nextPage()
});

$("btnpagPrimero").addEventListener("click", async function(){
    firstPage();
});

$("btnpagUltimo").addEventListener("click", async function(){
    lastPage();
});

/**
 * Última página
 */
async function lastPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    const lastBatch = Math.floor((totalPages - 1) / PAGES_PER_BATCH);
    if (lastBatch !== currentBatch) await loadBatch(lastBatch);
    renderPage(totalPages);
}

/**
 * Inicializar
 */
async function initPagination() {    
    await loadBatch(0);
    renderPage(1);
}
initPagination();
showLoader();
setDefaultProductoFormState();

/**
 * Función para renderizar tabla (implementar según tu HTML)
 */
function renderTable(data) {
    const tablaProductos = $("tablaProductos");
    tablaProductos.innerHTML = "";
    if(data.length === 0) {
        setTimeout(() => {
            hideLoader(); 
        }, 200);        
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <h3>No se encontraron datos</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </td>
            </tr>
        `;
        return;    
    }

    data.forEach(item => {
        const fila = document.createElement("tr");
        fila.classList.add('sm');
        fila.innerHTML = `
            <td data-label="ID">${item.proid}</td>
            <td data-label="GTIN">${item.gtin || ''}</td>
            <td data-label="Descripción">${item.prodesc}</td>
            <td data-label="Activo">${item.activo === false ? "Inactivo" : "Activo"}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="ver" data-id="${item.proid}" title="Ver">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="editar" data-id="${item.proid}" title="Editar" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminar" data-id="${item.proid}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>             
        `;
        tablaProductos.appendChild(fila);     
    });

    const botonesVer = document.querySelectorAll('[tipo-btn="ver"]');
    botonesVer.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;            
            modo = 'VER';
            getById(id);
        });
    });     

    const botonesModificar = document.querySelectorAll('[tipo-btn="editar"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;  
            modo = 'UPD';
            getById(id);
        });
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminar"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el producto?`,
                onEliminar: () => eliminar(id)
            });
        });
    });   

    hideLoader(); 
}

$("searchInput").addEventListener("input", () => {
    DefaultFilter.texto = $("searchInput").value;
    initPagination();
});

$('moneda').addEventListener('change', (e) => {
    limpiarImportes();             // Limpia los valores para evitar formatos mezclados
    formatearImportes(e.target.value);  // Aplica nuevo formato
});

function openModal() {    
    $('producModal').classList.add('active');           
    setTimeout(function() {
        $('descripcion').focus();
    }, 200);
}

function closeModal() {
    $('producModal').classList.remove('active');
}

function openImportExcelModal() {
    $("importExcelModal").classList.add("active");
}

function closeImportExcelModal() {
    $("importExcelModal").classList.remove("active");
}

function resetImportPreview() {
    importPreviewRows = [];
    importPreviewHeaders = [];
    importSelectedFile = null;
    importErrorsCache = [];
    $("excelFileInput").value = "";
    $("importFileMeta").textContent = "Sin archivo seleccionado";
    $("importRowsCount").textContent = "0";
    $("importColumnsCount").textContent = "0";
    $("importHeaders").textContent = "Sin datos";
    $("importSuccessCount").textContent = "0";
    $("importFailedCount").textContent = "0";
    $("importStatusText").textContent = "Esperando archivo";
    $("btnVerErroresImportacion").hidden = true;
    setImportActionState(true);
    $("importErrorsBody").innerHTML = `
        <tr>
            <td colspan="3">
                <div class="compact-empty-state">
                    <h3>Sin errores de importación</h3>
                </div>
            </td>
        </tr>
    `;
}

function renderImportErrors(errores = []) {
    importErrorsCache = errores;
    const tbody = $("importErrorsBody");
    if (!errores.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="compact-empty-state">
                        <h3>Sin errores de importación</h3>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = errores.map((item, index) => `
        <tr class="sm">
            <td data-label="Fila">${item.fila ?? ""}</td>
            <td data-label="Producto">${item.prodesc ?? "-"}</td>
            <td data-label="Error">${item.error ?? "Error no especificado"}</td>
        </tr>
    `).join("");
}

function openImportErrorsModal() {
    if (!importErrorsCache.length) {
        return;
    }
    reopenImportModalAfterErrors = $("importExcelModal").classList.contains("active");
    if (reopenImportModalAfterErrors) {
        closeImportExcelModal();
    }
    $("importErrorsModal").classList.add("active");
}

function closeImportErrorsModal() {
    $("importErrorsModal").classList.remove("active");
    if (reopenImportModalAfterErrors) {
        reopenImportModalAfterErrors = false;
        openImportExcelModal();
    }
}

function renderImportResult(resultado) {
    $("importSuccessCount").textContent = String(resultado?.exitosos ?? 0);
    $("importFailedCount").textContent = String(resultado?.fallidos ?? 0);
    $("importStatusText").textContent = `${resultado?.exitosos ?? 0} / ${resultado?.totalRegistros ?? 0} importados`;
    const errores = resultado?.errores || [];
    $("btnVerErroresImportacion").hidden = errores.length === 0;
    renderImportErrors(errores);
}

function renderImportPreview(headers = [], rows = []) {
    importPreviewHeaders = headers;
    importPreviewRows = rows;
    $("importRowsCount").textContent = String(rows.length);
    $("importColumnsCount").textContent = String(headers.length);
    $("importHeaders").textContent = headers.length ? headers.join(", ") : "Sin datos";
}

function normalizeWorksheetRows(sheetRows = []) {
    const sanitizedRows = sheetRows.filter((row) => row && Object.values(row).some((value) => String(value ?? "").trim() !== ""));
    const headers = sanitizedRows.length ? Object.keys(sanitizedRows[0]) : [];
    return { headers, rows: sanitizedRows };
}

async function readImportFile(file) {
    if (!file) {
        return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["xlsx", "xls"].includes(extension)) {
        showWarningToast("Formato inválido", "Solo se permiten archivos .xls o .xlsx.", 3000);
        resetImportPreview();
        return;
    }

    importSelectedFile = file;
    setImportActionState(false);
    $("importFileMeta").textContent = `${file.name} - ${(file.size / 1024).toFixed(1)} KB`;

    try {
        if (!window.XLSX) {
            showWarningToast("Lector no disponible", "No se pudo cargar el lector de archivos Excel.", 3000);
            return;
        }

        const buffer = await file.arrayBuffer();
        const workbook = window.XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetRows = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        const { headers, rows } = normalizeWorksheetRows(sheetRows);
        renderImportPreview(headers, rows);
    } catch (error) {
        console.error("Error al leer archivo de importación:", error);
        showWarningToast("Archivo inválido", "No se pudo leer el archivo seleccionado.", 3000);
        resetImportPreview();
    }
}

async function descargarPlantillaMigracion() {
    try {
        showLoader("Descargando plantilla...");
        const { blob, filename } = await downloadFile(migrateTemplateProducto, "plantilla-productos.xlsx", "Producto");
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename || "plantilla-productos.xlsx";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        showSuccessToast("Descargado", "Plantilla descargada con éxito", 1800);
    } catch (error) {
        console.error("Error al descargar plantilla:", error);
    } finally {
        hideLoader();
    }
}

async function subirArchivoMigracion() {
    if (!importSelectedFile) {
        showWarningToast("Archivo requerido", "Selecciona un archivo Excel antes de subir.", 3000);
        return;
    }

    try {
        showLoader("Importando productos...");
        setImportActionState(true);

        const formData = new FormData();
        formData.append("file", importSelectedFile);

        const response = await postFormData(migrateProducto, formData, "Producto");
        const resultado = response.data || {};
        renderImportResult(resultado);

        if ((resultado.exitosos || 0) > 0) {
            await initPagination();
        }

        if ((resultado.fallidos || 0) > 0) {
            showWarningToast("Importación finalizada", `${resultado.exitosos || 0} importados y ${resultado.fallidos || 0} con error.`, 4000);
        } else {
            showSuccessToast("Importación exitosa", `${resultado.exitosos || 0} productos importados correctamente.`, 2500);
        }
    } catch (error) {
        console.error("Error al migrar productos:", error);
    } finally {
        hideLoader();
        setImportActionState(!importSelectedFile);
    }
}

function syncStockNegativo() {
    const controlaStock = $("ctrlstock").checked;
    const container = $("stockNegativoContainer")?.querySelector(".custom-checkbox-container");

    if (!container) {
        return;
    }

    if (!controlaStock) {
        $("stocknegativo").checked = false;
    }

    container.classList.toggle("is-hidden-preserve-space", !controlaStock);
    container.setAttribute("aria-hidden", String(!controlaStock));
}

function syncAfectacionIVA() {
    const afectacion = $("afectacion_iva").value;
    const tasa = $("tasa_iva");

    if (afectacion === "2" || afectacion === "3") {
        tasa.value = "0";
        tasa.disabled = true;
        return;
    }

    tasa.disabled = false;
    if (!["5", "10"].includes(tasa.value)) {
        tasa.value = "10";
    }
}

function syncIscFields() {
    const aplicaIsc = $("aplica_isc").value === "true";
    const tasaIsc = $("tasa_isc");
    const proporcionIsc = $("proporcion_isc");

    tasaIsc.disabled = !aplicaIsc;
    proporcionIsc.disabled = !aplicaIsc;

    if (!aplicaIsc) {
        tasaIsc.value = "";
        proporcionIsc.value = "";
        tasaIsc.classList.remove("is-invalid");
        proporcionIsc.classList.remove("is-invalid");
    }
}

function setDefaultProductoFormState() {
    setVal("tipo_producto", "1");
    setVal("afectacion_iva", "1");
    setVal("tasa_iva", "10");
    setVal("proporcion_iva", "100");
    setVal("pais_origen", "PRY");
    setVal("aplica_isc", "false");
    $("ctrlstock").checked = true;
    $("moddesc").checked = false;
    $("modprec").checked = false;
    $("stocknegativo").checked = false;
    $("activo").checked = true;
    syncAfectacionIVA();
    syncIscFields();
    syncStockNegativo();
}

window.onclick = function(event) {
    const productoModal = $('producModal');
    const importModal = $('importExcelModal');
    const importErrorsModal = $('importErrorsModal');
    if (event.target === productoModal) {
        closeModal();
    }
    if (event.target === importModal) {
        closeImportExcelModal();
    }
    if (event.target === importErrorsModal) {
        closeImportErrorsModal();
    }
};

function New() {
    $('modalTitle').textContent = 'Nuevo Producto';
    limpiar();
    openModal();    
}

$("btnNew").addEventListener("click", New);
$("btnCloseModal").addEventListener("click", closeModal);
$("btnCancel").addEventListener("click", closeModal);
btnImportExcel.addEventListener("click", openImportExcelModal);
$("btnCloseImportExcelModal").addEventListener("click", closeImportExcelModal);
$("btnCancelImportExcel").addEventListener("click", closeImportExcelModal);
$("btnVerErroresImportacion").addEventListener("click", openImportErrorsModal);
$("btnCloseImportErrorsModal").addEventListener("click", closeImportErrorsModal);
$("btnAceptarImportErrorsModal").addEventListener("click", closeImportErrorsModal);
$("btnDescargarPlantilla").addEventListener("click", descargarPlantillaMigracion);
$("btnSeleccionarExcel").addEventListener("click", () => $("excelFileInput").click());
$("btnSubirImportacion").addEventListener("click", subirArchivoMigracion);
$("btnLimpiarImportacion").addEventListener("click", resetImportPreview);
$("excelFileInput").addEventListener("change", (event) => {
    readImportFile(event.target.files?.[0]);
});

const importDropzone = $("importDropzone");
["dragenter", "dragover"].forEach((eventName) => {
    importDropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        importDropzone.classList.add("is-dragover");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    importDropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        importDropzone.classList.remove("is-dragover");
    });
});

importDropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) {
        readImportFile(file);
    }
});

importDropzone.addEventListener("click", () => $("excelFileInput").click());
importDropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        $("excelFileInput").click();
    }
});

function limpiar() {
    proId = 0;
    precios = [];
    modo = "INS";
    modoPrecio = "INS";
    precioEditIndex = -1;
    $('generalForm').reset();
    $('tributarioForm').reset();
    $("PrecioForm").reset();
    $("btnGuardar").style.display = '';
    setDefaultProductoFormState();
    tabActive('general');
    dataRequiredClear();
    $("precioTableBody").innerHTML = '';
    setTimeout(() => {
        $("descripcion").focus();
    }, 100);
}

function getPrecioKey(tipo, moneda) {
    return `${String(tipo)}|${String(moneda || "")}`;
}

function resetPrecioForm() {
    modoPrecio = "INS";
    precioEditIndex = -1;
    $("PrecioForm").reset();
    btnAgregarPrecio.innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    limpiarImportes();
}

function addPrecio() {
    if(!validarCampos($("PrecioForm"))) {
        return;
    }
    const valid = validarTipoPrecio();
    if(!valid) {
        return;
    }

    const itemPrecio = {
        id_producto: proId,
        tipo: $("tipoPrecio").value,
        tipoText: $("tipoPrecio").options[$("tipoPrecio").selectedIndex].text,
        moneda: $("moneda").value,
        monedaText: $("moneda").options[$("moneda").selectedIndex].text,
        precio: quitarFormato($("precio").value, $('moneda').value),
        estado: true,
    };

    if (modoPrecio === "UPD" && precioEditIndex > -1) {
        itemPrecio.estado = precios[precioEditIndex]?.estado ?? true;
        precios[precioEditIndex] = itemPrecio;
    } else {
        precios.push(itemPrecio);
    }

    renderPrecio(precios);
    resetPrecioForm();
}

function editPrecio(tipo, moneda) {
    precioEditIndex = precios.findIndex((item) => getPrecioKey(item.tipo, item.moneda) === getPrecioKey(tipo, moneda));
    const item = precios[precioEditIndex];
    if(item) {
        $("tipoPrecio").value = item.tipo;
        $("moneda").value = item.moneda || "PYG";
        $("precio").value = importeFormato(item.precio, item.moneda || "PYG");
        formatearImportes(item.moneda || "PYG");
    }
}

function eliminarPrecio(tipo, moneda) {
    const index = precios.findIndex((item) => getPrecioKey(item.tipo, item.moneda) === getPrecioKey(tipo, moneda));
    if(index !== -1) {
        precios.splice(index, 1);
        renderPrecio(precios);
        if (precioEditIndex === index) {
            resetPrecioForm();
        }
    }
}

function validarTipoPrecio() {
    const keyActual = getPrecioKey($("tipoPrecio").value, $("moneda").value);
    const yaExiste = precios.some((item, index) => {
        if (modoPrecio === "UPD" && index === precioEditIndex) {
            return false;
        }
        return getPrecioKey(item.tipo, item.moneda) === keyActual;
    });

    if (yaExiste) {
        showWarningToast('Atención', 'Ya existe un precio con el mismo tipo y moneda.', 3000);
        return false;
    }
    return true;
}

function manejarEstadoPrecio(checkbox) {
    const tipo = checkbox.dataset.tipo;
    const moneda = checkbox.dataset.moneda;
    const nuevoEstado = checkbox.checked;

    const index = precios.findIndex((item) => getPrecioKey(item.tipo, item.moneda) === getPrecioKey(tipo, moneda));
    if (index !== -1) {
        precios[index].estado = nuevoEstado;
    }
}

function renderPrecio(precios) {
    const tableBody = $('precioTableBody');
    tableBody.innerHTML = '';
    precios.forEach((item, index) => {
        const fila = document.createElement('tr');
        fila.classList.add('sm');
        fila.innerHTML = `
            <td data-label="Tipo">${item.tipoText}</td>
            <td data-label="Moneda">${item.monedaText || item.moneda || ""}</td>
            <td data-label="Precio">${importeFormato(item.precio, item.moneda || "PYG")}</td>
            <td data-label="Estado">
                <label class="switch">
                    <input type="checkbox" data-id="${item.id_producto}" data-tipo="${item.tipo}" data-moneda="${item.moneda}" ${item.estado ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarPrecio" data-tipo="${item.tipo}" data-moneda="${item.moneda}" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarPrecio" data-tipo="${item.tipo}" data-moneda="${item.moneda}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
        fila.querySelector('input[type="checkbox"]').addEventListener('change', function() {
            manejarEstadoPrecio(this);
        });
        tableBody.appendChild(fila);        
    });
    
    const botonesModificar = document.querySelectorAll('[tipo-btn="editarPrecio"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const tipo = boton.dataset.tipo;
            const moneda = boton.dataset.moneda;
            modoPrecio = 'UPD';
            btnAgregarPrecio.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;            
            editPrecio(tipo, moneda);
        });
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminarPrecio"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const tipo = boton.dataset.tipo;
            const moneda = boton.dataset.moneda;
            eliminarPrecio(tipo, moneda);
        });
    });

}

btnAgregarPrecio.addEventListener("click", addPrecio);

function StringData() {
    const aplicaIsc = $("aplica_isc").value === "true";

    return {
        proid: proId,
        gtin: $("gtin").value.trim() === '' ? null : $("gtin").value.trim(),
        gtin_paquete: $("gtin_paquete").value.trim() === '' ? null : $("gtin_paquete").value.trim(),
        prodesc: $("descripcion").value.trim(),
        tipo_producto: parseIntegerOrNull($("tipo_producto").value),
        unidad: $("unidad").value,
        categoria: $("categoria").value === "" ? null : Number($("categoria").value),
        marca: $("marca").value === "" ? null : Number($("marca").value),
        ubicacion: $("ubicacion").value === "" ? null : Number($("ubicacion").value),
        afectacion_iva: parseIntegerOrNull($("afectacion_iva").value),
        tasa_iva: parseDecimalOrNull($("tasa_iva").value),
        proporcion_iva: parseDecimalOrNull($("proporcion_iva").value),
        aplica_isc: aplicaIsc,
        tasa_isc: aplicaIsc ? parseDecimalOrNull($("tasa_isc").value) : null,
        proporcion_isc: aplicaIsc ? parseDecimalOrNull($("proporcion_isc").value) : null,
        ncm: $("ncm").value.trim() === "" ? null : $("ncm").value.trim(),
        partida_arancelaria: $("partida_arancelaria").value.trim() === "" ? null : $("partida_arancelaria").value.trim(),
        pais_origen: $("pais_origen").value || "PRY",
        dncp_nivel_general: $("dncp_nivel_general").value.trim() === "" ? null : $("dncp_nivel_general").value.trim(),
        dncp_nivel_especifico: $("dncp_nivel_especifico").value.trim() === "" ? null : $("dncp_nivel_especifico").value.trim(),
        ctrlstock: $("ctrlstock").checked,
        moddesc: $("moddesc").checked,
        modprec: $("modprec").checked,
        stocknegativo: $("stocknegativo").checked,
        activo: $("activo").checked,
        proobs: $("proobs").value.trim(),
        precioList: precios,
    }
}

async function eliminar(id) {
    try {
        const response = await deleteData(`${DeleteProducto}?id=${id}`, "Producto");        
        if (response.success) {
            showSuccessToast("Eliminado","Producto eliminado con éxito", 2000);
            Pop(id);
        }
    } catch (error) {
        console.error(error);
    }
}

function Pop(id) {
    totalRecords--;
    const index = cachedData.findIndex((item) => String(item.proid) === String(id));
    if (index !== -1) {
        cachedData.splice(index, 1);
    }
    renderPage(currentPage);
}

async function getById(id) {
    try {
        tabActive('general');
        $('generalForm').reset();
        $('tributarioForm').reset();
        $("PrecioForm").reset();
        $("btnGuardar").style.display = '';
        dataRequiredClear();

        const response = await getData(`${getByIdProducto}?id=${id}`, "Producto");
        if (response.success) {
            const producto = response.data;
            setVal("descripcion", producto.prodesc);
            $('modalTitle').textContent = 'Modificar Producto';
            
            if(modo === "VER") {
                $("btnGuardar").style.display = 'none';
                $('modalTitle').textContent = 'Visualizar Producto';
            }
            setVal("tipo_producto", String(producto.tipo_producto ?? 1));
            setVal("gtin", producto.gtin ?? producto.codbarra ?? "");
            setVal("gtin_paquete", producto.gtin_paquete ?? "");
            setVal("unidad", producto.unidad);
            setVal("categoria", producto.categoria ?? "");
            setVal("marca", producto.marca ?? "");
            setVal("ubicacion", producto.ubicacion ?? "");
            setVal("afectacion_iva", String(producto.afectacion_iva ?? ((Number(producto.impuesto) || 0) === 0 ? 3 : 1)));
            setVal("tasa_iva", String(producto.tasa_iva ?? producto.impuesto ?? 10));
            setVal("proporcion_iva", producto.proporcion_iva ?? 100);
            setVal("aplica_isc", producto.aplica_isc ? "true" : "false");
            setVal("tasa_isc", producto.tasa_isc ?? "");
            setVal("proporcion_isc", producto.proporcion_isc ?? "");
            setVal("ncm", producto.ncm ?? "");
            setVal("partida_arancelaria", producto.partida_arancelaria ?? "");
            setVal("pais_origen", producto.pais_origen || "PRY");
            setVal("dncp_nivel_general", producto.dncp_nivel_general ?? "");
            setVal("dncp_nivel_especifico", producto.dncp_nivel_especifico ?? "");
            setVal("proobs", producto.proobs ?? "");
            precios = (producto.precioList || []).map((item) => ({
                ...item,
                moneda: item.moneda || producto.moneda || "PYG",
                monedaText: item.monedaText || item.moneda || producto.moneda || "PYG"
            }));
            renderPrecio(precios);
            
            $("ctrlstock").checked = Boolean(producto.ctrlstock);
            $("moddesc").checked = Boolean(producto.moddesc);
            $("modprec").checked = Boolean(producto.modprec);
            $("stocknegativo").checked = Boolean(producto.stocknegativo);
            $("activo").checked = producto.activo !== false;
            syncAfectacionIVA();
            syncIscFields();
            syncStockNegativo();
            
            proId = id;
            openModal();
        }
    } catch (error) {
        console.error(error);
    }
}

function validGPrecio() {
    if (precios.length === 0) {
        showWarningToast("Advertencia", "Por favor, agregue precios para el producto", 2000);
        tabActive('precios');
        return false;
    }

    // Verificar que exista al menos un precio con tipo 1
    const tieneTipo1 = precios.some(item => String(item.tipo) === "1");
    if (!tieneTipo1) {
        showWarningToast("Advertencia", "Debe existir al menos un precio de tipo Casual", 2000);
        tabActive('precios');
        return false;
    }

    // Verificar que exista al menos un precio de tipo 1 esté activo
    const Tipo1Activo = precios.some(item => String(item.tipo) === "1" && item.estado === true);
    if (!Tipo1Activo) {
        showWarningToast("Advertencia", "Debe haber al menos un precio casual activo", 2000);
        tabActive('precios');
        return false;
    }    

    // Verificar que al menos un precio esté activo
    const tieneActivo = precios.some(item => item.estado === true || item.estado === 1);
    if (!tieneActivo) {
        showWarningToast("Advertencia", "Debe haber al menos un precio activo", 2000);
        tabActive('precios');
        return false;
    }

    return true;
}

function validarIva() {
    const afectacion = $("afectacion_iva").value;
    const tasa = $("tasa_iva").value;
    const proporcion = parseDecimalOrNull($("proporcion_iva").value);

    if (proporcion === null || proporcion < 0 || proporcion > 100) {
        showWarningToast("Advertencia", "La proporción IVA debe estar entre 0 y 100.", 2500);
        tabActive('tributario');
        $("proporcion_iva").focus();
        return false;
    }

    if ((afectacion === "2" || afectacion === "3") && tasa !== "0") {
        showWarningToast("Advertencia", "Para afectación exonerada o exenta, la tasa IVA debe ser 0.", 2500);
        tabActive('tributario');
        $("tasa_iva").focus();
        return false;
    }

    if ((afectacion === "1" || afectacion === "4") && !["5", "10"].includes(tasa)) {
        showWarningToast("Advertencia", "Para afectación gravada o gravada parcial, la tasa IVA debe ser 5 o 10.", 2500);
        tabActive('tributario');
        $("tasa_iva").focus();
        return false;
    }

    return true;
}

function validarIsc() {
    if ($("aplica_isc").value !== "true") {
        return true;
    }

    const tasaIsc = parseDecimalOrNull($("tasa_isc").value);
    const proporcionIsc = parseDecimalOrNull($("proporcion_isc").value);

    if (tasaIsc === null) {
        showWarningToast("Advertencia", "Debe ingresar la tasa ISC.", 2500);
        tabActive('tributario');
        $("tasa_isc").focus();
        return false;
    }

    if (proporcionIsc === null || proporcionIsc < 0 || proporcionIsc > 100) {
        showWarningToast("Advertencia", "La proporción ISC debe estar entre 0 y 100.", 2500);
        tabActive('tributario');
        $("proporcion_isc").focus();
        return false;
    }

    return true;
}

function validarProducto() {
    if (!validarCampos($("generalForm"))) {
        tabActive('general');
        return false;
    }

    if (!validarCampos($("tributarioForm"))) {
        tabActive('tributario');
        return false;
    }

    if (!validarIva() || !validarIsc()) {
        return false;
    }

    return validGPrecio();
}

async function insert() {
    try {
        if(!validarProducto()) {
            return;
        }                        
        const response = await postData(InsertProducto, StringData(), "Producto");
        if (response.success) {
            console.log(response.data);
            afterInsert(response.data);
            showSuccessToast(modo === "INS" ? "Registrado" : "Actualizado", "Producto " + (modo === "INS" ? "registrado" : "actualizado") + " con éxito", 2000);
            limpiar();
        }
    } catch (error) {
        console.error(error);
    }
}

function afterInsert(data) {    
    totalRecords++;
    cachedData.push({
        ...data,
        gtin: data.gtin ?? "",
        activo: data.activo !== false
    });
    currentPage = currentPage < 1 ? 1 : currentPage;
    renderPage(currentPage);
}

async function update() {
    try {
        if(!validarProducto()) {
            return;
        }                        
        const response = await putData(UpdateProducto, StringData(), "Producto");
        if (response.success) {
            afterUpdate(response.data);
            showSuccessToast(modo === "INS" ? "Registrado" : "Actualizado", "Producto " + (modo === "INS" ? "registrado" : "actualizado") + " con éxito", 2000);
            closeModal();
            limpiar();
        }
    } catch (error) {
        console.error(error);
    }
}

function afterUpdate(data) {
    const cacheIndex = cachedData.findIndex((item) => String(item.proid) === String(data.proid));
    if (cacheIndex !== -1) {
        cachedData[cacheIndex] = {
            ...cachedData[cacheIndex],
            ...data
        };
    }

    const tabla = document.getElementById('tablaProductos');
    const filas = tabla.querySelectorAll('tr');

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');

        if (celdas[0].textContent.trim() === String(data.proid)) {
            celdas[1].textContent = data.gtin ?? '';
            celdas[2].textContent = data.prodesc;
            celdas[3].textContent = data.activo === false ? "Inactivo" : "Activo";
        }
    });    
}

$("btnGuardar").addEventListener("click", () => {
    if(modo === "INS") {
        insert();  
    } else {
        update();
    }         
});

$("ctrlstock").addEventListener("change", syncStockNegativo);
$("afectacion_iva").addEventListener("change", syncAfectacionIVA);
$("aplica_isc").addEventListener("change", syncIscFields);

["gtin", "gtin_paquete"].forEach((id) => {
    $(id).addEventListener("input", (event) => {
        event.target.value = event.target.value.replace(/\D/g, "").slice(0, 14);
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("importExcelModal").classList.contains("active")) {
        closeImportExcelModal();
    }
    if (event.key === "Escape" && $("importErrorsModal").classList.contains("active")) {
        closeImportErrorsModal();
    }
});

resetImportPreview();
