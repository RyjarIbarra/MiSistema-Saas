import {
    DeleteCuentaBancaria, getByIdCuentaBancaria, InsertCuentaBancaria, listCuentaBancaria, UpdateCuentaBancaria,
    listBanco, listMoneda, listSucursal
} from "../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { showSuccessToast } from "../../js/toast.js";
import { calcularFilasVisibles, dataRequiredClear, Enter, ICON_EDITAR, ICON_ELIMINAR, ICON_VER, validarCampos, formatearImportes, limpiarImportes, quitarFormato, importeFormato } from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);
const TIPOS = { C: "Corriente", A: "Ahorro" };
const monedaCuenta = () => $("cbamoneda").value || "PYG";

let modo = "INS";
let cuentaId = 0;
const DefaultFilter = { texto: "", limit: 0, offset: 0 };
const COMBO_FILTER = { texto: "", limit: 1000, offset: 0 };

let currentPage = 1;
let currentBatch = 0;
let cachedData = [];
let totalRecords = 0;
let combosCargados = false;

Enter();
cleanupLoader();

const ROWS_PER_PAGE = calcularFilasVisibles() || 8;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH;

function opcion(value, text, selected) {
    return `<option value="${value}"${String(value) === String(selected) ? " selected" : ""}>${text}</option>`;
}

async function cargarCombos() {
    if (combosCargados) return;
    try {
        const [bancos, monedas, sucursales] = await Promise.all([
            postData(listBanco, COMBO_FILTER, "Banco"),
            postData(listMoneda, COMBO_FILTER, "Moneda"),
            postData(listSucursal, COMBO_FILTER, "Sucursal")
        ]);
        $("cbabanid").innerHTML = '<option value="">Seleccionar...</option>' +
            (bancos.objectsList || []).filter((b) => b.banactivo !== false)
                .map((b) => opcion(b.banid, b.bancodigo + " - " + b.bannombre)).join("");
        $("cbamoneda").innerHTML = '<option value="">...</option>' +
            (monedas.objectsList || []).map((m) => opcion(m.codigo, m.codigo + " - " + (m.descripcion_es || m.descripcion || ""))).join("");
        $("cbasucursal").innerHTML = '<option value="">(ninguna)</option>' +
            (sucursales.objectsList || []).map((s) => opcion(s.sucest, s.sucest + " - " + s.sucnom)).join("");
        combosCargados = true;
    } catch (error) {
        console.error("Error cargando combos:", error);
    }
}

function openModal() {
    $("cuentaModal").classList.add("active");
    setTimeout(() => $("cbaalias").focus(), 200);
}
function closeModal() { $("cuentaModal").classList.remove("active"); }

function setSoloLectura(soloLectura) {
    $("cuentaForm").querySelectorAll("input, textarea, select").forEach((field) => {
        if (field.tagName.toLowerCase() === "select" || field.type === "checkbox") field.disabled = soloLectura;
        else field.readOnly = soloLectura;
    });
}

function aplicarReglaAhorro() {
    // El esquema no permite sobregiro en cuentas de ahorro.
    const esAhorro = $("cbatipo").value === "A";
    if (esAhorro) {
        $("cbasobregiro").value = "0";
        $("cbasobregiro").disabled = true;
    } else if (modo !== "VER") {
        $("cbasobregiro").disabled = false;
    }
}

function limpiar() {
    modo = "INS";
    cuentaId = 0;
    $("cuentaForm").reset();
    $("modalTitle").textContent = "Nueva Cuenta Bancaria";
    $("btnGuardar").style.display = "";
    setSoloLectura(false);
    dataRequiredClear();
    $("cbatipo").value = "C";
    $("cbasaldoini").value = "0";
    $("cbasobregiro").value = "0";
    $("cbaactivo").checked = true;
    formatearImportes(monedaCuenta());  // Formateo de importes según moneda (igual que Productos → Precios).
    aplicarReglaAhorro();
}

function StringData() {
    return {
        cbaid: cuentaId,
        cbabanid: Number($("cbabanid").value),
        cbanumero: $("cbanumero").value.trim(),
        cbaalias: $("cbaalias").value.trim(),
        cbatipo: $("cbatipo").value,
        cbamoneda: $("cbamoneda").value,
        cbatitular: $("cbatitular").value.trim(),
        cbasucursal: $("cbasucursal").value || null,
        cbasaldoini: quitarFormato($("cbasaldoini").value, monedaCuenta()) || 0,
        cbafecini: $("cbafecini").value || null,
        cbasobregiro: quitarFormato($("cbasobregiro").value, monedaCuenta()) || 0,
        cbaobserva: $("cbaobserva").value.trim() || null,
        cbaactivo: $("cbaactivo").checked
    };
}

