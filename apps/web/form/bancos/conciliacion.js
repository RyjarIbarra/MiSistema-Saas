import {
    listCuentaBancaria,
    listExtracto, getByIdExtracto, InsertExtracto, cerrarExtracto, DeleteExtracto,
    listPartidas, addPartida, deletePartida, ignorarPartida, plantillaPartidas, importarPartidas,
    reporteConciliacion, movimientosConciliar, vincularConciliacion, desvincularConciliacion, autoMatchConciliacion
} from "../../js/apiEndpoints.js";
import { deleteData, downloadFile, getData, postData, postFormData, putData } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { showSuccessToast, showWarningToast } from "../../js/toast.js";
import {
    dataRequiredClear, Enter, validarCampos, formatearFecha,
    importeFormato, formatearImportes, limpiarImportes, quitarFormato
} from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);
const COMBO = { texto: "", limit: 1000, offset: 0 };
const hoy = () => new Date().toISOString().slice(0, 10);

let cuentas = [];
let cuentaId = 0;
let extractoId = 0;
let monedaActual = "PYG";
let repEstado = "ABIERTO";
let selPartida = 0;     // expid seleccionada
let selMov = 0;         // mbaid seleccionado

Enter();
cleanupLoader();

const monedaDe = (cbaid) => {
    const c = cuentas.find((x) => String(x.cbaid) === String(cbaid));
    return c ? c.cbamoneda : "PYG";
};
const fmt = (v) => importeFormato(v || 0, monedaActual);

/* ----------------- carga de cuentas / extractos ----------------- */
async function cargarCuentas() {
    const r = await postData(listCuentaBancaria, COMBO, "Cuenta bancaria");
    cuentas = (r.objectsList || []).filter((c) => c.cbaactivo !== false);
    const opts = '<option value="">Seleccionar cuenta...</option>' +
        cuentas.map((c) => `<option value="${c.cbaid}" data-moneda="${c.cbamoneda}">${c.cbaalias} (${c.bannombre || ""} · ${c.cbamoneda})</option>`).join("");
    $("cuentaSel").innerHTML = opts;
    $("extCuenta").innerHTML = opts;
}

async function cargarExtractos(preselect) {
    if (!cuentaId) { $("extractoSel").innerHTML = '<option value="">— Extractos —</option>'; return; }
    const r = await getData(`${listExtracto}?cbaid=${cuentaId}`, "Extracto");
    const lista = r.objectsList || [];
    $("extractoSel").innerHTML = '<option value="">— Extractos —</option>' +
        lista.map((e) => `<option value="${e.extid}">${e.extfecini} a ${e.extfecfin} · ${e.extestado}</option>`).join("");
    if (preselect) $("extractoSel").value = String(preselect);
}

/* ----------------- workspace ----------------- */
function ocultarWorkspace() {
    $("resumen").style.display = "none";
    $("workspace").style.display = "none";
    $("accionbar").style.display = "none";
    extractoId = 0;
}

async function cargarWorkspace() {
    if (!extractoId) { ocultarWorkspace(); return; }
    showLoader();
    try {
        const [rep, par, mov] = await Promise.all([
            getData(`${reporteConciliacion}?extid=${extractoId}`, "Conciliación"),
            getData(`${listPartidas}?extid=${extractoId}`, "Partidas"),
            getData(`${movimientosConciliar}?extid=${extractoId}`, "Movimientos")
        ]);
        renderResumen(rep.data || {});
        renderPartidas(par.objectsList || []);
        renderMovs(mov.objectsList || []);
        selPartida = 0; selMov = 0; actualizarBtnVincular();
        $("resumen").style.display = "flex";
        $("workspace").style.display = "grid";
        $("accionbar").style.display = "flex";
    } catch (e) {
        console.error(e);
    } finally {
        hideLoader();
    }
}

