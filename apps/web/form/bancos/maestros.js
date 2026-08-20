import {
    listBanco, getByIdBanco, InsertBanco, UpdateBanco, DeleteBanco,
    listTipoMovimiento, getByCodigoTipoMovimiento, InsertTipoMovimiento, UpdateTipoMovimiento, DeleteTipoMovimiento
} from "../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { showSuccessToast } from "../../js/toast.js";
import { calcularFilasVisibles, dataRequiredClear, Enter, ICON_EDITAR, ICON_ELIMINAR, ICON_VER, Tab, validarCampos } from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);

Enter();
cleanupLoader();

const ROWS_PER_PAGE = calcularFilasVisibles() || 8;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH;

/**
 * Fábrica de grilla con paginación por lotes. cfg:
 *  listEndpoint, entidad, tbodyId, pageinfoId, pagesId, btnFirstId/PrevId/NextId/LastId,
 *  filaHtml(item) -> celdas HTML (sin la columna Acciones),
 *  idOf(item), colspan, onVer/onEditar/onEliminar(id), textoEliminar
 */
function crearGrid(cfg) {
    const s = { page: 1, batch: 0, cache: [], total: 0 };
    const filtro = { texto: "", limit: 0, offset: 0 };
    let searchEl = null;

    async function loadBatch(batchNumber) {
        filtro.texto = searchEl ? searchEl.value.trim() : "";
        filtro.limit = RECORDS_PER_BATCH;
        filtro.offset = batchNumber * RECORDS_PER_BATCH;
        const response = await postData(cfg.listEndpoint, filtro, cfg.entidad);
        if (response.success) {
            s.batch = batchNumber;
            s.cache = response.objectsList || [];
            s.total = response.totalRecords || 0;
        }
    }

    function renderPag(totalPages) {
        const cont = $(cfg.pagesId);
        if (!cont) return;
        cont.innerHTML = "";
        const items = [];
        const safe = Math.max(1, totalPages);
        if (safe <= 4) { for (let p = 1; p <= safe; p += 1) items.push(p); }
        else if (s.page <= 2) items.push(1, 2, 3, "ellipsis", safe);
        else if (s.page >= safe - 1) items.push(1, "ellipsis", safe - 2, safe - 1, safe);
        else items.push(s.page - 1, s.page, s.page + 1, "ellipsis", safe);
        items.forEach((item) => {
            const b = document.createElement("button");
            b.type = "button";
            if (item === "ellipsis") { b.className = "pagination-ellipsis no-cursor"; b.disabled = true; b.textContent = "..."; cont.appendChild(b); return; }
            b.textContent = String(item);
            if (Number(item) === s.page) b.classList.add("active", "no-cursor");
            else b.addEventListener("click", async () => {
                const target = Number(item);
                const nb = Math.floor((target - 1) / PAGES_PER_BATCH);
                if (nb !== s.batch) await loadBatch(nb);
                renderPage(target);
            });
            cont.appendChild(b);
        });
        $(cfg.btnFirstId).disabled = s.page <= 1;
        $(cfg.btnPrevId).disabled = s.page <= 1;
        $(cfg.btnNextId).disabled = s.page >= safe;
        $(cfg.btnLastId).disabled = s.page >= safe;
    }

    function renderTable(data) {
        const tbody = $(cfg.tbodyId);
        tbody.innerHTML = "";
        if (data.length === 0) {
            hideLoader();
            tbody.innerHTML = `<tr><td colspan="${cfg.colspan}"><div class="empty-state"><i class="fa-solid fa-inbox"></i><h3>No se encontraron datos</h3><p>Intenta ajustar la búsqueda o registrar uno nuevo.</p></div></td></tr>`;
            return;
        }
        data.forEach((item) => {
            const id = cfg.idOf(item);
            const fila = document.createElement("tr");
            fila.classList.add("sm");
            fila.innerHTML = `${cfg.filaHtml(item)}
                <td data-label="Acciones"><div class="action-buttons">
                    <button class="btn-icon" data-acc="ver" data-id="${id}" title="Ver">${ICON_VER}</button>
                    <button class="btn-icon" data-acc="editar" data-id="${id}" title="Editar">${ICON_EDITAR}</button>
                    <button class="btn-icon" data-acc="eliminar" data-id="${id}" title="Desactivar">${ICON_ELIMINAR}</button>
                </div></td>`;
            tbody.appendChild(fila);
        });
        tbody.querySelectorAll('[data-acc="ver"]').forEach((b) => b.addEventListener("click", () => cfg.onVer(b.dataset.id)));
        tbody.querySelectorAll('[data-acc="editar"]').forEach((b) => b.addEventListener("click", () => cfg.onEditar(b.dataset.id)));
        tbody.querySelectorAll('[data-acc="eliminar"]').forEach((b) => b.addEventListener("click", () => {
            confirmDelete({ texto: cfg.textoEliminar, onEliminar: () => cfg.onEliminar(b.dataset.id) });
        }));
        hideLoader();
    }

    function renderPage(pageNumber) {
        const totalPages = Math.max(1, Math.ceil(s.total / ROWS_PER_PAGE));
        s.page = Math.min(Math.max(pageNumber, 1), totalPages);
        const idx = (s.page - 1) % PAGES_PER_BATCH;
        const start = idx * ROWS_PER_PAGE;
        $(cfg.pageinfoId).textContent = `Total registros ${s.total}`;
        renderPag(totalPages);
        renderTable(s.cache.slice(start, start + ROWS_PER_PAGE));
    }

    async function recargar() { await loadBatch(0); renderPage(1); }

    function bind() {
        searchEl = $(cfg.searchId);
        $(cfg.btnFirstId).addEventListener("click", async () => { if (s.batch !== 0) await loadBatch(0); renderPage(1); });
        $(cfg.btnPrevId).addEventListener("click", async () => {
            if (s.page > 1) { const nb = Math.floor((s.page - 2) / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page - 1); }
        });
        $(cfg.btnNextId).addEventListener("click", async () => {
            const tp = Math.ceil(s.total / ROWS_PER_PAGE);
            if (s.page < tp) { const nb = Math.floor(s.page / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page + 1); }
        });
        $(cfg.btnLastId).addEventListener("click", async () => {
            const tp = Math.ceil(s.total / ROWS_PER_PAGE);
            const lb = Math.floor((tp - 1) / PAGES_PER_BATCH); if (lb !== s.batch) await loadBatch(lb); renderPage(tp);
        });
        if (searchEl) searchEl.addEventListener("input", () => void recargar());
    }

    return { recargar, bind };
}

