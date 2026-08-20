import {
    listChequePropio, emitirChequePropio, entregarChequePropio, cobrarChequePropio, rechazarChequePropio, anularChequePropio,
    listChequeTercero, recibirChequeTercero, depositarChequeTercero, acreditarChequeTercero, endosarChequeTercero, rechazarChequeTercero, devolverChequeTercero,
    listChequera, getByIdChequera, InsertChequera, UpdateChequera, DeleteChequera,
    listCuentaBancaria, listBanco, listMoneda, listClientes
} from "../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { showSuccessToast, showWarningToast } from "../../js/toast.js";
import {
    calcularFilasVisibles, dataRequiredClear, Enter, ICON_EDITAR, ICON_ELIMINAR, ICON_VER, Tab, validarCampos,
    importeFormato, formatearImportes, limpiarImportes, quitarFormato, formatearFecha,
    ICON_ENTREGAR, ICON_COBRAR, ICON_RECHAZAR, ICON_ANULAR, ICON_DEPOSITAR, ICON_ENDOSAR, ICON_DEVOLVER, ICON_ACREDITAR, ICON_DIFERIDO
} from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);
const COMBO = { texto: "", limit: 1000, offset: 0 };

Enter();
cleanupLoader();

const ROWS_PER_PAGE = calcularFilasVisibles() || 8;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH;
const hoy = () => new Date().toISOString().slice(0, 10);

// Catálogos en memoria
let cuentas = [];       // {cbaid, cbamoneda, cbaalias, bannombre}
let chequeras = [];     // activas con disponibles > 0

/* ============================ GRID GENÉRICO ============================
 * cfg: listEndpoint, entidad, buildFiltro(), tbodyId, pageinfoId, pagesId,
 *      btnFirstId/PrevId/NextId/LastId, filaHtml(item), colspan, accionesHtml(item), onAccion(acc,id,item)
 */
