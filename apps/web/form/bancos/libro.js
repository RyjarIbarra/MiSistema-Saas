import {
    listMovimiento, registrarMovimiento, anularMovimiento, saldoCuenta,
    listCuentaBancaria, listTipoMovimiento
} from "../../js/apiEndpoints.js";
import { getData, postData, putData } from "../../js/apiService.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { showSuccessToast, showWarningToast } from "../../js/toast.js";
import { calcularFilasVisibles, dataRequiredClear, Enter, importeFormato, formatearImportes, limpiarImportes, quitarFormato, formatearFecha, validarCampos } from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);
const COMBO_FILTER = { texto: "", limit: 1000, offset: 0 };

let cuentaId = 0;
let monedaActual = "PYG";
let anularId = 0;
const tiposMap = {};

const s = { page: 1, batch: 0, cache: [], total: 0 };
const filtro = { cbaid: 0, texto: "", limit: 0, offset: 0, fechaDesde: null, fechaHasta: null };

Enter();
cleanupLoader();

const ROWS_PER_PAGE = calcularFilasVisibles() || 8;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH;

function fmt(n) { return importeFormato(n || 0, monedaActual); }

async function cargarCuentas() {
    const r = await postData(listCuentaBancaria, COMBO_FILTER, "Cuenta bancaria");
    const cuentas = (r.objectsList || []).filter((c) => c.cbaactivo !== false);
    $("cuentaSel").innerHTML = '<option value="">Seleccionar cuenta...</option>' +
        cuentas.map((c) => `<option value="${c.cbaid}" data-moneda="${c.cbamoneda}">${c.cbaalias} (${c.bannombre || ""} · ${c.cbamoneda})</option>`).join("");
}

async function cargarTipos() {
    const r = await postData(listTipoMovimiento, COMBO_FILTER, "Tipo de movimiento");
    const tipos = (r.objectsList || []).filter((t) => t.tmoactivo && t.tmomanual && !t.tmotransfer);
    tipos.forEach((t) => { tiposMap[t.tmocodigo] = t; });
    $("mbatipo").innerHTML = '<option value="">Seleccionar...</option>' +
        tipos.sort((a, b) => a.tmoorden - b.tmoorden).map((t) => `<option value="${t.tmocodigo}">${t.tmodescri} (${t.tmosigno === 1 ? "+" : "-"})</option>`).join("");
}

async function cargarSaldo() {
    if (!cuentaId) { $("saldoCard").style.display = "none"; return; }
    const r = await getData(`${saldoCuenta}?cbaid=${cuentaId}`, "Saldo");
    if (!r.success || !r.data) { $("saldoCard").style.display = "none"; return; }
    const d = r.data;
    $("saldoIni").textContent = fmt(d.cbasaldoini);
    $("saldoMov").textContent = fmt(d.movimientos);
    $("saldoAct").textContent = fmt(d.saldo);
    $("saldoAct").style.color = Number(d.saldo) < 0 ? "#dc2626" : "#16a34a";
    $("saldoUlt").textContent = d.ultimoMovimiento ? formatearFecha(d.ultimoMovimiento) : "—";
    $("saldoCard").style.display = "flex";
}

async function loadBatch(batchNumber) {
    filtro.cbaid = cuentaId;
    filtro.texto = $("searchInput").value.trim();
    filtro.limit = RECORDS_PER_BATCH;
    filtro.offset = batchNumber * RECORDS_PER_BATCH;
    const r = await postData(listMovimiento, filtro, "Movimiento");
    if (r.success) { s.batch = batchNumber; s.cache = r.objectsList || []; s.total = r.totalRecords || 0; }
}

function renderPag(totalPages) {
    const cont = $("movPages");
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
        else b.addEventListener("click", async () => { const t = Number(item); const nb = Math.floor((t - 1) / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(t); });
        cont.appendChild(b);
    });
    $("movPrimero").disabled = s.page <= 1;
    $("movAnterior").disabled = s.page <= 1;
    $("movSiguiente").disabled = s.page >= safe;
    $("movUltimo").disabled = s.page >= safe;
}

const ORIGEN_LABEL = {
    CHEQUE_PROPIO: "un cheque propio", CHEQUE_TERCERO: "un cheque de tercero",
    ORDEN_PAGO: "una orden de pago", COBRANZA: "una cobranza", PAGO: "un pago",
    IMPORTADO: "una importación de extracto"
};