function renderResumen(r) {
    repEstado = r.extestado || "ABIERTO";
    $("rSaldo").textContent = fmt(r.saldoBanco);
    const err = Number(r.errorCarga || 0);
    $("rError").textContent = fmt(r.errorCarga);
    $("rError").className = err === 0 ? "conc-ok" : "conc-bad";
    $("rPartidas").textContent = `${r.partidasConc || 0} / ${r.partidasTotal || 0}`;
    $("rAbiertas").textContent = r.partidasAbiertas ?? 0;
    $("rAbiertas").className = (r.partidasAbiertas || 0) > 0 ? "conc-bad" : "conc-ok";
    $("rMovAb").textContent = r.movimAbiertos ?? 0;
    const completa = !!r.completa;
    const conciliado = repEstado === "CONCILIADO";
    $("rEstado").textContent = conciliado ? "CONCILIADO" : (completa ? "Lista para cerrar" : "En proceso");
    $("rEstado").className = conciliado ? "conc-ok" : (completa ? "conc-ok" : "conc-bad");

    // Botones según estado
    const dis = conciliado;
    ["btnAddPartida", "btnBulk", "btnAuto", "btnEliminarExt", "btnCerrar"].forEach((id) => { $(id).disabled = dis; });
    $("btnCerrar").disabled = conciliado;
    $("btnEliminarExt").disabled = false; // eliminar solo permite ABIERTO en backend; dejamos que responda con error si no
    if (conciliado) { $("btnEliminarExt").disabled = true; }
}

function renderPartidas(data) {
    const tb = $("tablaPartidas");
    tb.innerHTML = "";
    if (data.length === 0) { tb.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:24px;">Sin partidas cargadas</td></tr>`; return; }
    const editable = repEstado !== "CONCILIADO";
    data.forEach((p) => {
        const tr = document.createElement("tr");
        const conc = p.expconcilia, ign = p.expignorar;
        tr.className = conc ? "conciliada" : (ign ? "ignorada" : "");
        tr.dataset.expid = p.expid;
        const badge = conc ? '<span class="conc-badge ok">Conciliada</span>' : (ign ? '<span class="conc-badge ign">Ignorada</span>' : '<span class="conc-badge pend">Pendiente</span>');
        const acciones = (editable && !conc)
            ? `<span class="conc-row-ign" data-ign="${p.expid}" data-val="${ign ? 0 : 1}" title="${ign ? "Reactivar" : "Ignorar"}"><i class="fa-solid ${ign ? "fa-rotate-left" : "fa-eye-slash"}"></i></span><span class="conc-row-x" data-del="${p.expid}" title="Eliminar"><i class="fa-solid fa-xmark"></i></span>`
            : "";
        tr.innerHTML = `
            <td>${p.expfecha ? formatearFecha(p.expfecha) : ""}</td>
            <td>${p.expdescri || ""}${p.expchecknro ? ` <small class="text-muted">chq ${p.expchecknro}</small>` : ""}</td>
            <td class="text-end">${Number(p.expdebito) > 0 ? fmt(p.expdebito) : ""}</td>
            <td class="text-end">${Number(p.expcredito) > 0 ? fmt(p.expcredito) : ""}</td>
            <td>${badge}</td>
            <td class="text-end" style="white-space:nowrap;">${acciones}</td>`;
        if (!conc && !ign) tr.addEventListener("click", (ev) => {
            if (ev.target.closest("[data-ign],[data-del]")) return;
            seleccionarPartida(p.expid, tr);
        });
        tb.appendChild(tr);
    });
    tb.querySelectorAll("[data-ign]").forEach((b) => b.addEventListener("click", async () => {
        const r = await putData(`${ignorarPartida}?expid=${b.dataset.ign}&ignorar=${b.dataset.val === "1"}`, {}, "Partida");
        if (r.success) await cargarWorkspace();
    }));
    tb.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
        confirmDelete({ texto: "¿Eliminar esta partida?", onEliminar: async () => {
            const r = await deleteData(`${deletePartida}?expid=${b.dataset.del}`, "Partida");
            if (r.success) { showSuccessToast("Eliminada", "Partida eliminada", 1500); await cargarWorkspace(); }
        } });
    }));
}