function crearGrid(cfg) {
    const s = { page: 1, batch: 0, cache: [], total: 0 };

    async function loadBatch(batchNumber) {
        const filtro = cfg.buildFiltro();
        filtro.limit = RECORDS_PER_BATCH;
        filtro.offset = batchNumber * RECORDS_PER_BATCH;
        const r = await postData(cfg.listEndpoint, filtro, cfg.entidad);
        if (r.success) { s.batch = batchNumber; s.cache = r.objectsList || []; s.total = r.totalRecords || 0; }
    }

    function renderPag(totalPages) {
        const cont = $(cfg.pagesId); cont.innerHTML = "";
        const items = []; const safe = Math.max(1, totalPages);
        if (safe <= 4) { for (let p = 1; p <= safe; p += 1) items.push(p); }
        else if (s.page <= 2) items.push(1, 2, 3, "ellipsis", safe);
        else if (s.page >= safe - 1) items.push(1, "ellipsis", safe - 2, safe - 1, safe);
        else items.push(s.page - 1, s.page, s.page + 1, "ellipsis", safe);
        items.forEach((item) => {
            const b = document.createElement("button"); b.type = "button";
            if (item === "ellipsis") { b.className = "pagination-ellipsis no-cursor"; b.disabled = true; b.textContent = "..."; cont.appendChild(b); return; }
            b.textContent = String(item);
            if (Number(item) === s.page) b.classList.add("active", "no-cursor");
            else b.addEventListener("click", async () => { const t = Number(item); const nb = Math.floor((t - 1) / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(t); });
            cont.appendChild(b);
        });
        $(cfg.btnFirstId).disabled = s.page <= 1;
        $(cfg.btnPrevId).disabled = s.page <= 1;
        $(cfg.btnNextId).disabled = s.page >= safe;
        $(cfg.btnLastId).disabled = s.page >= safe;
    }

    function renderTable(data) {
        const tbody = $(cfg.tbodyId); tbody.innerHTML = "";
        if (data.length === 0) {
            hideLoader();
            tbody.innerHTML = `<tr><td colspan="${cfg.colspan}"><div class="empty-state"><i class="fa-solid fa-money-check-dollar"></i><h3>Sin registros</h3><p>No hay datos para mostrar.</p></div></td></tr>`;
            return;
        }
        data.forEach((item) => {
            const fila = document.createElement("tr"); fila.classList.add("sm");
            fila.innerHTML = `${cfg.filaHtml(item)}<td data-label="Acciones"><div class="action-buttons">${cfg.accionesHtml(item)}</div></td>`;
            tbody.appendChild(fila);
        });
        tbody.querySelectorAll("[data-acc]").forEach((b) => b.addEventListener("click", () => {
            const item = data.find((x) => String(cfg.idOf(x)) === b.dataset.id);
            cfg.onAccion(b.dataset.acc, b.dataset.id, item);
        }));
        hideLoader();
    }

    function renderPage(pageNumber) {
        const totalPages = Math.max(1, Math.ceil(s.total / ROWS_PER_PAGE));
        s.page = Math.min(Math.max(pageNumber, 1), totalPages);
        const idx = (s.page - 1) % PAGES_PER_BATCH; const start = idx * ROWS_PER_PAGE;
        $(cfg.pageinfoId).textContent = `Total registros ${s.total}`;
        renderPag(totalPages);
        renderTable(s.cache.slice(start, start + ROWS_PER_PAGE));
    }

    async function recargar() { await loadBatch(0); renderPage(1); }

    function bind() {
        $(cfg.btnFirstId).addEventListener("click", async () => { if (s.batch !== 0) await loadBatch(0); renderPage(1); });
        $(cfg.btnPrevId).addEventListener("click", async () => { if (s.page > 1) { const nb = Math.floor((s.page - 2) / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page - 1); } });
        $(cfg.btnNextId).addEventListener("click", async () => { const tp = Math.ceil(s.total / ROWS_PER_PAGE); if (s.page < tp) { const nb = Math.floor(s.page / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page + 1); } });
        $(cfg.btnLastId).addEventListener("click", async () => { const tp = Math.ceil(s.total / ROWS_PER_PAGE); const lb = Math.floor((tp - 1) / PAGES_PER_BATCH); if (lb !== s.batch) await loadBatch(lb); renderPage(tp); });
    }

    return { recargar, bind };
}

const BTN = (acc, id, svg, title, color) =>
    `<button class="btn-icon" data-acc="${acc}" data-id="${id}" title="${title}" style="color:${color}">${svg}</button>`;
const estadoBadge = (txt) => `<span style="font-size:12px;font-weight:600;">${txt}</span>`;
const fFecha = (f) => (f ? formatearFecha(f) : "");
const badgeDiferido = `<span title="Diferido" style="color:#b45309;">${ICON_DIFERIDO}</span>`;

/* ============================ CHEQUES PROPIOS ============================ */
const propGrid = crearGrid({
    listEndpoint: listChequePropio, entidad: "Cheque propio", colspan: 7,
    tbodyId: "tablaPro", pageinfoId: "pageinfoPro", pagesId: "proPages",
    btnFirstId: "proPrimero", btnPrevId: "proAnterior", btnNextId: "proSiguiente", btnLastId: "proUltimo",
    idOf: (c) => c.chpid,
    buildFiltro: () => ({ cbaid: 0, estado: $("filtroEstadoPro").value, texto: $("searchPro").value.trim() }),
    filaHtml: (c) => `
        <td data-label="Nº">${c.chpnumero}${c.chpdiferido ? ' ' + badgeDiferido : ''}</td>
        <td data-label="Emisión">${fFecha(c.chpfecemi)}</td>
        <td data-label="Pago">${fFecha(c.chpfecpago)}</td>
        <td data-label="Beneficiario">${c.chpbenefic || ""}</td>
        <td data-label="Importe" class="text-end" style="font-weight:600;">${importeFormato(c.chpimporte, c.cbamoneda || "PYG")}</td>
        <td data-label="Estado">${estadoBadge(c.chpestado)}</td>`,
    accionesHtml: (c) => {
        let h = "";
        if (c.chpestado === "EMITIDO") {
            h += BTN("entregar", c.chpid, ICON_ENTREGAR, "Entregar", "#2563eb");
            h += BTN("cobrar", c.chpid, ICON_COBRAR, "Marcar cobrado", "#16a34a");
            h += BTN("rechazar", c.chpid, ICON_ANULAR, "Rechazar", "#6b7280");
            h += BTN("anular", c.chpid, ICON_RECHAZAR, "Anular", "#dc2626");
        } else if (c.chpestado === "ENTREGADO") {
            h += BTN("cobrar", c.chpid, ICON_COBRAR, "Marcar cobrado", "#16a34a");
            h += BTN("rechazar", c.chpid, ICON_ANULAR, "Rechazar", "#6b7280");
        } else {
            h += `<span style="color:#9ca3af;font-size:12px;">—</span>`;
        }
        return h;
    },
    onAccion: (acc, id) => accionesPropio(acc, Number(id))
});

function accionesPropio(acc, id) {
    if (acc === "entregar") {
        abrirAccion({ titulo: "Entregar cheque", desc: "Registra la entrega del cheque al beneficiario.", campos: { fecha: true },
            onConfirm: (v) => opPut(entregarChequePropio, { id, fecha: v.fecha }, "Cheque entregado") });
    } else if (acc === "cobrar") {
        abrirAccion({ titulo: "Marcar como cobrado", desc: "El banco debitó el cheque. El saldo ya reflejaba la emisión.", campos: { fecha: true },
            onConfirm: (v) => opPut(cobrarChequePropio, { id, fecha: v.fecha }, "Cheque cobrado") });
    } else if (acc === "rechazar") {
        abrirAccion({ titulo: "Rechazar cheque", desc: "Genera una reversión en el libro que devuelve el importe.", campos: { fecha: true, motivo: true },
            onConfirm: (v) => opPut(rechazarChequePropio, { id, fecha: v.fecha, motivo: v.motivo }, "Cheque rechazado") });
    } else if (acc === "anular") {
        abrirAccion({ titulo: "Anular cheque", desc: "Anula el cheque (aún no entregado) y revierte el movimiento de la emisión.", campos: { motivo: true },
            onConfirm: (v) => opPut(anularChequePropio, { id, motivo: v.motivo }, "Cheque anulado") });
    }
}

/* -------- modal emitir -------- */
function proOpen() { $("proModal").classList.add("active"); setTimeout(() => $("chpchqid").focus(), 200); }
function proClose() { $("proModal").classList.remove("active"); }
function monedaChequera() {
    const opt = $("chpchqid").selectedOptions[0];
    return opt ? (opt.dataset.moneda || "PYG") : "PYG";
}
function proLimpiar() {
    $("proForm").reset(); dataRequiredClear();
    $("chpfecemi").value = hoy();
    $("chpfecpago").value = ""; $("chpfecpago").disabled = true;
    $("chpalaorden").checked = true;
    // cargar talonarios disponibles
    $("chpchqid").innerHTML = '<option value="">Seleccionar...</option>' +
        chequeras.map((q) => `<option value="${q.chqid}" data-cbaid="${q.chqcbaid}" data-moneda="${q.cbamoneda}">${q.cbaalias} · Serie ${q.chqserie || "—"} (próx. ${q.chqactual}, ${q.disponibles} disp.)</option>`).join("");
    limpiarImportes();
    formatearImportes(monedaChequera());
}
function proData() {
    const opt = $("chpchqid").selectedOptions[0];
    const dif = $("chpdiferido").checked;
    const moneda = monedaChequera();
    return {
        chpchqid: Number($("chpchqid").value || 0),
        chpcbaid: opt ? Number(opt.dataset.cbaid || 0) : 0,
        chpdiferido: dif,
        chpfecemi: $("chpfecemi").value || null,
        chpfecpago: dif ? ($("chpfecpago").value || null) : null,
        chpimporte: quitarFormato($("chpimporte").value, moneda) || 0,
        chpbenefic: $("chpbenefic").value.trim(),
        chpbeneruc: $("chpbeneruc").value.trim() || null,
        chpalaorden: $("chpalaorden").checked,
        chpcruzado: $("chpcruzado").checked,
        chpconcepto: $("chpconcepto").value.trim(),
        chpobserva: $("chpobserva").value.trim() || null
    };
}
async function emitir() {
    if (!validarCampos($("proForm"))) return;
    if ($("chpdiferido").checked && !$("chpfecpago").value) { showWarningToast("Falta fecha de pago", "Un cheque diferido requiere la fecha de pago.", 3000); return; }
    try {
        const r = await postData(emitirChequePropio, proData(), "Cheque propio");
        if (r.success) { proClose(); await refrescarTrasCambio(); showSuccessToast("Emitido", "Cheque emitido con éxito", 2000); }
    } catch (e) { console.error(e); }
}

/* ============================ CHEQUES DE TERCEROS ============================ */
const terGrid = crearGrid({
    listEndpoint: listChequeTercero, entidad: "Cheque de tercero", colspan: 7,
    tbodyId: "tablaTer", pageinfoId: "pageinfoTer", pagesId: "terPages",
    btnFirstId: "terPrimero", btnPrevId: "terAnterior", btnNextId: "terSiguiente", btnLastId: "terUltimo",
    idOf: (c) => c.chtid,
    buildFiltro: () => ({ cbaid: 0, estado: $("filtroEstadoTer").value, texto: $("searchTer").value.trim() }),
    filaHtml: (c) => `
        <td data-label="Nº">${c.chtnumero || ""}${c.chtdiferido ? ' ' + badgeDiferido : ''}</td>
        <td data-label="Banco">${c.bannombre || ""}</td>
        <td data-label="Librador">${c.chtlibrador || ""}</td>
        <td data-label="Pago">${fFecha(c.chtfecpago)}</td>
        <td data-label="Importe" class="text-end" style="font-weight:600;">${importeFormato(c.chtimporte, c.chtmoneda || "PYG")} ${c.chtmoneda || ""}</td>
        <td data-label="Estado">${estadoBadge(c.chtestado)}</td>`,
    accionesHtml: (c) => {
        let h = "";
        if (c.chtestado === "CARTERA") {
            h += BTN("depositar", c.chtid, ICON_DEPOSITAR, "Depositar", "#16a34a");
            h += BTN("endosar", c.chtid, ICON_ENDOSAR, "Endosar", "#7c3aed");
            h += BTN("devolver", c.chtid, ICON_DEVOLVER, "Devolver", "#6b7280");
        } else if (c.chtestado === "DEPOSITADO") {
            h += BTN("acreditar", c.chtid, ICON_ACREDITAR, "Acreditar", "#16a34a");
            h += BTN("rechazar", c.chtid, ICON_RECHAZAR, "Rechazar", "#dc2626");
        } else if (c.chtestado === "ACREDITADO") {
            h += BTN("rechazar", c.chtid, ICON_RECHAZAR, "Rechazar", "#dc2626");
        } else {
            h += `<span style="color:#9ca3af;font-size:12px;">—</span>`;
        }
        return h;
    },
    onAccion: (acc, id, item) => accionesTercero(acc, Number(id), item)
});

function accionesTercero(acc, id, item) {
    if (acc === "depositar") {
        // cuentas de la misma moneda del cheque (el trigger exige coincidencia)
        const compat = cuentas.filter((c) => c.cbamoneda === item.chtmoneda);
        abrirAccion({ titulo: "Depositar cheque", desc: `Genera el ingreso en el libro. Solo cuentas en ${item.chtmoneda}.`,
            campos: { fecha: true, cuenta: true, referencia: true }, cuentasFiltradas: compat,
            onConfirm: (v) => opPut(depositarChequeTercero, { id, fecha: v.fecha, cbaid: Number(v.cuenta), referencia: v.referencia }, "Cheque depositado") });
    } else if (acc === "endosar") {
        abrirAccion({ titulo: "Endosar cheque", desc: "Transfiere el cheque a un tercero. No genera movimiento bancario.", campos: { fecha: true, endosado: true },
            onConfirm: (v) => opPut(endosarChequeTercero, { id, fecha: v.fecha, endosado: v.endosado }, "Cheque endosado") });
    } else if (acc === "devolver") {
        abrirAccion({ titulo: "Devolver cheque", desc: "Reintegra el cheque al cliente sin cobrarlo.", campos: { motivo: true },
            onConfirm: (v) => opPut(devolverChequeTercero, { id, motivo: v.motivo }, "Cheque devuelto") });
    } else if (acc === "acreditar") {
        abrirAccion({ titulo: "Acreditar cheque", desc: "El banco confirmó la acreditación de los fondos.", campos: {},
            onConfirm: () => opPut(acreditarChequeTercero, { id }, "Cheque acreditado") });
    } else if (acc === "rechazar") {
        abrirAccion({ titulo: "Rechazar cheque", desc: "Genera la reversión que descuenta el importe previamente depositado.", campos: { fecha: true, motivo: true },
            onConfirm: (v) => opPut(rechazarChequeTercero, { id, fecha: v.fecha, motivo: v.motivo }, "Cheque rechazado") });
    }
}

/* -------- modal recibir -------- */
function terOpen() { $("terModal").classList.add("active"); setTimeout(() => $("chtbanid").focus(), 200); }
function terClose() { $("terModal").classList.remove("active"); }
function monedaTercero() { return $("chtmoneda").value || "PYG"; }
function terLimpiar() {
    $("terForm").reset(); dataRequiredClear();
    $("chtfecemi").value = hoy(); $("chtfecrec").value = hoy();
    $("chtfecpago").value = ""; $("chtfecpago").disabled = true;
    limpiarImportes(); formatearImportes(monedaTercero());
}
function terData() {
    const dif = $("chtdiferido").checked;
    const moneda = monedaTercero();
    const cli = $("chtcliid").value;
    return {
        chtbanid: Number($("chtbanid").value || 0),
        chtnumero: $("chtnumero").value.trim(),
        chtcuenta: $("chtcuenta").value.trim() || null,
        chtlibrador: $("chtlibrador").value.trim(),
        chtlibruc: $("chtlibruc").value.trim() || null,
        chtdiferido: dif,
        chtfecemi: $("chtfecemi").value || null,
        chtfecpago: dif ? ($("chtfecpago").value || null) : null,
        chtfecrec: $("chtfecrec").value || null,
        chtimporte: quitarFormato($("chtimporte").value, moneda) || 0,
        chtmoneda: moneda,
        chtcliid: cli ? Number(cli) : null,
        chtrefint: $("chtrefint").value.trim() || null,
        chtobserva: $("chtobserva").value.trim() || null
    };
}
async function recibir() {
    if (!validarCampos($("terForm"))) return;
    if ($("chtdiferido").checked && !$("chtfecpago").value) { showWarningToast("Falta fecha de pago", "Un cheque diferido requiere la fecha de pago.", 3000); return; }
    try {
        const r = await postData(recibirChequeTercero, terData(), "Cheque de tercero");
        if (r.success) { terClose(); await refrescarTrasCambio(); showSuccessToast("Registrado", "Cheque registrado en cartera", 2000); }
    } catch (e) { console.error(e); }
}

/* ============================ TALONARIOS (CHEQUERAS) ============================ */
let chqModo = "INS"; let chqId = 0;
const chqGrid = crearGrid({
    listEndpoint: listChequera, entidad: "Chequera", colspan: 7,
    tbodyId: "tablaChq", pageinfoId: "pageinfoChq", pagesId: "chqPages",
    btnFirstId: "chqPrimero", btnPrevId: "chqAnterior", btnNextId: "chqSiguiente", btnLastId: "chqUltimo",
    idOf: (q) => q.chqid,
    buildFiltro: () => ({ cbaid: 0, estado: "", texto: $("searchChq").value.trim() }),
    filaHtml: (q) => `
        <td data-label="Cuenta">${q.cbaalias || ""} <small class="text-muted">${q.cbamoneda || ""}</small></td>
        <td data-label="Serie">${q.chqserie || "—"}</td>
        <td data-label="Rango">${q.chqdesde} – ${q.chqhasta}</td>
        <td data-label="Próximo">${q.chqactual}</td>
        <td data-label="Disponibles">${q.disponibles ?? ""}</td>
        <td data-label="Estado">${q.chqactivo ? "Activo" : "Inactivo"}</td>`,
    accionesHtml: (q) => `
        <button class="btn-icon" data-acc="ver" data-id="${q.chqid}" title="Ver">${ICON_VER}</button>
        <button class="btn-icon" data-acc="editar" data-id="${q.chqid}" title="Editar">${ICON_EDITAR}</button>
        <button class="btn-icon" data-acc="eliminar" data-id="${q.chqid}" title="Desactivar">${ICON_ELIMINAR}</button>`,
    onAccion: (acc, id) => {
        if (acc === "ver") { chqLimpiar(); chqModo = "VER"; void chqGet(id); }
        else if (acc === "editar") { chqLimpiar(); chqModo = "UPD"; void chqGet(id); }
        else if (acc === "eliminar") confirmDelete({ texto: "¿Desea desactivar este talonario?", onEliminar: async () => { const r = await deleteData(`${DeleteChequera}?id=${id}`, "Chequera"); if (r.success) { await chqGrid.recargar(); showSuccessToast("Desactivado", "Talonario desactivado", 2000); } } });
    }
});

function chqOpen() { $("chqModal").classList.add("active"); setTimeout(() => $("chqcbaid").focus(), 200); }
function chqClose() { $("chqModal").classList.remove("active"); }
function chqSoloLectura(sl) {
    $("chqForm").querySelectorAll("input, textarea, select").forEach((f) => { if (f.tagName.toLowerCase() === "select" || f.type === "checkbox") f.disabled = sl; else f.readOnly = sl; });
}
function chqLimpiar() {
    chqModo = "INS"; chqId = 0; $("chqForm").reset(); $("chqModalTitle").textContent = "Nuevo Talonario";
    $("chqGuardar").style.display = ""; chqSoloLectura(false); dataRequiredClear();
    $("chqfecrec").value = hoy();
    $("chqActualRow").style.display = "none"; $("chqActivoRow").style.display = "none"; $("chqactivo").checked = true;
    $("chqcbaid").innerHTML = '<option value="">Seleccionar...</option>' +
        cuentas.map((c) => `<option value="${c.cbaid}">${c.cbaalias} (${c.bannombre || ""} · ${c.cbamoneda})</option>`).join("");
    $("chqcbaid").disabled = false; $("chqdesde").readOnly = false;
}
function chqData() {
    return {
        chqid: chqId, chqcbaid: Number($("chqcbaid").value || 0),
        chqserie: $("chqserie").value.trim() || null,
        chqdesde: Number($("chqdesde").value || 0), chqhasta: Number($("chqhasta").value || 0),
        chqfecrec: $("chqfecrec").value || null, chqobserva: $("chqobserva").value.trim() || null,
        chqactivo: $("chqactivo").checked
    };
}
async function chqGet(id) {
    $("chqGuardar").style.display = ""; $("chqModalTitle").textContent = "Modificar Talonario";
    if (chqModo === "VER") { $("chqGuardar").style.display = "none"; $("chqModalTitle").textContent = "Visualizar Talonario"; }
    const r = await getData(`${getByIdChequera}?id=${id}`, "Chequera");
    if (!r.success) return;
    const q = r.data || {}; chqId = Number(q.chqid || 0);
    $("chqcbaid").innerHTML = `<option value="${q.chqcbaid}">${q.cbaalias || ""} (${q.bannombre || ""} · ${q.cbamoneda || ""})</option>`;
    $("chqcbaid").value = String(q.chqcbaid); $("chqcbaid").disabled = true;   // la cuenta no se cambia
    $("chqserie").value = q.chqserie || ""; $("chqdesde").value = q.chqdesde; $("chqdesde").readOnly = true;
    $("chqhasta").value = q.chqhasta; $("chqfecrec").value = q.chqfecrec || "";
    $("chqobserva").value = q.chqobserva || ""; $("chqactivo").checked = q.chqactivo !== false;
    $("chqActualRow").style.display = ""; $("chqActualTxt").textContent = q.chqactual;
    $("chqActivoRow").style.display = "";
    chqSoloLectura(chqModo === "VER");
    chqOpen();
}
async function chqGuardar() {
    if (!validarCampos($("chqForm"))) return;
    const d = chqData();
    if (d.chqhasta < d.chqdesde) { showWarningToast("Rango inválido", "El número final debe ser mayor o igual al inicial.", 3000); return; }
    try {
        const r = chqModo === "INS" ? await postData(InsertChequera, d, "Chequera") : await putData(UpdateChequera, d, "Chequera");
        if (r.success) { chqClose(); await chqGrid.recargar(); await cargarChequeras(); showSuccessToast(chqModo === "INS" ? "Registrado" : "Modificado", "Talonario guardado", 2000); }
    } catch (e) { console.error(e); }
}

/* ============================ MODAL ACCIÓN GENÉRICO ============================ */
let accOnConfirm = null; let accCampos = {};
function abrirAccion({ titulo, desc, campos, cuentasFiltradas, onConfirm }) {
    accOnConfirm = onConfirm; accCampos = campos || {};
    $("accTitle").textContent = titulo; $("accDesc").textContent = desc || "";
    $("accForm").reset();
    $("accFechaRow").style.display = campos.fecha ? "" : "none";
    $("accCuentaRow").style.display = campos.cuenta ? "" : "none";
    $("accRefRow").style.display = campos.referencia ? "" : "none";
    $("accEndosadoRow").style.display = campos.endosado ? "" : "none";
    $("accMotivoRow").style.display = campos.motivo ? "" : "none";
    if (campos.fecha) $("accFecha").value = hoy();
    if (campos.cuenta) {
        const lista = cuentasFiltradas || cuentas;
        $("accCuenta").innerHTML = '<option value="">Seleccionar...</option>' +
            lista.map((c) => `<option value="${c.cbaid}">${c.cbaalias} (${c.bannombre || ""} · ${c.cbamoneda})</option>`).join("");
        if (lista.length === 0) $("accDesc").textContent = "No hay cuentas activas en esa moneda para depositar.";
    }
    $("accModal").classList.add("active");
    setTimeout(() => { if (campos.motivo) $("accMotivo").focus(); else if (campos.cuenta) $("accCuenta").focus(); else if (campos.fecha) $("accFecha").focus(); }, 200);
}
function accClose() { $("accModal").classList.remove("active"); accOnConfirm = null; }
async function accConfirmar() {
    if (accCampos.cuenta && !$("accCuenta").value) { showWarningToast("Falta cuenta", "Seleccioná la cuenta de depósito.", 3000); return; }
    if (accCampos.referencia && !$("accRef").value.trim()) { showWarningToast("Falta referencia", "Indicá la referencia del depósito (boleta).", 3000); return; }
    if (accCampos.endosado && !$("accEndosado").value.trim()) { showWarningToast("Falta endosatario", "Indicá a quién se endosa.", 3000); return; }
    if (accCampos.motivo && !$("accMotivo").value.trim()) { showWarningToast("Falta motivo", "El motivo es obligatorio.", 3000); return; }
    const vals = {
        fecha: $("accFecha").value || hoy(),
        cuenta: $("accCuenta").value, referencia: $("accRef").value.trim(),
        endosado: $("accEndosado").value.trim(), motivo: $("accMotivo").value.trim()
    };
    const fn = accOnConfirm; accClose();
    if (fn) await fn(vals);
}
async function opPut(endpoint, body, okMsg) {
    try {
        const r = await putData(endpoint, body, "Cheque");
        if (r.success) { await refrescarTrasCambio(); showSuccessToast("Listo", okMsg, 2000); }
    } catch (e) { console.error(e); }
}

/* ============================ COMBOS / REFRESH ============================ */
async function cargarChequeras() {
    const r = await postData(listChequera, COMBO, "Chequera");
    chequeras = (r.objectsList || []).filter((q) => q.chqactivo && (q.disponibles ?? 0) > 0);
}
async function cargarCombos() {
    const [rc, rb, rm, rcli] = await Promise.all([
        postData(listCuentaBancaria, COMBO, "Cuenta bancaria"),
        postData(listBanco, COMBO, "Banco"),
        postData(listMoneda, COMBO, "Moneda"),
        postData(listClientes, COMBO, "Cliente")
    ]);
    cuentas = (rc.objectsList || []).filter((c) => c.cbaactivo !== false);
    $("chtbanid").innerHTML = '<option value="">Seleccionar...</option>' +
        (rb.objectsList || []).filter((b) => b.banactivo !== false).map((b) => `<option value="${b.banid}">${b.bancodigo} - ${b.bannombre}</option>`).join("");
    $("chtmoneda").innerHTML = '<option value="">...</option>' +
        (rm.objectsList || []).map((m) => `<option value="${m.codigo}">${m.codigo} - ${m.descripcion_es || m.descripcion || ""}</option>`).join("");
    $("chtcliid").innerHTML = '<option value="">(ninguno)</option>' +
        (rcli.objectsList || []).map((c) => `<option value="${c.cliid}">${c.clinom}</option>`).join("");
    await cargarChequeras();
}
async function refrescarTrasCambio() {
    await Promise.all([propGrid.recargar(), terGrid.recargar(), chqGrid.recargar(), cargarChequeras()]);
}

/* ============================ INIT ============================ */
async function init() {
    Tab();
    propGrid.bind(); terGrid.bind(); chqGrid.bind();

    // filtros/búsquedas
    $("filtroEstadoPro").addEventListener("change", () => void propGrid.recargar());
    $("searchPro").addEventListener("input", () => void propGrid.recargar());
    $("filtroEstadoTer").addEventListener("change", () => void terGrid.recargar());
    $("searchTer").addEventListener("input", () => void terGrid.recargar());
    $("searchChq").addEventListener("input", () => void chqGrid.recargar());

    // emitir
    $("btnEmitir").addEventListener("click", () => {
        if (chequeras.length === 0) { showWarningToast("Sin talonarios", "Registrá primero un talonario con números disponibles.", 3500); return; }
        proLimpiar(); proOpen();
    });
    $("chpchqid").addEventListener("change", () => { limpiarImportes(); formatearImportes(monedaChequera()); });
    $("chpdiferido").addEventListener("change", () => {
        const dif = $("chpdiferido").checked;
        $("chpfecpago").disabled = !dif;
        if (!dif) $("chpfecpago").value = "";
    });
    $("proClose").addEventListener("click", proClose);
    $("proCancel").addEventListener("click", proClose);
    $("proGuardar").addEventListener("click", () => void emitir());

    // recibir
    $("btnRecibir").addEventListener("click", () => { terLimpiar(); terOpen(); });
    $("chtmoneda").addEventListener("change", () => { limpiarImportes(); formatearImportes(monedaTercero()); });
    $("chtdiferido").addEventListener("change", () => {
        const dif = $("chtdiferido").checked;
        $("chtfecpago").disabled = !dif;
        if (!dif) $("chtfecpago").value = "";
    });
    $("terClose").addEventListener("click", terClose);
    $("terCancel").addEventListener("click", terClose);
    $("terGuardar").addEventListener("click", () => void recibir());

    // talonarios
    $("btnNuevaChq").addEventListener("click", () => { chqLimpiar(); chqOpen(); });
    $("chqClose").addEventListener("click", chqClose);
    $("chqCancel").addEventListener("click", chqClose);
    $("chqGuardar").addEventListener("click", () => void chqGuardar());

    // acción
    $("accClose").addEventListener("click", accClose);
    $("accCancel").addEventListener("click", accClose);
    $("accConfirmar").addEventListener("click", () => void accConfirmar());

    window.addEventListener("click", (e) => {
        if (e.target === $("proModal")) proClose();
        if (e.target === $("terModal")) terClose();
        if (e.target === $("chqModal")) chqClose();
        if (e.target === $("accModal")) accClose();
    });

    showLoader();
    try {
        await cargarCombos();
        await Promise.all([propGrid.recargar(), terGrid.recargar(), chqGrid.recargar()]);
    } catch (e) {
        console.error("Error inicializando cheques:", e);
        hideLoader();
    }
}

void init();