/* ============================ BANCOS ============================ */
const TIPOS_BANCO = { B: "Banco", F: "Financiera", C: "Cooperativa" };
let banModo = "INS";
let banId = 0;

const bancoGrid = crearGrid({
    listEndpoint: listBanco, entidad: "Banco", colspan: 6,
    searchId: "searchBanco", tbodyId: "tablaBancos", pageinfoId: "pageinfoBanco", pagesId: "banPages",
    btnFirstId: "banPrimero", btnPrevId: "banAnterior", btnNextId: "banSiguiente", btnLastId: "banUltimo",
    idOf: (b) => b.banid,
    filaHtml: (b) => `
        <td data-label="Código">${b.bancodigo || ""}</td>
        <td data-label="Nombre">${b.bannombre || ""}</td>
        <td data-label="Tipo">${TIPOS_BANCO[b.bantipo] || b.bantipo || ""}</td>
        <td class="hide-mobile" data-label="Teléfono">${b.bantelefono || ""}</td>
        <td data-label="Estado">${b.banactivo ? "Activo" : "Inactivo"}</td>`,
    textoEliminar: "¿Desea desactivar este banco?",
    onVer: (id) => { banLimpiar(); banModo = "VER"; void banGetById(id); },
    onEditar: (id) => { banLimpiar(); banModo = "UPD"; void banGetById(id); },
    onEliminar: async (id) => { const r = await deleteData(`${DeleteBanco}?id=${id}`, "Banco"); if (r.success) { await bancoGrid.recargar(); showSuccessToast("Desactivado", "Banco desactivado con éxito", 2000); } }
});