function renderMovs(data) {
    const tb = $("tablaMovs");
    tb.innerHTML = "";
    if (data.length === 0) { tb.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:24px;">Sin movimientos en el período</td></tr>`; return; }
    data.forEach((m) => {
        const tr = document.createElement("tr");
        const pend = Number(m.pendiente);
        const conciliadoFull = pend <= 0;
        if (conciliadoFull) tr.className = "conciliada";
        tr.dataset.mbaid = m.mbaid;
        const signo = m.tmosigno === 1 ? "+" : "−";
        const color = m.tmosigno === 1 ? "#16a34a" : "#dc2626";
        tr.innerHTML = `
            <td>${m.mbafecha ? formatearFecha(m.mbafecha) : ""}</td>
            <td>${m.tmodescri || m.mbatipo}</td>
            <td>${m.mbaconcepto || ""}</td>
            <td class="text-end" style="color:${color};font-weight:600;">${signo} ${fmt(m.mbaimporte)}</td>
            <td class="text-end">${conciliadoFull ? '<span class="conc-badge ok">✓</span>' : fmt(m.pendiente)}</td>`;
        if (!conciliadoFull && repEstado !== "CONCILIADO") tr.addEventListener("click", () => seleccionarMov(m.mbaid, tr));
        tb.appendChild(tr);
    });
}

function seleccionarPartida(expid, tr) {
    selPartida = (selPartida === expid) ? 0 : expid;
    $("tablaPartidas").querySelectorAll("tr").forEach((r) => r.classList.remove("sel"));
    if (selPartida) tr.classList.add("sel");
    actualizarBtnVincular();
}
function seleccionarMov(mbaid, tr) {
    selMov = (selMov === mbaid) ? 0 : mbaid;
    $("tablaMovs").querySelectorAll("tr").forEach((r) => r.classList.remove("sel"));
    if (selMov) tr.classList.add("sel");
    actualizarBtnVincular();
}
function actualizarBtnVincular() {
    $("btnVincular").disabled = !(selPartida && selMov) || repEstado === "CONCILIADO";
}

/* ----------------- acciones ----------------- */
async function vincular() {
    if (!selPartida || !selMov) return;
    try {
        const r = await postData(vincularConciliacion, { covexpid: selPartida, covmbaid: selMov }, "Vínculo");
        if (r.success) { showSuccessToast("Vinculado", "Partida y movimiento vinculados", 1500); await cargarWorkspace(); }
    } catch (e) { console.error(e); }
}
async function autoEmparejar() {
    try {
        const r = await postData(`${autoMatchConciliacion}?extid=${extractoId}`, {}, "Conciliación");
        if (r.success) { showSuccessToast("Auto-emparejado", r.data || "Listo", 2500); await cargarWorkspace(); }
    } catch (e) { console.error(e); }
}
let cerrarConfirmado = false;
async function cerrar() {
    // Confirmación en dos pasos con toast (no hay modal genérico de confirmación y el de borrado no aplica).
    if (!cerrarConfirmado) {
        cerrarConfirmado = true;
        $("btnCerrar").innerHTML = '<i class="fa-solid fa-lock"></i> Confirmar cierre';
        showWarningToast("Confirmá el cierre", "El extracto quedará bloqueado. Volvé a tocar el botón para cerrar.", 4000);
        setTimeout(() => { cerrarConfirmado = false; $("btnCerrar").innerHTML = '<i class="fa-solid fa-lock"></i> Cerrar conciliación'; }, 4000);
        return;
    }
    cerrarConfirmado = false;
    $("btnCerrar").innerHTML = '<i class="fa-solid fa-lock"></i> Cerrar conciliación';
    try {
        const r = await putData(`${cerrarExtracto}?id=${extractoId}`, {}, "Conciliación");
        if (r.success) {
            const dif = Number(r.data?.extdiferenc || 0);
            showSuccessToast("Conciliado", dif === 0 ? "Cerrado sin diferencias" : `Cerrado con diferencia de ${fmt(Math.abs(dif))}`, 3000);
            await cargarExtractos(extractoId); await cargarWorkspace();
        }
    } catch (e) { console.error(e); }
}
function eliminarExtracto() {
    confirmDelete({
        texto: "¿Eliminar este extracto y todas sus partidas?", onEliminar: async () => {
            const r = await deleteData(`${DeleteExtracto}?id=${extractoId}`, "Extracto");
            if (r.success) { showSuccessToast("Eliminado", "Extracto eliminado", 1500); ocultarWorkspace(); await cargarExtractos(); }
        }
    });
}

/* ----------------- modal nuevo extracto ----------------- */
function extOpen() { $("extModal").classList.add("active"); setTimeout(() => $("extCuenta").focus(), 200); }
function extClose() { $("extModal").classList.remove("active"); }
function extLimpiar() {
    $("extForm").reset(); dataRequiredClear();
    if (cuentaId) $("extCuenta").value = String(cuentaId);
    $("extfecini").value = ""; $("extfecfin").value = "";
    limpiarImportes(); formatearImportes(monedaDe($("extCuenta").value));
}
async function extGuardar() {
    if (!validarCampos($("extForm"))) return;
    const mon = monedaDe($("extCuenta").value);
    const body = {
        extcbaid: Number($("extCuenta").value || 0),
        extfecini: $("extfecini").value || null,
        extfecfin: $("extfecfin").value || null,
        extsaldoini: quitarFormato($("extsaldoini").value, mon) || 0,
        extsaldofin: quitarFormato($("extsaldofin").value, mon) || 0,
        extobserva: $("extobserva").value.trim() || null
    };
    try {
        const r = await postData(InsertExtracto, body, "Extracto");
        if (r.success) {
            extClose();
            cuentaId = body.extcbaid; monedaActual = mon;
            $("cuentaSel").value = String(cuentaId);
            await cargarExtractos(r.data.extid);
            extractoId = r.data.extid;
            await cargarWorkspace();
            showSuccessToast("Creado", "Extracto creado; ya podés cargar sus partidas", 2500);
        }
    } catch (e) { console.error(e); }
}

/* ----------------- modal agregar partida ----------------- */
function parOpen() { $("parModal").classList.add("active"); setTimeout(() => $("pfecha").focus(), 200); }
function parClose() { $("parModal").classList.remove("active"); }
function parLimpiar() {
    $("parForm").reset(); dataRequiredClear();
    $("pfecha").value = hoy();
    limpiarImportes(); formatearImportes(monedaActual);
}
async function parGuardar() {
    if (!validarCampos($("parForm"))) return;
    const deb = quitarFormato($("pdebito").value, monedaActual) || 0;
    const cre = quitarFormato($("pcredito").value, monedaActual) || 0;
    if ((deb > 0) === (cre > 0)) { showWarningToast("Débito o crédito", "Cargá un débito o un crédito (uno de los dos, positivo).", 3000); return; }
    const chk = $("pchecknro").value.trim();
    const body = {
        expextid: extractoId, expfecha: $("pfecha").value || null,
        expdescri: $("pdescri").value.trim(), expreferen: $("preferen").value.trim() || null,
        expdebito: deb, expcredito: cre, expchecknro: chk ? Number(chk) : null
    };
    try {
        const r = await postData(addPartida, body, "Partida");
        if (r.success) { parClose(); showSuccessToast("Agregada", "Partida agregada", 1500); await cargarWorkspace(); }
    } catch (e) { console.error(e); }
}

/* ----------------- modal importar Excel ----------------- */
let archivoSel = null;
function bulkOpen() {
    archivoSel = null; $("partidaFile").value = "";
    $("dropText").textContent = "Arrastrá el archivo .xlsx aquí o hacé clic para elegirlo";
    $("importResult").innerHTML = ""; $("bulkGuardar").disabled = true;
    $("bulkModal").classList.add("active");
}
function bulkClose() { $("bulkModal").classList.remove("active"); }

async function descargarPlantilla() {
    try {
        const { blob, filename } = await downloadFile(plantillaPartidas, "plantilla-extracto.xlsx", "Plantilla");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename || "plantilla-extracto.xlsx";
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    } catch (e) { console.error(e); showWarningToast("Error", "No se pudo descargar la plantilla.", 3000); }
}

function elegirArchivo(file) {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) { showWarningToast("Formato inválido", "Solo se permiten archivos .xlsx o .xls.", 3000); return; }
    archivoSel = file;
    $("dropText").textContent = file.name;
    $("importResult").innerHTML = "";
    $("bulkGuardar").disabled = false;
}

