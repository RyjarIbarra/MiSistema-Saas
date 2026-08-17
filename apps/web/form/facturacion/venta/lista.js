import { listDocumento } from "../../../js/apiEndpoints.js";
import { postData } from "../../../js/apiService.js";
import { Enter, calcularFilasVisibles, formatearFecha, importeFormato } from "../../../js/utilidades.js";

const $ = (id) => document.getElementById(id);

let facturas = [];
let totalRecords = 0;
let currentPage = 1;
let currentBatch = 0;

const DefaultFilter = {
    texto: "",
    limit: 0,
    offset: 0
};

const FILAS_POR_PAGINA = Math.max(calcularFilasVisibles(), 8);
const ROWS_PER_PAGE = FILAS_POR_PAGINA;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH;

Enter();

function normalizarTexto(valor) {
    return String(valor || "").toLowerCase().trim();
}

function estadoVacio() {
    return `
        <tr>
            <td colspan="9">
                <div class="empty-state">
                    <i class="fa-solid fa-file-invoice"></i>
                    <h3>No se encontraron facturas</h3>
                    <p>Intenta ajustar la búsqueda o emitir una nueva factura.</p>
                </div>
            </td>
        </tr>
    `;
}

function formatearFechaDocumento(fecha) {
    const fechaBase = String(fecha || "").split("T")[0];
    return fechaBase ? formatearFecha(fechaBase) : "";
}

function condicionTexto(valor) {
    return valor === "R" ? "CRÉDITO" : "CONTADO";
}

function estadoTexto(valor) {
    return String(valor || "").toUpperCase() || "EMITIDO";
}

function renderTable(data) {
    const tbody = $("tablaFacturas");
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = estadoVacio();
        return;
    }

    data.forEach((factura) => {
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="Fecha">${formatearFechaDocumento(factura.fecha)}</td>
            <td data-label="Comprobante">${factura.comprobante || ""}</td>
            <td data-label="Timbrado">${factura.timbrado || ""}</td>
            <td data-label="RUC/CI">${factura.ruc || ""}</td>
            <td data-label="Cliente">${factura.cliente || ""}</td>
            <td data-label="Condición">${condicionTexto(factura.condicion)}</td>
            <td data-label="Moneda">${factura.moneda || "PYG"}</td>
            <td data-label="Total" class="text-end">${importeFormato(factura.total || 0, factura.moneda || "PYG")}</td>
            <td data-label="Estado">${estadoTexto(factura.estado)}</td>
        `;
        tbody.appendChild(fila);
    });
}

function renderPaginationControls(totalPages) {
    const pagesContainer = $("facturaPaginationPages");
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

function renderPage(pageNumber) {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    currentPage = Math.min(Math.max(pageNumber, 1), totalPages);

    const indexInBatch = (currentPage - 1) % PAGES_PER_BATCH;
    const startIndex = indexInBatch * ROWS_PER_PAGE;
    const pageData = facturas.slice(startIndex, startIndex + ROWS_PER_PAGE);

    $("pageinfo").textContent = `Total registros ${totalRecords}`;
    renderPaginationControls(totalPages);
    renderTable(pageData);
}

async function loadBatch(batchNumber) {
    DefaultFilter.texto = normalizarTexto($("searchInput").value);
    DefaultFilter.limit = RECORDS_PER_BATCH;
    DefaultFilter.offset = batchNumber * RECORDS_PER_BATCH;

    const response = await postData(listDocumento, DefaultFilter, "Documentos");

    if (response.success) {
        currentBatch = batchNumber;
        facturas = response.objectsList || [];
        totalRecords = response.totalRecords || 0;
        return;
    }

    facturas = [];
    totalRecords = 0;
}

async function firstPage() {
    if (currentBatch !== 0) {
        await loadBatch(0);
    }
    renderPage(1);
}

async function previousPage() {
    if (currentPage <= 1) {
        return;
    }

    const targetPage = currentPage - 1;
    const newBatch = Math.floor((targetPage - 1) / PAGES_PER_BATCH);
    if (newBatch !== currentBatch) {
        await loadBatch(newBatch);
    }
    renderPage(targetPage);
}

async function nextPage() {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    if (currentPage >= totalPages) {
        return;
    }

    const targetPage = currentPage + 1;
    const newBatch = Math.floor((targetPage - 1) / PAGES_PER_BATCH);
    if (newBatch !== currentBatch) {
        await loadBatch(newBatch);
    }
    renderPage(targetPage);
}

async function lastPage() {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    const lastBatch = Math.floor((totalPages - 1) / PAGES_PER_BATCH);
    if (lastBatch !== currentBatch) {
        await loadBatch(lastBatch);
    }
    renderPage(totalPages);
}

function navegarNuevaFactura() {
    try {
        const parentOption = window.parent.document.querySelector('.option[data-key="5F2V8A2"]');
        if (parentOption) {
            parentOption.click();
            return;
        }
    } catch (error) {
        console.warn("No se pudo navegar desde el contenedor principal:", error);
    }

    window.location.href = "./venta.html";
}

let searchTimeout = null;

function bindEvents() {
    $("searchInput").addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            currentPage = 1;
            await loadBatch(0);
            renderPage(1);
        }, 250);
    });

    $("btnNuevaFactura").addEventListener("click", navegarNuevaFactura);
    $("btnpagPrimero").addEventListener("click", firstPage);
    $("btnpagAnterior").addEventListener("click", previousPage);
    $("btnpagSiguiente").addEventListener("click", nextPage);
    $("btnpagUltimo").addEventListener("click", lastPage);
}

async function init() {
    bindEvents();
    await loadBatch(0);
    renderPage(1);
}

void init();