function banOpen() { $("bancoModal").classList.add("active"); setTimeout(() => $("bancodigo").focus(), 200); }
function banClose() { $("bancoModal").classList.remove("active"); }
function banSoloLectura(sl) {
    $("bancoForm").querySelectorAll("input, textarea, select").forEach((f) => {
        if (f.tagName.toLowerCase() === "select" || f.type === "checkbox") f.disabled = sl; else f.readOnly = sl;
    });
}
function banLimpiar() {
    banModo = "INS"; banId = 0; $("bancoForm").reset(); $("bancoModalTitle").textContent = "Nuevo Banco";
    $("banGuardar").style.display = ""; banSoloLectura(false); dataRequiredClear();
    $("bantipo").value = "B"; $("banactivo").checked = true;
}
function banData() {
    const rucRaw = $("banruc").value.trim();
    const dvRaw = $("bandv").value.trim();
    const banruc = rucRaw || null;
    const bandv = rucRaw ? (dvRaw !== "" ? Number(dvRaw) : null) : null;
    return {
        banid: banId, bancodigo: $("bancodigo").value.trim(), bannombre: $("bannombre").value.trim(),
        bantipo: $("bantipo").value, banruc, bandv,
        banswift: $("banswift").value.trim() || null, banbcp: $("banbcp").value.trim() || null,
        bantelefono: $("bantelefono").value.trim() || null, banejecutivo: $("banejecutivo").value.trim() || null,
        banobserva: $("banobserva").value.trim() || null, banactivo: $("banactivo").checked
    };
}
async function banGetById(id) {
    $("banGuardar").style.display = ""; $("bancoModalTitle").textContent = "Modificar Banco";
    if (banModo === "VER") { $("banGuardar").style.display = "none"; $("bancoModalTitle").textContent = "Visualizar Banco"; }
    const r = await getData(`${getByIdBanco}?id=${id}`, "Banco");
    if (!r.success) return;
    const b = r.data || {};
    banId = Number(b.banid || 0);
    $("bancodigo").value = b.bancodigo || ""; $("bannombre").value = b.bannombre || ""; $("bantipo").value = b.bantipo || "B";
    $("banruc").value = b.banruc || ""; $("bandv").value = b.bandv ?? ""; $("banswift").value = b.banswift || "";
    $("banbcp").value = b.banbcp || ""; $("bantelefono").value = b.bantelefono || ""; $("banejecutivo").value = b.banejecutivo || "";
    $("banobserva").value = b.banobserva || ""; $("banactivo").checked = b.banactivo !== false;
    banSoloLectura(banModo === "VER"); banOpen();
}
async function banGuardar() {
    if (!validarCampos($("bancoForm"))) return;
    try {
        const r = banModo === "INS" ? await postData(InsertBanco, banData(), "Banco") : await putData(UpdateBanco, banData(), "Banco");
        if (r.success) { await bancoGrid.recargar(); banClose(); banLimpiar(); showSuccessToast(banModo === "INS" ? "Registrado" : "Modificado", "Banco guardado con éxito", 2000); }
    } catch (e) { console.error(e); }
}

/* ======================= TIPOS DE MOVIMIENTO ======================= */
let tipModo = "INS";

const tipoGrid = crearGrid({
    listEndpoint: listTipoMovimiento, entidad: "Tipo de movimiento", colspan: 6,
    searchId: "searchTipo", tbodyId: "tablaTipos", pageinfoId: "pageinfoTipo", pagesId: "tipPages",
    btnFirstId: "tipPrimero", btnPrevId: "tipAnterior", btnNextId: "tipSiguiente", btnLastId: "tipUltimo",
    idOf: (t) => t.tmocodigo,
    filaHtml: (t) => `
        <td data-label="Código">${t.tmocodigo || ""}</td>
        <td data-label="Descripción">${t.tmodescri || ""}</td>
        <td data-label="Signo">${t.tmosigno === 1 ? "Acredita (+)" : "Debita (-)"}</td>
        <td data-label="Orden">${t.tmoorden ?? ""}</td>
        <td data-label="Estado">${t.tmoactivo ? "Activo" : "Inactivo"}</td>`,
    textoEliminar: "¿Desea desactivar este tipo de movimiento?",
    onVer: (cod) => { tipLimpiar(); tipModo = "VER"; void tipGet(cod); },
    onEditar: (cod) => { tipLimpiar(); tipModo = "UPD"; void tipGet(cod); },
    onEliminar: async (cod) => { const r = await deleteData(`${DeleteTipoMovimiento}?codigo=${encodeURIComponent(cod)}`, "Tipo de movimiento"); if (r.success) { await tipoGrid.recargar(); showSuccessToast("Desactivado", "Tipo desactivado con éxito", 2000); } }
});

