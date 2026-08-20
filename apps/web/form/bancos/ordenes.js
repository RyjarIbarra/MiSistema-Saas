import {
    listOrdenPago, getByIdOrdenPago, crearOrdenPago, actualizarOrdenPago, aprobarOrdenPago,
    anularOrdenPago, eliminarOrdenPago, agregarMedioOrdenPago, quitarMedioOrdenPago, pagarOrdenPago,
    listProveedor, listMoneda, listChequePropio, listChequeTercero, listCuentaBancaria, listMovimiento
} from "../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { showSuccessToast, showWarningToast } from "../../js/toast.js";
import {
    calcularFilasVisibles, dataRequiredClear, Enter, ICON_VER, validarCampos, formatearFecha,
    importeFormato, formatearImportes, limpiarImportes, quitarFormato
} from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);
const COMBO = { texto: "", limit: 1000, offset: 0 };
const hoy = () => new Date().toISOString().slice(0, 10);
const num = (v) => { const n = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", ".")); return isNaN(n) ? 0 : n; };

let proveedores = [], monedas = [], cuentas = [];
let ordenId = 0, ordenEstado = "", monedaActual = "PYG";
let ordenActual = null;

Enter();
cleanupLoader();

const ROWS_PER_PAGE = calcularFilasVisibles() || 8;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH;
const fmt = (v) => importeFormato(v || 0, monedaActual);
const ESTADOS = { BORRADOR: "Borrador", APROBADA: "Aprobada", PAGADA: "Pagada", ANULADA: "Anulada" };

/* ============================ LISTA ============================ */
const s = { page: 1, batch: 0, cache: [], total: 0 };
async function loadBatch(b) {
    const r = await postData(listOrdenPago, { estado: $("filtroEstado").value, texto: $("searchInput").value.trim(), limit: RECORDS_PER_BATCH, offset: b * RECORDS_PER_BATCH }, "Orden de pago");
    if (r.success) { s.batch = b; s.cache = r.objectsList || []; s.total = r.totalRecords || 0; }
}
function renderPag(tp) {
    const cont = $("opPages"); cont.innerHTML = ""; const items = []; const safe = Math.max(1, tp);
    if (safe <= 4) { for (let p = 1; p <= safe; p++) items.push(p); }
    else if (s.page <= 2) items.push(1, 2, 3, "e", safe);
    else if (s.page >= safe - 1) items.push(1, "e", safe - 2, safe - 1, safe);
    else items.push(s.page - 1, s.page, s.page + 1, "e", safe);
    items.forEach((it) => {
        const b = document.createElement("button"); b.type = "button";
        if (it === "e") { b.className = "pagination-ellipsis no-cursor"; b.disabled = true; b.textContent = "..."; cont.appendChild(b); return; }
        b.textContent = String(it);
        if (Number(it) === s.page) b.classList.add("active", "no-cursor");
        else b.addEventListener("click", async () => { const t = Number(it); const nb = Math.floor((t - 1) / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(t); });
        cont.appendChild(b);
    });
    $("opPrimero").disabled = s.page <= 1; $("opAnterior").disabled = s.page <= 1;
    $("opSiguiente").disabled = s.page >= safe; $("opUltimo").disabled = s.page >= safe;
}
function renderTable(data) {
    const tb = $("tablaOrdenes"); tb.innerHTML = "";
    if (data.length === 0) { hideLoader(); tb.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-file-invoice-dollar"></i><h3>Sin órdenes</h3><p>Creá la primera orden de pago.</p></div></td></tr>`; return; }
    data.forEach((o) => {
        const tr = document.createElement("tr"); tr.classList.add("sm");
        tr.innerHTML = `
            <td>${o.opanumero}/${o.opaejercicio}</td>
            <td>${o.opafecha ? formatearFecha(o.opafecha) : ""}</td>
            <td>${o.opaprvrazon || ""}</td>
            <td class="text-end" style="font-weight:600;">${importeFormato(o.opatotneto, o.opamoneda || "PYG")} ${o.opamoneda || ""}</td>
            <td><span class="op-badge ${o.opaestado}">${ESTADOS[o.opaestado] || o.opaestado}</span></td>
            <td data-label="Acciones"><div class="action-buttons"><button class="btn-icon" data-ver="${o.opaid}" title="Ver / gestionar">${ICON_VER}</button></div></td>`;
        tb.appendChild(tr);
    });
    tb.querySelectorAll("[data-ver]").forEach((b) => b.addEventListener("click", () => abrirOrden(Number(b.dataset.ver))));
    hideLoader();
}
function renderPage(p) {
    const tp = Math.max(1, Math.ceil(s.total / ROWS_PER_PAGE));
    s.page = Math.min(Math.max(p, 1), tp);
    const idx = (s.page - 1) % PAGES_PER_BATCH, start = idx * ROWS_PER_PAGE;
    $("pageinfo").textContent = `Total registros ${s.total}`;
    renderPag(tp); renderTable(s.cache.slice(start, start + ROWS_PER_PAGE));
}
async function recargar() { await loadBatch(0); renderPage(1); }

/* ============================ EDITOR ============================ */
function opOpen() { $("opModal").classList.add("active"); }
function opClose() { $("opModal").classList.remove("active"); }

function nuevaOrden() {
    ordenId = 0; ordenEstado = "BORRADOR"; ordenActual = null;
    $("opForm").reset(); dataRequiredClear();
    $("opTitle").textContent = "Nueva Orden de Pago";
    $("opBadge").className = "op-badge BORRADOR"; $("opBadge").textContent = "Borrador";
    $("opafecha").value = hoy(); $("opatipcambio").value = "1";
    $("tablaImput").innerHTML = ""; $("tablaReten").innerHTML = "";
    $("seccionMedios").style.display = "none";
    monedaActual = "PYG";
    setCabeceraEditable(true);
    addImputRow(); recalc();
    configurarBotones();
    opOpen();
}

async function abrirOrden(id) {
    showLoader();
    try {
        const r = await getData(`${getByIdOrdenPago}?id=${id}`, "Orden de pago");
        if (!r.success) return;
        const o = r.data; ordenActual = o; ordenId = o.opaid; ordenEstado = o.opaestado; monedaActual = o.opamoneda || "PYG";
        $("opTitle").textContent = `Orden Nº ${o.opanumero}/${o.opaejercicio}`;
        $("opBadge").className = `op-badge ${o.opaestado}`; $("opBadge").textContent = ESTADOS[o.opaestado] || o.opaestado;
        $("opaprvid").value = String(o.opaprvid); $("opafecha").value = o.opafecha || "";
        $("opamoneda").value = o.opamoneda || ""; $("opatipcambio").value = o.opatipcambio ?? 1;
        $("opaconcepto").value = o.opaconcepto || "";
        $("tablaImput").innerHTML = ""; (o.imputaciones || []).forEach((i) => addImputRow(i));
        $("tablaReten").innerHTML = ""; (o.retenciones || []).forEach((rt) => addRetenRow(rt));
        const editable = o.opaestado === "BORRADOR";
        setCabeceraEditable(editable);
        setFilasEditable(editable);
        renderMedios(o);
        $("seccionMedios").style.display = (o.opaestado === "APROBADA" || o.opaestado === "PAGADA") ? "" : "none";
        recalc();
        configurarBotones();
        opOpen();
    } catch (e) { console.error(e); } finally { hideLoader(); }
}

function setCabeceraEditable(ed) {
    ["opaprvid", "opafecha", "opamoneda", "opatipcambio", "opaconcepto"].forEach((id) => {
        const el = $(id);
        if (el.tagName === "SELECT") el.disabled = !ed; else el.readOnly = !ed;
    });
    $("btnAddImput").style.display = ed ? "" : "none";
    $("btnAddReten").style.display = ed ? "" : "none";
}
function setFilasEditable(ed) {
    document.querySelectorAll("#tablaImput input, #tablaImput select, #tablaReten input, #tablaReten select").forEach((el) => {
        if (el.tagName === "SELECT") el.disabled = !ed; else el.readOnly = !ed;
    });
    document.querySelectorAll(".op-row-x").forEach((x) => x.style.display = ed ? "" : "none");
}

function configurarBotones() {
    const e = ordenEstado;
    $("btnGuardar").style.display = (e === "BORRADOR") ? "" : "none";
    $("btnAprobar").style.display = (e === "BORRADOR" && ordenId) ? "" : "none";
    $("btnEliminar").style.display = (e === "BORRADOR" && ordenId) ? "" : "none";
    $("btnAnular").style.display = (e === "BORRADOR" || e === "APROBADA") ? "" : "none";
    $("btnPagar").style.display = (e === "APROBADA") ? "" : "none";
    $("btnAddMedio").style.display = (e === "APROBADA") ? "" : "none";
}

/* -------- imputaciones -------- */
function addImputRow(d = {}) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><select class="i-tipo"><option value="FAC">Factura</option><option value="NCR">Nota créd.</option><option value="ND">Nota déb.</option><option value="AC">Anticipo</option></select></td>
        <td style="white-space:nowrap;"><input class="i-timb" placeholder="timbrado" style="width:90px" maxlength="8"> <input class="i-estab" placeholder="001" style="width:44px" maxlength="3"> <input class="i-punto" placeholder="001" style="width:44px" maxlength="3"> <input class="i-num" placeholder="nº" type="number" style="width:72px"></td>
        <td><input class="i-fecemi" type="date" style="width:140px"></td>
        <td class="text-end"><input class="i-totdoc text-end" type="number" style="width:120px"></td>
        <td class="text-end"><input class="i-imp text-end" type="number" style="width:120px"></td>
        <td><i class="fa-solid fa-xmark op-row-x"></i></td>`;
    tr.querySelector(".i-tipo").value = d.opitipdoc || "FAC";
    tr.querySelector(".i-timb").value = d.opitimbrado || "";
    tr.querySelector(".i-estab").value = d.opiestab || "";
    tr.querySelector(".i-punto").value = d.opipunexp || "";
    tr.querySelector(".i-num").value = d.opinumero ?? "";
    tr.querySelector(".i-fecemi").value = d.opifecemi || "";
    tr.querySelector(".i-totdoc").value = d.opitotdoc ?? "";
    tr.querySelector(".i-imp").value = d.opiimporte ?? "";
    tr.querySelector(".op-row-x").addEventListener("click", () => { tr.remove(); recalc(); });
    tr.querySelectorAll("input").forEach((el) => el.addEventListener("input", recalc));
    $("tablaImput").appendChild(tr);
}
function collectImput() {
    const rows = [];
    $("tablaImput").querySelectorAll("tr").forEach((tr) => {
        const imp = num(tr.querySelector(".i-imp").value);
        const tot = num(tr.querySelector(".i-totdoc").value);
        if (imp <= 0) return;
        const tipo = tr.querySelector(".i-tipo").value;
        rows.push({
            opitipdoc: tipo, opiacuenta: tipo === "AC",
            opitimbrado: tr.querySelector(".i-timb").value.trim() || null,
            opiestab: tr.querySelector(".i-estab").value.trim() || null,
            opipunexp: tr.querySelector(".i-punto").value.trim() || null,
            opinumero: tr.querySelector(".i-num").value ? Number(tr.querySelector(".i-num").value) : null,
            opifecemi: tr.querySelector(".i-fecemi").value || null,
            opitotdoc: tot, opiimporte: imp
        });
    });
    return rows;
}

/* -------- retenciones -------- */
function addRetenRow(d = {}) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><select class="r-tipo"><option value="I">IVA</option><option value="R">Renta</option></select></td>
        <td><input class="r-conc" placeholder="Concepto" maxlength="60"></td>
        <td class="text-end"><input class="r-base text-end" type="number" style="width:120px"></td>
        <td class="text-end"><input class="r-tasa text-end" type="number" step="0.001" style="width:80px"></td>
        <td class="text-end"><input class="r-monto text-end" type="number" style="width:120px"></td>
        <td><i class="fa-solid fa-xmark op-row-x"></i></td>`;
    tr.querySelector(".r-tipo").value = d.oprtipo || "I";
    tr.querySelector(".r-conc").value = d.oprconcepto || "";
    tr.querySelector(".r-base").value = d.oprbase ?? "";
    tr.querySelector(".r-tasa").value = d.oprtasa ?? "";
    tr.querySelector(".r-monto").value = d.oprmonto ?? "";
    const auto = () => {
        const b = num(tr.querySelector(".r-base").value), t = num(tr.querySelector(".r-tasa").value);
        if (b > 0 && t > 0) tr.querySelector(".r-monto").value = Math.round(b * t / 100);
        recalc();
    };
    tr.querySelector(".r-base").addEventListener("input", auto);
    tr.querySelector(".r-tasa").addEventListener("input", auto);
    tr.querySelector(".r-monto").addEventListener("input", recalc);
    tr.querySelector(".op-row-x").addEventListener("click", () => { tr.remove(); recalc(); });
    $("tablaReten").appendChild(tr);
}
function collectReten() {
    const rows = [];
    $("tablaReten").querySelectorAll("tr").forEach((tr) => {
        const monto = num(tr.querySelector(".r-monto").value);
        if (monto <= 0) return;
        rows.push({
            oprtipo: tr.querySelector(".r-tipo").value, oprconcepto: tr.querySelector(".r-conc").value.trim() || (tr.querySelector(".r-tipo").value === "I" ? "Retención IVA" : "Retención Renta"),
            oprbase: num(tr.querySelector(".r-base").value), oprtasa: num(tr.querySelector(".r-tasa").value), oprmonto: monto
        });
    });
    return rows;
}

function recalc() {
    let imp = 0, ret = 0;
    $("tablaImput").querySelectorAll(".i-imp").forEach((el) => imp += num(el.value));
    $("tablaReten").querySelectorAll(".r-monto").forEach((el) => ret += num(el.value));
    $("tImput").textContent = fmt(imp);
    $("tReten").textContent = fmt(ret);
    $("tNeto").textContent = fmt(imp - ret);
}

/* -------- guardar / estados -------- */
function ordenBody() {
    return {
        opaid: ordenId,
        opaprvid: Number($("opaprvid").value || 0),
        opafecha: $("opafecha").value || null,
        opamoneda: $("opamoneda").value,
        opatipcambio: num($("opatipcambio").value) || 1,
        opaconcepto: $("opaconcepto").value.trim(),
        imputaciones: collectImput(),
        retenciones: collectReten()
    };
}
async function guardar() {
    if (!validarCampos($("opForm"))) return;
    const body = ordenBody();
    if (body.imputaciones.length === 0) { showWarningToast("Falta imputar", "Agregá al menos un comprobante con importe.", 3000); return; }
    try {
        const r = ordenId ? await putData(actualizarOrdenPago, body, "Orden") : await postData(crearOrdenPago, body, "Orden");
        if (r.success) { ordenActual = r.data; ordenId = r.data.opaid; ordenEstado = r.data.opaestado; showSuccessToast("Guardada", "Orden guardada en borrador", 2000); await recargar(); await abrirOrden(ordenId); }
    } catch (e) { console.error(e); }
}
async function aprobar() {
    const r = await putData(`${aprobarOrdenPago}?id=${ordenId}`, {}, "Orden");
    if (r.success) { showSuccessToast("Aprobada", "Orden aprobada; ya podés registrar los medios de pago", 2500); await recargar(); await abrirOrden(ordenId); }
}
function anular() {
    confirmDelete({ texto: "¿Anular esta orden?", onEliminar: async () => {
        const motivo = "Anulada desde el sistema";
        const r = await putData(`${anularOrdenPago}?id=${ordenId}&motivo=${encodeURIComponent(motivo)}`, {}, "Orden");
        if (r.success) { showSuccessToast("Anulada", "Orden anulada", 2000); opClose(); await recargar(); }
    } });
}
function eliminar() {
    confirmDelete({ texto: "¿Eliminar esta orden en borrador?", onEliminar: async () => {
        const r = await deleteData(`${eliminarOrdenPago}?id=${ordenId}`, "Orden");
        if (r.success) { showSuccessToast("Eliminada", "Orden eliminada", 2000); opClose(); await recargar(); }
    } });
}
async function pagar() {
    const r = await putData(`${pagarOrdenPago}?id=${ordenId}&fecha=${hoy()}`, {}, "Orden");
    if (r.success) { showSuccessToast("Pagada", "Orden registrada como pagada", 2500); await recargar(); await abrirOrden(ordenId); }
    else if (r.error) showWarningToast("No cuadra", r.error, 4000);
}

/* -------- medios -------- */
function renderMedios(o) {
    const tb = $("tablaMedios"); tb.innerHTML = "";
    const medios = o.medios || [];
    const FORMA = { EFECTIVO: "Efectivo", CHEQUE: "Cheque propio", CHEQUE_TER: "Cheque de tercero", TRANSFER: "Transferencia", COMPENSA: "Compensación" };
    let pagado = 0;
    if (medios.length === 0) tb.innerHTML = `<tr><td colspan="4" class="op-empty">Sin medios cargados</td></tr>`;
    medios.forEach((m) => {
        pagado += Number(m.opmimporte);
        const inst = m.opmchpid ? `cheque #${m.opmchpid}` : m.opmchtid ? `cheque 3º #${m.opmchtid}` : m.opmmbaid ? `mov. #${m.opmmbaid}` : (m.opmrefext || "—");
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${FORMA[m.opmforma] || m.opmforma}</td><td>${inst}</td><td class="text-end">${fmt(m.opmimporte)}</td>
            <td>${o.opaestado === "APROBADA" ? `<i class="fa-solid fa-xmark op-row-x" data-quitar="${m.opmid}"></i>` : ""}</td>`;
        tb.appendChild(tr);
    });
    const neto = Number(o.opatotneto);
    $("mPagado").textContent = fmt(pagado); $("mNeto").textContent = fmt(neto);
    const falta = neto - pagado;
    $("mFalta").innerHTML = falta === 0 ? `<span class="falta-ok">✓ cuadra</span>` : `<span class="falta-bad">(falta ${fmt(falta)})</span>`;
    tb.querySelectorAll("[data-quitar]").forEach((x) => x.addEventListener("click", async () => {
        const r = await deleteData(`${quitarMedioOrdenPago}?opmid=${x.dataset.quitar}`, "Medio");
        if (r.success) { await abrirOrden(ordenId); }
    }));
    $("btnPagar").disabled = falta !== 0;
}

/* -------- modal medio -------- */
function medioOpen() {
    $("medioForm").reset();
    $("opmforma").value = "EFECTIVO";
    onFormaChange();
    limpiarImportes(); formatearImportes(monedaActual);
    $("medioModal").classList.add("active");
}
function medioClose() { $("medioModal").classList.remove("active"); }
async function onFormaChange() {
    const forma = $("opmforma").value;
    const row = $("rowInstrumento"), sel = $("opmInstrumento");
    const impInput = $("opmimporte");
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    if (forma === "EFECTIVO" || forma === "COMPENSA") { row.style.display = "none"; impInput.readOnly = false; return; }
    row.style.display = ""; impInput.readOnly = true;
    if (forma === "CHEQUE") {
        $("lblInstrumento").textContent = "Cheque propio *";
        const r = await postData(listChequePropio, { cbaid: 0, estado: "", texto: "", limit: 1000, offset: 0 }, "Cheque");
        (r.objectsList || []).filter((c) => ["EMITIDO", "ENTREGADO"].includes(c.chpestado) && c.cbamoneda === monedaActual)
            .forEach((c) => sel.innerHTML += `<option value="${c.chpid}" data-imp="${c.chpimporte}">Nº ${c.chpnumero} · ${c.chpbenefic} · ${fmt(c.chpimporte)}</option>`);
    } else if (forma === "CHEQUE_TER") {
        $("lblInstrumento").textContent = "Cheque de tercero (en cartera) *";
        const r = await postData(listChequeTercero, { cbaid: 0, estado: "CARTERA", texto: "", limit: 1000, offset: 0 }, "Cheque");
        (r.objectsList || []).filter((c) => c.chtmoneda === monedaActual)
            .forEach((c) => sel.innerHTML += `<option value="${c.chtid}" data-imp="${c.chtimporte}">${c.chtnumero} · ${c.chtlibrador} · ${fmt(c.chtimporte)}</option>`);
    } else if (forma === "TRANSFER") {
        $("lblInstrumento").textContent = "Movimiento de transferencia *";
        const cbs = cuentas.filter((c) => c.cbamoneda === monedaActual);
        const listas = await Promise.all(cbs.map((c) => postData(listMovimiento, { cbaid: c.cbaid, texto: "", limit: 200, offset: 0, fechaDesde: null, fechaHasta: null }, "Movimiento")));
        listas.forEach((r) => (r.objectsList || []).filter((m) => m.mbaestado === "VIGENTE" && m.tmosigno === -1)
            .forEach((m) => sel.innerHTML += `<option value="${m.mbaid}" data-imp="${m.mbaimporte}">${formatearFecha(m.mbafecha)} · ${m.tmodescri} · ${fmt(m.mbaimporte)}</option>`));
    }
}
function onInstrumentoChange() {
    const opt = $("opmInstrumento").selectedOptions[0];
    if (opt && opt.dataset.imp) $("opmimporte").value = importeFormato(opt.dataset.imp, monedaActual);
}
async function medioGuardar() {
    const forma = $("opmforma").value;
    const body = { opmopaid: ordenId, opmforma: forma, opmrefext: $("opmrefext").value.trim() || null };
    if (forma === "EFECTIVO" || forma === "COMPENSA") {
        body.opmimporte = quitarFormato($("opmimporte").value, monedaActual) || 0;
        if (body.opmimporte <= 0) { showWarningToast("Importe", "Ingresá el importe.", 2500); return; }
    } else {
        const id = $("opmInstrumento").value;
        if (!id) { showWarningToast("Instrumento", "Seleccioná el instrumento.", 2500); return; }
        if (forma === "CHEQUE") body.opmchpid = Number(id);
        else if (forma === "CHEQUE_TER") body.opmchtid = Number(id);
        else if (forma === "TRANSFER") body.opmmbaid = Number(id);
        body.opmimporte = quitarFormato($("opmimporte").value, monedaActual) || 0;
    }
    try {
        const r = await postData(agregarMedioOrdenPago, body, "Medio");
        if (r.success) { medioClose(); await abrirOrden(ordenId); }
    } catch (e) { console.error(e); }
}

/* ============================ INIT ============================ */
async function cargarCombos() {
    const [rp, rm, rc] = await Promise.all([
        postData(listProveedor, COMBO, "Proveedor"),
        postData(listMoneda, COMBO, "Moneda"),
        postData(listCuentaBancaria, COMBO, "Cuenta")
    ]);
    proveedores = rp.objectsList || []; monedas = rm.objectsList || []; cuentas = (rc.objectsList || []).filter((c) => c.cbaactivo !== false);
    $("opaprvid").innerHTML = '<option value="">Seleccionar...</option>' + proveedores.map((p) => `<option value="${p.prvid}">${p.prvrazon}</option>`).join("");
    $("opamoneda").innerHTML = '<option value="">...</option>' + monedas.map((m) => `<option value="${m.codigo}">${m.codigo} - ${m.descripcion_es || m.descripcion || ""}</option>`).join("");
}

async function init() {
    $("filtroEstado").addEventListener("change", () => void recargar());
    $("searchInput").addEventListener("input", () => void recargar());
    $("btnNueva").addEventListener("click", () => nuevaOrden());
    $("opClose").addEventListener("click", opClose);
    $("opCancel").addEventListener("click", opClose);
    $("opamoneda").addEventListener("change", () => { monedaActual = $("opamoneda").value || "PYG"; recalc(); });
    $("btnAddImput").addEventListener("click", () => addImputRow());
    $("btnAddReten").addEventListener("click", () => addRetenRow());
    $("btnGuardar").addEventListener("click", () => void guardar());
    $("btnAprobar").addEventListener("click", () => void aprobar());
    $("btnAnular").addEventListener("click", anular);
    $("btnEliminar").addEventListener("click", eliminar);
    $("btnPagar").addEventListener("click", () => void pagar());

    $("btnAddMedio").addEventListener("click", medioOpen);
    $("medioClose").addEventListener("click", medioClose);
    $("medioCancel").addEventListener("click", medioClose);
    $("opmforma").addEventListener("change", () => void onFormaChange());
    $("opmInstrumento").addEventListener("change", onInstrumentoChange);
    $("medioGuardar").addEventListener("click", () => void medioGuardar());

    $("opPrimero").addEventListener("click", async () => { if (s.batch !== 0) await loadBatch(0); renderPage(1); });
    $("opAnterior").addEventListener("click", async () => { if (s.page > 1) { const nb = Math.floor((s.page - 2) / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page - 1); } });
    $("opSiguiente").addEventListener("click", async () => { const tp = Math.ceil(s.total / ROWS_PER_PAGE); if (s.page < tp) { const nb = Math.floor(s.page / PAGES_PER_BATCH); if (nb !== s.batch) await loadBatch(nb); renderPage(s.page + 1); } });
    $("opUltimo").addEventListener("click", async () => { const tp = Math.ceil(s.total / ROWS_PER_PAGE); const lb = Math.floor((tp - 1) / PAGES_PER_BATCH); if (lb !== s.batch) await loadBatch(lb); renderPage(tp); });

    window.addEventListener("click", (e) => { if (e.target === $("opModal")) opClose(); if (e.target === $("medioModal")) medioClose(); });

    showLoader();
    try { await cargarCombos(); await recargar(); } catch (e) { console.error(e); hideLoader(); }
}

void init();
