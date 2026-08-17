import {
    getByIdEmpresa,
    InsertEmpresa,
    listEmpresa,
    UpdateEmpresa
} from "../../../js/apiEndpoints.js";
import { getData, postData, putData } from "../../../js/apiService.js";
import { confirmDelete } from "../../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../../js/loader.js";
import { cargaOptionsMoneda } from "../../../js/options.js";
import { showSuccessToast, showWarningToast } from "../../../js/toast.js";
import { configurarInputs, dataRequiredClear, Enter, Tab, validarCampos } from "../../../js/utilidades.js";
import { ACTIVIDADES_ECONOMICAS, SECCIONES_CIIU, buscarActividadPorCodigo, buscarActividadesPorTexto, obtenerActividadesPorSeccion } from "./actividades-economicas.js";
import { DEPARTAMENTOS, getCiudadByCodigo, getCiudadesByDistrito, getDepartamentoByCodigo, getDistritoByCodigo, getDistritosByDepartamento } from "../../../js/paraguay-geografia.js";

const $ = (id) => document.getElementById(id);

const setVal = (id, val) => {
    $(id).value = val ?? "";
};

let modoEmpresa = "INS";
let empresaId = 0;
let actividadesCache = [];
let obligacionesCache = [];

const OBLIGACIONES_EMPRESA = [
    { codigo: 113, descripcion: "Impuesto a la Renta IRACIS - Regímenes Especiales" },
    { codigo: 143, descripcion: "Tributo Único Maquila" },
    { codigo: 211, descripcion: "Impuesto al Valor Agregado - Gravadas y Exoneradas - Exportadores" },
    { codigo: 311, descripcion: "Impuesto Selectivo al Consumo - General" },
    { codigo: 321, descripcion: "Impuesto Selectivo al Consumo Combustibles" },
    { codigo: 700, descripcion: "Impuesto a la Renta Empresarial - Régimen General" },
    { codigo: 701, descripcion: "Impuesto a la Renta Empresarial - SIMPLE" },
    { codigo: 702, descripcion: "Impuesto a la Renta Empresarial - RESIMPLE" },
    { codigo: 703, descripcion: "Impuesto de Zona Franca" },
    { codigo: 715, descripcion: "Impuesto a la Renta Personal - Servicios Personales" },
    { codigo: 716, descripcion: "Impuesto a la Renta Personal - Rentas y Ganancias de Capital" }
];

const filtroEmpresa = {
    texto: "",
    limit: 50,
    offset: 0
};

Enter();
cleanupLoader();
configurarInputs();
Tab();
$("moneda_default").innerHTML = await cargaOptionsMoneda();

function boolValue(id) {
    return $(id).checked;
}

function selectedText(id) {
    const select = $(id);
    return select.options[select.selectedIndex]?.text || "";
}