// Solo se puede anular desde el libro un movimiento MANUAL o TRASPASO. Los generados por un
// instrumento (cheques, órdenes de pago) se gestionan desde su módulo, que mantiene la coherencia.
function accionesMov(m, anulado) {
    if (anulado) return "";
    const origen = m.mbaorigen || "MANUAL";
    if (origen === "MANUAL" || origen === "TRASPASO") {
        return `<button class="btn-icon" data-anular="${m.mbaid}" title="Anular"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg></button>`;
    }
    const label = ORIGEN_LABEL[origen] || "otro módulo";
    return `<span class="btn-icon" title="Generado por ${label}; se gestiona desde su módulo" style="cursor:default;color:#9ca3af;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>`;
}

function renderTable(data) {
    const tbody = $("tablaMov");
    tbody.innerHTML = "";
    if (data.length === 0) {
        hideLoader();
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-book"></i><h3>Sin movimientos</h3><p>${cuentaId ? "Registrá el primer movimiento de esta cuenta." : "Seleccioná una cuenta para ver su libro."}</p></div></td></tr>`;
        return;
    }
    data.forEach((m) => {
        const anulado = m.mbaestado === "ANULADO";
        const color = m.tmosigno === 1 ? "#16a34a" : "#dc2626";
        const signo = m.tmosigno === 1 ? "+" : "−";
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        if (anulado) fila.style.opacity = "0.55";
        fila.innerHTML = `
            <td data-label="Fecha">${m.mbafecha ? formatearFecha(m.mbafecha) : ""}</td>
            <td data-label="Nº">${m.mbanumero}</td>
            <td data-label="Tipo">${m.tmodescri || m.mbatipo}</td>
            <td data-label="Concepto">${m.mbaconcepto || ""}</td>
            <td data-label="Importe" class="text-end" style="color:${anulado ? "#888" : color};font-weight:600;">${signo} ${fmt(m.mbaimporte)}</td>
            <td data-label="Estado">${anulado ? "ANULADO" : "Vigente"}</td>
            <td data-label="Acciones"><div class="action-buttons">${accionesMov(m, anulado)}</div></td>`;
        tbody.appendChild(fila);
    });
    tbody.querySelectorAll("[data-anular]").forEach((b) => b.addEventListener("click", () => abrirAnular(b.dataset.anular)));
    hideLoader();
}

function renderPage(pageNumber) {
    const totalPages = Math.max(1, Math.ceil(s.total / ROWS_PER_PAGE));
    s.page = Math.min(Math.max(pageNumber, 1), totalPages);
    const idx = (s.page - 1) % PAGES_PER_BATCH;
    const start = idx * ROWS_PER_PAGE;
    $("pageinfo").textContent = `Total registros ${s.total}`;
    renderPag(totalPages);
    renderTable(s.cache.slice(start, start + ROWS_PER_PAGE));
}

async function recargar() {
    if (!cuentaId) { s.cache = []; s.total = 0; renderPage(1); return; }
    await loadBatch(0);
    renderPage(1);
}

/* -------- modal nuevo movimiento -------- */
function movOpen() { $("movModal").classList.add("active"); setTimeout(() => $("mbatipo").focus(), 200); }
function movClose() { $("movModal").classList.remove("active"); }
function movLimpiar() {
    $("movForm").reset(); dataRequiredClear();
    const hoy = new Date().toISOString().slice(0, 10);
    $("mbafecha").value = hoy;
    $("refextReq").style.display = "none"; $("contraReq").style.display = "none";
    // Formatea el importe según la moneda de la cuenta seleccionada (igual que en Productos → Precios).
    limpiarImportes();
    formatearImportes(monedaActual);
}
function actualizarHints() {
    const t = tiposMap[$("mbatipo").value];
    $("refextReq").style.display = t && t.tmorefext ? "" : "none";
    $("contraReq").style.display = t && t.tmobenefic ? "" : "none";
}
function movData() {
    return {
        mbacbaid: cuentaId, mbatipo: $("mbatipo").value,
        mbafecha: $("mbafecha").value || null, mbaimporte: quitarFormato($("mbaimporte").value, monedaActual) || 0,
        mbaconcepto: $("mbaconcepto").value.trim(),
        mbarefext: $("mbarefext").value.trim() || null, mbacontrapar: $("mbacontrapar").value.trim() || null,
        mbacontraruc: $("mbacontraruc").value.trim() || null, mbaobserva: $("mbaobserva").value.trim() || null
    };
}
async function movGuardar() {
    if (!validarCampos($("movForm"))) return;
    const t = tiposMap[$("mbatipo").value];
    if (t && t.tmorefext && !$("mbarefext").value.trim()) { showWarningToast("Falta referencia", "Este tipo exige la referencia externa del banco.", 3000); return; }
    if (t && t.tmobenefic && !$("mbacontrapar").value.trim()) { showWarningToast("Falta contraparte", "Este tipo exige identificar la contraparte.", 3000); return; }
    try {
        const r = await postData(registrarMovimiento, movData(), "Movimiento");
        if (r.success) { movClose(); movLimpiar(); await Promise.all([recargar(), cargarSaldo()]); showSuccessToast("Registrado", "Movimiento registrado con éxito", 2000); }
    } catch (e) { console.error(e); }
}