function tipOpen() { $("tipoModal").classList.add("active"); setTimeout(() => { if (tipModo === "INS") $("tmocodigo").focus(); else $("tmodescri").focus(); }, 200); }
function tipClose() { $("tipoModal").classList.remove("active"); }
function tipSoloLectura(sl) {
    $("tipoForm").querySelectorAll("input, textarea, select").forEach((f) => {
        if (f.tagName.toLowerCase() === "select" || f.type === "checkbox") f.disabled = sl; else f.readOnly = sl;
    });
    if (tipModo !== "INS") $("tmocodigo").readOnly = true;
}
function tipLimpiar() {
    tipModo = "INS"; $("tipoForm").reset(); $("tipoModalTitle").textContent = "Nuevo Tipo de Movimiento";
    $("tipGuardar").style.display = ""; tipSoloLectura(false); $("tmocodigo").readOnly = false; dataRequiredClear();
    $("tmosigno").value = "1"; $("tmoorden").value = "0"; $("tmomanual").checked = true; $("tmoactivo").checked = true;
}
function tipData() {
    return {
        tmocodigo: ($("tmocodigo").value.trim() || "").toUpperCase(), tmodescri: $("tmodescri").value.trim(),
        tmosigno: Number($("tmosigno").value), tmotransfer: $("tmotransfer").checked, tmorefext: $("tmorefext").checked,
        tmobenefic: $("tmobenefic").checked, tmomanual: $("tmomanual").checked, tmoorden: Number($("tmoorden").value || 0), tmoactivo: $("tmoactivo").checked
    };
}
async function tipGet(cod) {
    $("tipGuardar").style.display = ""; $("tipoModalTitle").textContent = "Modificar Tipo de Movimiento";
    if (tipModo === "VER") { $("tipGuardar").style.display = "none"; $("tipoModalTitle").textContent = "Visualizar Tipo de Movimiento"; }
    const r = await getData(`${getByCodigoTipoMovimiento}?codigo=${encodeURIComponent(cod)}`, "Tipo de movimiento");
    if (!r.success) return;
    const t = r.data || {};
    $("tmocodigo").value = t.tmocodigo || ""; $("tmodescri").value = t.tmodescri || ""; $("tmosigno").value = String(t.tmosigno ?? 1);
    $("tmoorden").value = t.tmoorden ?? 0; $("tmotransfer").checked = !!t.tmotransfer; $("tmorefext").checked = !!t.tmorefext;
    $("tmobenefic").checked = !!t.tmobenefic; $("tmomanual").checked = t.tmomanual !== false; $("tmoactivo").checked = t.tmoactivo !== false;
    tipSoloLectura(tipModo === "VER"); tipOpen();
}
async function tipGuardar() {
    if (!validarCampos($("tipoForm"))) return;
    try {
        const r = tipModo === "INS" ? await postData(InsertTipoMovimiento, tipData(), "Tipo de movimiento") : await putData(UpdateTipoMovimiento, tipData(), "Tipo de movimiento");
        if (r.success) { await tipoGrid.recargar(); tipClose(); tipLimpiar(); showSuccessToast(tipModo === "INS" ? "Registrado" : "Modificado", "Tipo guardado con éxito", 2000); }
    } catch (e) { console.error(e); }
}

/* ============================ INIT ============================ */
async function init() {
    Tab();
    bancoGrid.bind();
    tipoGrid.bind();

    $("btnNuevoBanco").addEventListener("click", () => { banLimpiar(); banOpen(); });
    $("banClose").addEventListener("click", banClose);
    $("banCancel").addEventListener("click", banClose);
    $("banGuardar").addEventListener("click", () => void banGuardar());

    $("btnNuevoTipo").addEventListener("click", () => { tipLimpiar(); tipOpen(); });
    $("tipClose").addEventListener("click", tipClose);
    $("tipCancel").addEventListener("click", tipClose);
    $("tipGuardar").addEventListener("click", () => void tipGuardar());

    window.addEventListener("click", (event) => {
        if (event.target === $("bancoModal")) banClose();
        if (event.target === $("tipoModal")) tipClose();
    });

    showLoader();
    await Promise.all([bancoGrid.recargar(), tipoGrid.recargar()]);
}

void init();