function estadoVacio() {
    return `
        <tr>
            <td colspan="7">
                <div class="empty-state">
                    <i class="fa-solid fa-wallet"></i>
                    <h3>No se encontraron cuentas</h3>
                    <p>Intenta ajustar la búsqueda o registrar una nueva cuenta.</p>
                </div>
            </td>
        </tr>`;
}

async function loadBatch(batchNumber) {
    DefaultFilter.texto = $("searchInput").value.trim();
    DefaultFilter.limit = RECORDS_PER_BATCH;
    DefaultFilter.offset = batchNumber * RECORDS_PER_BATCH;
    const response = await postData(listCuentaBancaria, DefaultFilter, "Cuenta bancaria");
    if (response.success) {
        currentBatch = batchNumber;
        cachedData = response.objectsList || [];
        totalRecords = response.totalRecords || 0;
    }
}

function renderPaginationControls(totalPages) {
    const pagesContainer = $("cuentaPaginationPages");
    if (!pagesContainer) return;
    pagesContainer.innerHTML = "";
    const items = [];
    const safeTotal = Math.max(1, totalPages);
    if (safeTotal <= 4) { for (let p = 1; p <= safeTotal; p += 1) items.push(p); }
    else if (currentPage <= 2) items.push(1, 2, 3, "ellipsis", safeTotal);
    else if (currentPage >= safeTotal - 1) items.push(1, "ellipsis", safeTotal - 2, safeTotal - 1, safeTotal);
    else items.push(currentPage - 1, currentPage, currentPage + 1, "ellipsis", safeTotal);
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
        if (Number(item) === currentPage) button.classList.add("active", "no-cursor");
        else button.addEventListener("click", async () => {
            const targetPage = Number(item);
            const newBatch = Math.floor((targetPage - 1) / PAGES_PER_BATCH);
            if (newBatch !== currentBatch) await loadBatch(newBatch);
            renderPage(targetPage);
        });
        pagesContainer.appendChild(button);
    });
    $("btnpagPrimero").disabled = currentPage <= 1;
    $("btnpagAnterior").disabled = currentPage <= 1;
    $("btnpagSiguiente").disabled = currentPage >= safeTotal;
    $("btnpagUltimo").disabled = currentPage >= safeTotal;
}