function numberOrZero(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function setObligacionesSeleccionadas(obligaciones = []) {
    const codigosSeleccionados = new Set(
        obligaciones.map((item) => String(item.codigo ?? item.obligacion_codigo))
    );
    obligacionesCache = OBLIGACIONES_EMPRESA
        .filter((item) => codigosSeleccionados.has(String(item.codigo)))
        .map((item) => ({ ...item }));
    renderObligaciones();
}

function renderObligaciones() {
    const tbody = $("obligacionTableBody");
    tbody.innerHTML = "";

    OBLIGACIONES_EMPRESA.forEach((item) => {
        const checked = obligacionesCache.some((obligacion) => Number(obligacion.codigo) === Number(item.codigo));
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.innerHTML = `
            <td data-label="Sel.">
                <label class="switch">
                    <input type="checkbox" data-codigo="${item.codigo}" ${checked ? "checked" : ""}>
                    <span class="slider"></span>
                </label>
            </td>
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Descripción">${item.descripcion}</td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll("#obligacionTableBody .switch input").forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
            const codigo = Number(event.target.getAttribute("data-codigo"));
            toggleObligacion(codigo, event.target.checked);
        });
    });
}

function toggleObligacion(codigo, checked) {
    const obligacion = OBLIGACIONES_EMPRESA.find((item) => Number(item.codigo) === Number(codigo));
    if (!obligacion) {
        return;
    }

    if (checked) {
        if (!obligacionesCache.some((item) => Number(item.codigo) === Number(codigo))) {
            obligacionesCache = [...obligacionesCache, { ...obligacion }];
        }
    } else {
        obligacionesCache = obligacionesCache.filter((item) => Number(item.codigo) !== Number(codigo));
    }
}

function renderDepartamentoOptions(selectedCodigo = "") {
    $("departamento_descripcion").innerHTML = '<option value="">Seleccionar...</option>' +
        DEPARTAMENTOS.map((item) => (
            `<option value="${item.codigo}" ${String(item.codigo) === String(selectedCodigo) ? "selected" : ""}>${item.descripcion}</option>`
        )).join("");

    setVal("departamento_codigo", selectedCodigo || "");
}

function renderDistritoOptions(departamentoCodigo, selectedDistrito = "") {
    const distritos = departamentoCodigo ? getDistritosByDepartamento(Number(departamentoCodigo)) : [];
    $("distrito_descripcion").innerHTML = '<option value="">Seleccionar...</option>' +
        distritos.map((item) => (
            `<option value="${item.codigo}" ${String(item.codigo) === String(selectedDistrito) ? "selected" : ""}>${item.descripcion}</option>`
        )).join("");

    setVal("distrito_codigo", selectedDistrito || "");
}

function renderCiudadOptions(distritoCodigo, selectedCiudad = "") {
    const ciudades = distritoCodigo ? getCiudadesByDistrito(Number(distritoCodigo)) : [];
    $("ciudad_descripcion").innerHTML = '<option value="">Seleccionar...</option>' +
        ciudades.map((item) => (
            `<option value="${item.codigo}" ${String(item.codigo) === String(selectedCiudad) ? "selected" : ""}>${item.descripcion}</option>`
        )).join("");

    setVal("ciudad_codigo", selectedCiudad || "");
}

function syncDepartamento() {
    const codigo = $("departamento_descripcion").value;
    const departamento = codigo ? getDepartamentoByCodigo(Number(codigo)) : null;
    setVal("departamento_codigo", departamento?.codigo || "");
    renderDistritoOptions(codigo);
    renderCiudadOptions("");
}

function syncDistrito() {
    const codigo = $("distrito_descripcion").value;
    const distrito = codigo ? getDistritoByCodigo(Number(codigo)) : null;
    setVal("distrito_codigo", distrito?.codigo || "");
    renderCiudadOptions(codigo);
}

function syncCiudad() {
    const codigo = $("ciudad_descripcion").value;
    const ciudad = codigo ? getCiudadByCodigo(Number(codigo)) : null;
    setVal("ciudad_codigo", ciudad?.codigo || "");
}

function cargarUbicacionSeleccionada(departamentoCodigo, distritoCodigo, ciudadCodigo) {
    renderDepartamentoOptions(departamentoCodigo);
    renderDistritoOptions(departamentoCodigo, distritoCodigo);
    renderCiudadOptions(distritoCodigo, ciudadCodigo);
}

function actualizarEstadoActividades() {
    $("btnBuscarActividad").disabled = false;
}

function normalizarActividadPrincipal() {
    let principalEncontrado = false;
    actividadesCache = actividadesCache.map((item) => {
        if (item.es_principal && !principalEncontrado) {
            principalEncontrado = true;
            return { ...item, es_principal: true };
        }
        return { ...item, es_principal: false };
    });
}

function openActividadCatalogo() {
    $("actividadCatalogoModal").classList.add("active");
    renderActividadCatalogo();
    setTimeout(() => {
        $("actividadCatalogoBuscar").focus();
    }, 120);
}

function closeActividadCatalogo() {
    $("actividadCatalogoModal").classList.remove("active");
}

function aplicarActividadSeleccionada(actividad) {
    if (!actividad) {
        return;
    }

    const existeCodigoDuplicado = actividadesCache.some((item) =>
        item.codigo.trim().toUpperCase() === actividad.codigo.trim().toUpperCase()
    );

    if (existeCodigoDuplicado) {
        showWarningToast("Actividad existente", "Esa actividad ya forma parte de la configuración actual.", 3000);
        return;
    }

    actividadesCache.push({
        id: Date.now(),
        codigo: actividad.codigo,
        descripcion: actividad.descripcion,
        es_principal: false
    });

    renderActividades(actividadesCache);
    closeActividadCatalogo();
    showSuccessToast("Agregada", "Actividad agregada. Guarda la configuración para persistir los cambios.", 2200);
}

function renderActividadCatalogo() {
    const texto = $("actividadCatalogoBuscar").value.trim();
    const seccion = $("actividadCatalogoSeccion").value;
    const tbody = $("actividadCatalogoTableBody");

    let data = texto ? buscarActividadesPorTexto(texto) : [...ACTIVIDADES_ECONOMICAS];
    if (seccion) {
        const codigosSeccion = new Set(obtenerActividadesPorSeccion(seccion).map((item) => item.codigo));
        data = data.filter((item) => codigosSeccion.has(item.codigo));
    }

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="empty-state">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <h3>No se encontraron actividades</h3>
                        <p>Prueba con otro código, descripción o sección.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    data.slice(0, 200).forEach((item) => {
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.style.cursor = "pointer";
        row.innerHTML = `
            <td data-label="Sección">${item.seccion} - ${SECCIONES_CIIU[item.seccion] || ""}</td>
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Descripción">${item.descripcion}</td>
        `;
        row.addEventListener("click", () => aplicarActividadSeleccionada(item));
        tbody.appendChild(row);
    });
}

function cargarSeccionesActividad() {
    $("actividadCatalogoSeccion").innerHTML = '<option value="">Todas las secciones</option>' +
        Object.entries(SECCIONES_CIIU).map(([codigo, descripcion]) => (
            `<option value="${codigo}">${codigo} - ${descripcion}</option>`
        )).join("");
}

function limpiarEmpresa() {
    modoEmpresa = "INS";
    empresaId = 0;
    actividadesCache = [];
    obligacionesCache = [];
    $("empresaForm").reset();
    $("iva_incluido_default").checked = true;
    $("es_facturador_electronico").checked = false;
    $("moneda_default").value = "PYG";
    $("estado").value = "ACTIVO";
    cargarUbicacionSeleccionada("", "", "");
    renderObligaciones();
    toggleFacturacionElectronica();
    dataRequiredClear();
    actualizarEstadoActividades();
    renderActividades(actividadesCache);
}

function toggleFacturacionElectronica() {
    const habilitado = boolValue("es_facturador_electronico");
    $("ambiente_sifen").disabled = !habilitado;
    $("codigo_seguridad_contribuyente").disabled = !habilitado;

    if (!habilitado) {
        setVal("ambiente_sifen", "");
        setVal("codigo_seguridad_contribuyente", "");
    }
}

function validarEmpresaExtra() {
    const ids = [
        ["direccion", "Dirección"],
        ["departamento_codigo", "Código de departamento"],
        ["departamento_descripcion", "Departamento"],
        ["distrito_codigo", "Código de distrito"],
        ["distrito_descripcion", "Distrito"],
        ["ciudad_codigo", "Código de ciudad"],
        ["ciudad_descripcion", "Ciudad"]
    ];

    for (const [id, label] of ids) {
        const campo = $(id);
        if (!campo.value.trim()) {
            campo.classList.add("is-invalid");
            campo.focus();
            showWarningToast(`${label} requerido`, `Completa el campo ${label}.`, 4000);
            return false;
        }
        campo.classList.remove("is-invalid");
    }

    if (boolValue("es_facturador_electronico") && !$("ambiente_sifen").value) {
        showWarningToast("Ambiente requerido", "Selecciona el ambiente SIFEN para facturación electrónica.", 4000);
        $("ambiente_sifen").focus();
        return false;
    }

    return true;
}

function empresaPayload() {
    return {
        id: numberOrZero(empresaId),
        ruc: $("ruc").value.trim(),
        dv_ruc: $("dv_ruc").value.trim(),
        razon_social: $("razon_social").value.trim(),
        nombre_fantasia: $("nombre_fantasia").value.trim() || null,
        tipo_contribuyente: numberOrZero($("tipo_contribuyente").value),
        tipo_regimen: numberOrZero($("tipo_regimen").value.trim()),
        tipo_transaccion: numberOrZero($("tipo_transaccion").value),
        tipo_impuesto: numberOrZero($("tipo_impuesto").value),
        direccion: $("direccion").value.trim(),
        numero_casa: $("numero_casa").value.trim() || null,
        departamento_codigo: numberOrZero($("departamento_codigo").value),
        departamento_descripcion: selectedText("departamento_descripcion"),
        distrito_codigo: numberOrZero($("distrito_codigo").value),
        distrito_descripcion: selectedText("distrito_descripcion"),
        ciudad_codigo: numberOrZero($("ciudad_codigo").value),
        ciudad_descripcion: selectedText("ciudad_descripcion"),
        telefono: $("telefono").value.trim() || null,
        email: $("email").value.trim() || null,
        sitio_web: $("sitio_web").value.trim() || null,
        logo_ruta: $("logo_ruta").value.trim() || null,
        es_facturador_electronico: boolValue("es_facturador_electronico"),
        ambiente_sifen: $("ambiente_sifen").value || null,
        codigo_seguridad_contribuyente: $("codigo_seguridad_contribuyente").value.trim() || null,
        moneda_default: $("moneda_default").value || "PYG",
        iva_incluido_default: boolValue("iva_incluido_default"),
        estado: $("estado").value || "ACTIVO",
        fecha_inicio_actividades: $("fecha_inicio_actividades").value || null,
        obligaciones: obligacionesCache.map((item) => ({
            codigo: numberOrZero(item.codigo),
            descripcion: item.descripcion
        })),
        actividades: actividadesCache.map((item) => ({
            codigo: item.codigo,
            descripcion: item.descripcion,
            es_principal: Boolean(item.es_principal)
        }))
    };
}

async function cargarEmpresa() {
    showLoader("Cargando empresa...");
    try {
        const response = await postData(listEmpresa, filtroEmpresa, "Empresa");
        const empresas = response.objectsList || [];

        if (empresas.length === 0) {
            limpiarEmpresa();
            return;
        }

        await cargarEmpresaById(empresas[0].id);
    } catch (error) {
        console.error("Error en cargarEmpresa:", error);
    } finally {
        hideLoader();
    }
}

async function cargarEmpresaById(id) {
    try {
        const response = await getData(`${getByIdEmpresa}?id=${id}`, "Empresa");
        if (!response.success) {
            return;
        }

        const empresa = response.data;
        empresaId = empresa.id;
        modoEmpresa = "UPD";
        actividadesCache = Array.isArray(empresa.actividades) ? [...empresa.actividades] : [];
        normalizarActividadPrincipal();

        setVal("ruc", empresa.ruc);
        setVal("dv_ruc", empresa.dv_ruc);
        setVal("razon_social", empresa.razon_social);
        setVal("nombre_fantasia", empresa.nombre_fantasia);
        setVal("tipo_contribuyente", empresa.tipo_contribuyente);
        setVal("tipo_regimen", empresa.tipo_regimen);
        setVal("tipo_transaccion", empresa.tipo_transaccion);
        setVal("tipo_impuesto", empresa.tipo_impuesto);
        setVal("direccion", empresa.direccion);
        setVal("numero_casa", empresa.numero_casa);
        cargarUbicacionSeleccionada(empresa.departamento_codigo, empresa.distrito_codigo, empresa.ciudad_codigo);
        setVal("telefono", empresa.telefono);
        setVal("email", empresa.email);
        setVal("sitio_web", empresa.sitio_web);
        setVal("logo_ruta", empresa.logo_ruta);
        $("es_facturador_electronico").checked = Boolean(empresa.es_facturador_electronico);
        setVal("ambiente_sifen", empresa.ambiente_sifen);
        setVal("codigo_seguridad_contribuyente", empresa.codigo_seguridad_contribuyente);
        setVal("moneda_default", empresa.moneda_default || "PYG");
        $("iva_incluido_default").checked = empresa.iva_incluido_default !== false;
        setVal("estado", empresa.estado || "ACTIVO");
        setVal("fecha_inicio_actividades", empresa.fecha_inicio_actividades);
        setObligacionesSeleccionadas(empresa.obligaciones || []);

        toggleFacturacionElectronica();
        actualizarEstadoActividades();
        renderActividades(actividadesCache);
    } catch (error) {
        console.error("Error en cargarEmpresaById:", error);
    }
}

async function guardarEmpresa() {
    const form = $("empresaForm");
    if (!validarCampos(form) || !validarEmpresaExtra()) {
        return;
    }

    try {
        const payload = empresaPayload();
        const response = modoEmpresa === "INS"
            ? await postData(InsertEmpresa, payload, "Empresa")
            : await putData(UpdateEmpresa, payload, "Empresa");

        if (response.success) {
            empresaId = response.data?.id || empresaId;
            modoEmpresa = "UPD";
            actualizarEstadoActividades();
            await cargarEmpresa();
            showSuccessToast("Guardado", "Configuración de empresa guardada con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en guardarEmpresa:", error);
    }
}

function renderActividades(data) {
    const tableBody = $("actividadTableBody");
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fa-solid fa-briefcase"></i>
                        <h3>No se encontraron actividades</h3>
                        <p>Agrega actividades económicas y luego guarda la configuración.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((item) => {
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.innerHTML = `
            <td data-label="ID">${item.id || ""}</td>
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Descripción">${item.descripcion}</td>
            <td data-label="Principal">
                <label class="switch">
                    <input type="checkbox" data-id="${item.id}" data-tipo="principal" ${item.es_principal ? "checked" : ""}>
                    <span class="slider"></span>
                </label>
            </td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="eliminarActividad" data-id="${item.id}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('[tipo-btn="eliminarActividad"]').forEach((boton) => {
        boton.addEventListener("click", () => {
            const id = boton.dataset.id;
            confirmDelete({
                texto: "¿Está seguro de que desea eliminar la actividad?",
                onEliminar: () => eliminarActividad(id)
            });
        });
    });

    document.querySelectorAll('#actividadTableBody .switch input[data-tipo="principal"]').forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
            cambiarPrincipalActividad(event.target.getAttribute("data-id"));
        });
    });
}