/* -------- modal anular -------- */
function abrirAnular(id) { anularId = Number(id); $("anularForm").reset(); dataRequiredClear(); $("anularModal").classList.add("active"); setTimeout(() => $("anuMotivo").focus(), 200); }
function cerrarAnular() { $("anularModal").classList.remove("active"); }
async function confirmarAnular() {
    if (!validarCampos($("anularForm"))) return;
    const motivo = $("anuMotivo").value.trim();
    try {
        const r = await putData(`${anularMovimiento}?id=${anularId}&motivo=${encodeURIComponent(motivo)}`, {}, "Movimiento");
        if (r.success) { cerrarAnular(); await Promise.all([recargar(), cargarSaldo()]); showSuccessToast("Anulado", "Movimiento anulado", 2000); }
    } catch (e) { console.error(e); }
}

async function init() {
    // Enganchamos los listeners PRIMERO: así los botones responden aunque la carga de datos falle.
    $("cuentaSel").addEventListener("change", async () => {
        const opt = $("cuentaSel").selectedOptions[0];
        cuentaId = Number($("cuentaSel").value || 0);
        monedaActual = opt ? (opt.dataset.moneda || "PYG") : "PYG";
        showLoader();
        try {
            await Promise.all([cargarSaldo(), recargar()]);
        } catch (e) {
            console.error(e);
        } finally {
            hideLoader();
        }
    });
    $("searchInput").addEventListener("input", () => void recargar());
    $("btnNuevo").addEventListener("click", () => {
        if (!cuentaId) { showWarningToast("Seleccioná una cuenta", "Elegí primero la cuenta para registrar el movimiento.", 3000); return; }
        movLimpiar(); movOpen();
    });
    $("mbatipo").addEventListener("change", actualizarHints);
    $("movClose").addEventListener("click", movClose);
    $("movCancel").addEventListener("click", movClose);
    $("movGuardar").addEventListener("click", () => void movGuardar());
    $("anuClose").addEventListener("click", cerrarAnular);
    $("anuCancel").addEventListener("click", cerrarAnular);
    $("anuConfirmar").addEventListener("click", () => void confirmarAnular());

    $("movPrimero").addEventListener("click", async () => { if (s.batch !== 0) await loadBatch(0); renderPage(1); });
    $("movAnterior").addEventListener("click", async () => { if (s.page > 1) { const nb = Math.floor((s.page - 2) / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page - 1); } });
    $("movSiguiente").addEventListener("click", async () => { const tp = Math.ceil(s.total / ROWS_PER_PAGE); if (s.page < tp) { const nb = Math.floor(s.page / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page + 1); } });
    $("movUltimo").addEventListener("click", async () => { const tp = Math.ceil(s.total / ROWS_PER_PAGE); const lb = Math.floor((tp - 1) / PAGES_PER_BATCH); if (lb !== s.batch) await loadBatch(lb); renderPage(tp); });

    window.addEventListener("click", (event) => {
        if (event.target === $("movModal")) movClose();
        if (event.target === $("anularModal")) cerrarAnular();
    });

    renderPage(1); // estado inicial: pide seleccionar cuenta

    // Carga de datos al final: si falla (p. ej. api sin reiniciar), los botones ya están activos.
    try {
        await Promise.all([cargarCuentas(), cargarTipos()]);
    } catch (e) {
        console.error("Error cargando cuentas/tipos:", e);
    }
}

void init();