function renderTable(data) {
    const tbody = $("tablaCuentas");
    tbody.innerHTML = "";
    if (data.length === 0) { hideLoader(); tbody.innerHTML = estadoVacio(); return; }
    data.forEach((c) => {
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="Alias">${c.cbaalias || ""}</td>
            <td data-label="Banco">${c.bannombre || ""}</td>
            <td data-label="Nº Cuenta">${c.cbanumero || ""}</td>
            <td data-label="Moneda">${c.cbamoneda || ""}</td>
            <td data-label="Tipo">${TIPOS[c.cbatipo] || c.cbatipo || ""}</td>
            <td data-label="Estado">${c.cbaactivo ? "Activa" : "Inactiva"}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="ver" data-id="${c.cbaid}" title="Ver">${ICON_VER}</button>
                    <button class="btn-icon" tipo-btn="editar" data-id="${c.cbaid}" title="Editar">${ICON_EDITAR}</button>
                    <button class="btn-icon" tipo-btn="eliminar" data-id="${c.cbaid}" title="Desactivar">${ICON_ELIMINAR}</button>
                </div>
            </td>`;
        tbody.appendChild(fila);
    });
    document.querySelectorAll('[tipo-btn="ver"]').forEach((b) => b.addEventListener("click", () => { limpiar(); modo = "VER"; void getById(b.dataset.id); }));
    document.querySelectorAll('[tipo-btn="editar"]').forEach((b) => b.addEventListener("click", () => { limpiar(); modo = "UPD"; void getById(b.dataset.id); }));
    document.querySelectorAll('[tipo-btn="eliminar"]').forEach((b) => b.addEventListener("click", () => {
        confirmDelete({ texto: "¿Desea desactivar esta cuenta?", onEliminar: () => eliminar(b.dataset.id) });
    }));
    hideLoader();
}

function renderPage(pageNumber) {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    currentPage = Math.min(Math.max(pageNumber, 1), totalPages);
    const indexInBatch = (currentPage - 1) % PAGES_PER_BATCH;
    const startIndex = indexInBatch * ROWS_PER_PAGE;
    $("pageinfo").textContent = `Total registros ${totalRecords}`;
    renderPaginationControls(totalPages);
    renderTable(cachedData.slice(startIndex, startIndex + ROWS_PER_PAGE));
}

async function firstPage() { if (currentBatch !== 0) await loadBatch(0); renderPage(1); }
async function previousPage() {
    if (currentPage > 1) {
        const nb = Math.floor((currentPage - 2) / PAGES_PER_BATCH);
        if (nb !== currentBatch) await loadBatch(nb);
        renderPage(currentPage - 1);
    }
}
async function nextPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    if (currentPage < totalPages) {
        const nb = Math.floor(currentPage / PAGES_PER_BATCH);
        if (nb !== currentBatch) await loadBatch(nb);
        renderPage(currentPage + 1);
    }
}
async function lastPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    const lb = Math.floor((totalPages - 1) / PAGES_PER_BATCH);
    if (lb !== currentBatch) await loadBatch(lb);
    renderPage(totalPages);
}
async function initPagination() { await loadBatch(0); renderPage(1); }

async function insert() {
    const response = await postData(InsertCuentaBancaria, StringData(), "Cuenta bancaria");
    if (response.success) { await initPagination(); closeModal(); limpiar(); showSuccessToast("Registrada", "Cuenta registrada con éxito", 2000); }
}
async function update() {
    const response = await putData(UpdateCuentaBancaria, StringData(), "Cuenta bancaria");
    if (response.success) { await initPagination(); closeModal(); limpiar(); showSuccessToast("Modificada", "Cuenta modificada con éxito", 2000); }
}
async function eliminar(id) {
    const response = await deleteData(`${DeleteCuentaBancaria}?id=${id}`, "Cuenta bancaria");
    if (response.success) { await initPagination(); showSuccessToast("Desactivada", "Cuenta desactivada con éxito", 2000); }
}

async function getById(id) {
    await cargarCombos();
    $("btnGuardar").style.display = "";
    $("modalTitle").textContent = "Modificar Cuenta Bancaria";
    if (modo === "VER") { $("btnGuardar").style.display = "none"; $("modalTitle").textContent = "Visualizar Cuenta Bancaria"; }
    const response = await getData(`${getByIdCuentaBancaria}?id=${id}`, "Cuenta bancaria");
    if (!response.success) return;
    const c = response.data || {};
    cuentaId = Number(c.cbaid || 0);
    $("cbabanid").value = String(c.cbabanid ?? "");
    $("cbaalias").value = c.cbaalias || "";
    $("cbanumero").value = c.cbanumero || "";
    $("cbatipo").value = c.cbatipo || "C";
    $("cbamoneda").value = c.cbamoneda || "";
    $("cbatitular").value = c.cbatitular || "";
    $("cbasucursal").value = c.cbasucursal || "";
    const mon = c.cbamoneda || "PYG";
    $("cbasaldoini").value = importeFormato(c.cbasaldoini ?? 0, mon);
    $("cbasobregiro").value = importeFormato(c.cbasobregiro ?? 0, mon);
    formatearImportes(mon);  // Rebindea el formateo en vivo con la moneda de la cuenta.
    $("cbafecini").value = c.cbafecini || "";
    $("cbaobserva").value = c.cbaobserva || "";
    $("cbaactivo").checked = c.cbaactivo !== false;
    aplicarReglaAhorro();
    setSoloLectura(modo === "VER");
    openModal();
}

async function nuevo() {
    await cargarCombos();
    limpiar();
    openModal();
}

async function init() {
    limpiar();
    showLoader();
    await initPagination();

    $("btnNuevo").addEventListener("click", () => void nuevo());
    $("btnCloseModal").addEventListener("click", closeModal);
    $("btnCancel").addEventListener("click", closeModal);
    $("btnpagPrimero").addEventListener("click", () => void firstPage());
    $("btnpagAnterior").addEventListener("click", () => void previousPage());
    $("btnpagSiguiente").addEventListener("click", () => void nextPage());
    $("btnpagUltimo").addEventListener("click", () => void lastPage());
    $("searchInput").addEventListener("input", () => void initPagination());
    $("cbatipo").addEventListener("change", aplicarReglaAhorro);
    $("cbamoneda").addEventListener("change", () => {
        // Al cambiar la moneda se limpian los importes para evitar formatos mezclados (igual que Productos).
        limpiarImportes();
        formatearImportes(monedaCuenta());
        $("cbasaldoini").value = "0";
        $("cbasobregiro").value = "0";
        aplicarReglaAhorro();
    });

    $("btnGuardar").addEventListener("click", async () => {
        if (!validarCampos($("cuentaForm"))) return;
        try {
            if (modo === "INS") await insert();
            else await update();
        } catch (error) { console.error(error); }
    });

    window.addEventListener("click", (event) => {
        if (event.target === $("cuentaModal")) closeModal();
    });
}

void init();