function eliminarActividad(id) {
    actividadesCache = actividadesCache.filter((item) => String(item.id) !== String(id));
    renderActividades(actividadesCache);
    showSuccessToast("Eliminado", "Actividad quitada de la configuración actual.", 1800);
}

function cambiarPrincipalActividad(id) {
    actividadesCache = actividadesCache.map((item) => ({
        ...item,
        es_principal: String(item.id) === String(id)
    }));
    renderActividades(actividadesCache);
}

$("btnGuardarEmpresa").addEventListener("click", guardarEmpresa);
$("es_facturador_electronico").addEventListener("change", toggleFacturacionElectronica);
$("departamento_descripcion").addEventListener("change", syncDepartamento);
$("distrito_descripcion").addEventListener("change", syncDistrito);
$("ciudad_descripcion").addEventListener("change", syncCiudad);
$("btnBuscarActividad").addEventListener("click", openActividadCatalogo);
$("btnCloseActividadCatalogo").addEventListener("click", closeActividadCatalogo);
$("actividadCatalogoBuscar").addEventListener("input", renderActividadCatalogo);
$("actividadCatalogoSeccion").addEventListener("change", renderActividadCatalogo);
$("actividadCatalogoModal").addEventListener("click", (event) => {
    if (event.target === $("actividadCatalogoModal")) {
        closeActividadCatalogo();
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("actividadCatalogoModal").classList.contains("active")) {
        closeActividadCatalogo();
    }
});

toggleFacturacionElectronica();
cargarUbicacionSeleccionada("", "", "");
actualizarEstadoActividades();
renderObligaciones();
cargarSeccionesActividad();
cargarEmpresa();