async function importar() {
    if (!archivoSel) return;
    const fd = new FormData();
    fd.append("extid", String(extractoId));
    fd.append("file", archivoSel);
    try {
        const r = await postFormData(importarPartidas, fd, "Partidas");
        if (!r.success) { $("importResult").innerHTML = `<div class="conc-import-err">${r.error || "No se pudo importar."}</div>`; return; }
        const res = r.data || {};
        if ((res.fallidos || 0) > 0) {
            const items = (res.errores || []).map((e) => `<li>Fila ${e.fila}${e.prodesc ? ` (${e.prodesc})` : ""}: ${e.error}</li>`).join("");
            $("importResult").innerHTML = `<div class="conc-import-err"><b>No se cargó nada.</b> ${res.fallidos} fila(s) con error:<ul>${items}</ul>Corregí el archivo y volvé a subirlo.</div>`;
        } else {
            $("importResult").innerHTML = `<div class="conc-import-ok"><b>${res.exitosos}</b> partidas importadas correctamente.</div>`;
            showSuccessToast("Importado", `${res.exitosos} partidas cargadas`, 2500);
            await cargarWorkspace();
            setTimeout(bulkClose, 1200);
        }
    } catch (e) { console.error(e); }
}

/* ----------------- init ----------------- */
async function init() {
    $("cuentaSel").addEventListener("change", async () => {
        cuentaId = Number($("cuentaSel").value || 0);
        monedaActual = monedaDe(cuentaId);
        ocultarWorkspace();
        await cargarExtractos();
    });
    $("extractoSel").addEventListener("change", async () => {
        extractoId = Number($("extractoSel").value || 0);
        if (!extractoId) { ocultarWorkspace(); return; }
        await cargarWorkspace();
    });

    $("btnNuevoExt").addEventListener("click", () => { if (!cuentaId) { showWarningToast("Elegí una cuenta", "Seleccioná primero la cuenta.", 2500); return; } extLimpiar(); extOpen(); });
    $("extCuenta").addEventListener("change", () => { limpiarImportes(); formatearImportes(monedaDe($("extCuenta").value)); });
    $("extClose").addEventListener("click", extClose);
    $("extCancel").addEventListener("click", extClose);
    $("extGuardar").addEventListener("click", () => void extGuardar());

    $("btnAddPartida").addEventListener("click", () => { parLimpiar(); parOpen(); });
    $("parClose").addEventListener("click", parClose);
    $("parCancel").addEventListener("click", parClose);
    $("parGuardar").addEventListener("click", () => void parGuardar());

    $("btnBulk").addEventListener("click", bulkOpen);
    $("bulkClose").addEventListener("click", bulkClose);
    $("bulkCancel").addEventListener("click", bulkClose);
    $("bulkGuardar").addEventListener("click", () => void importar());
    $("btnPlantilla").addEventListener("click", () => void descargarPlantilla());
    $("dropzone").addEventListener("click", () => $("partidaFile").click());
    $("partidaFile").addEventListener("change", (e) => elegirArchivo(e.target.files[0]));
    $("dropzone").addEventListener("dragover", (e) => { e.preventDefault(); $("dropzone").classList.add("drag"); });
    $("dropzone").addEventListener("dragleave", () => $("dropzone").classList.remove("drag"));
    $("dropzone").addEventListener("drop", (e) => {
        e.preventDefault(); $("dropzone").classList.remove("drag");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) elegirArchivo(e.dataTransfer.files[0]);
    });

    $("btnVincular").addEventListener("click", () => void vincular());
    $("btnAuto").addEventListener("click", () => void autoEmparejar());
    $("btnCerrar").addEventListener("click", cerrar);
    $("btnEliminarExt").addEventListener("click", eliminarExtracto);

    window.addEventListener("click", (e) => {
        if (e.target === $("extModal")) extClose();
        if (e.target === $("parModal")) parClose();
        if (e.target === $("bulkModal")) bulkClose();
    });

    showLoader();
    try { await cargarCuentas(); } catch (e) { console.error(e); }
    hideLoader();
}

void init();
