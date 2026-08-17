import {
    listDeposito,
    reporteProductoDetallePdf,
    reporteProductoGeneralPdf,
    reporteProductoPreciosPdf,
    reporteProductoStockPdf
} from "../../../js/apiEndpoints.js";
import { postBinaryData, postData } from "../../../js/apiService.js";
import { cleanupLoader, hideLoader, showLoader } from "../../../js/loader.js";
import { showWarningToast } from "../../../js/toast.js";

const $ = (id) => document.getElementById(id);
const REPORTES_PRODUCTOS = {
    productos_listado: {
        titulo: "Listado de Productos",
        ayuda: "Filtra por descripción y estado para preparar el listado general de productos.",
        empty: "Presiona Generar para visualizar el reporte seleccionado.",
        endpoint: reporteProductoGeneralPdf,
        filename: "producto_general.pdf",
        filtros: {
            descripcion: true,
            estado: true,
            deposito: false,
            soloConStock: false
        }
    },
    productos_detallado: {
        titulo: "Listado Detallado",
        ayuda: "Genera una vista completa con tipo, unidad, familia, IVA y control de stock.",
        empty: "Presiona Generar para visualizar el reporte detallado seleccionado.",
        endpoint: reporteProductoDetallePdf,
        filename: "producto_detalle.pdf",
        filtros: {
            descripcion: true,
            estado: true,
            deposito: false,
            soloConStock: false
        }
    },
    stock_general: {
        titulo: "Stock General",
        ayuda: "Selecciona depósito y si deseas ver únicamente productos con stock disponible.",
        empty: "Presiona Generar para visualizar el reporte de stock seleccionado.",
        endpoint: reporteProductoStockPdf,
        filename: "producto_stock.pdf",
        filtros: {
            descripcion: true,
            estado: true,
            deposito: true,
            soloConStock: true
        }
    },
    lista_precios: {
        titulo: "Lista de Precios",
        ayuda: "Genera la vista de productos con sus precios activos cargados.",
        empty: "Presiona Generar para visualizar la lista de precios seleccionada.",
        endpoint: reporteProductoPreciosPdf,
        filename: "producto_precios.pdf",
        filtros: {
            descripcion: true,
            estado: true,
            deposito: false,
            soloConStock: false
        }
    }
};

let reporteSeleccionadoActual = null;
let reporteProductosUrlActual = null;

cleanupLoader();

function limpiarUrlReporteProductos() {
    if (reporteProductosUrlActual) {
        URL.revokeObjectURL(reporteProductosUrlActual);
        reporteProductosUrlActual = null;
    }
}

function limpiarVistaPrevia() {
    $("visorReporteProductos").src = "";
    $("productoReporteEmpty").style.display = "";
    limpiarUrlReporteProductos();
}

function limpiarFiltrosReporte() {
    $("filtroDescripcionProducto").value = "";
    $("filtroEstadoProducto").value = "";
    $("filtroDepositoProducto").value = "";
    $("filtroSoloConStockProducto").checked = false;
    limpiarVistaPrevia();
}

function toggleFiltro(id, visible) {
    $(id).classList.toggle("d-none", !visible);
}

function aplicarConfiguracionFiltros(config) {
    toggleFiltro("filtroDescripcionWrap", config.descripcion);
    toggleFiltro("filtroEstadoWrap", config.estado);
    toggleFiltro("filtroDepositoWrap", config.deposito);
    toggleFiltro("filtroSoloConStockWrap", config.soloConStock);
}

function mostrarCatalogoReportes() {
    $("reportesCatalogoProducto").classList.remove("d-none");
    $("reportesDetalleProducto").classList.add("d-none");
    reporteSeleccionadoActual = null;
    limpiarFiltrosReporte();
}

function mostrarDetalleReporte(reporteId) {
    const reporte = REPORTES_PRODUCTOS[reporteId];
    if (!reporte) {
        return;
    }

    reporteSeleccionadoActual = reporteId;
    $("reportesDetalleProductoTitulo").textContent = reporte.titulo;
    $("reportesProductoAyudaTexto").textContent = reporte.ayuda;
    $("reportesProductoEmptyTexto").textContent = reporte.empty;
    aplicarConfiguracionFiltros(reporte.filtros);
    $("reportesCatalogoProducto").classList.add("d-none");
    $("reportesDetalleProducto").classList.remove("d-none");
    limpiarFiltrosReporte();
}

async function cargarDepositosReporte() {
    try {
        const response = await postData(listDeposito, {
            texto: "",
            limit: 0,
            offset: 0
        }, "Depósito");

        const options = response.success ? (response.objectsList || []) : [];
        $("filtroDepositoProducto").innerHTML = '<option value="">Todos los depósitos</option>' + options
            .map((item) => `<option value="${item.depid}">${item.depnom}</option>`)
            .join("");
    } catch (error) {
        console.error("Error cargando depósitos para reportes de productos:", error);
        $("filtroDepositoProducto").innerHTML = '<option value="">Todos los depósitos</option>';
    }
}

function obtenerPayloadReporte() {
    return {
        texto: $("filtroDescripcionProducto").value.trim() || null,
        activo: $("filtroEstadoProducto").value === "" ? null : $("filtroEstadoProducto").value === "true",
        idDeposito: $("filtroDepositoProducto").value ? Number($("filtroDepositoProducto").value) : null,
        soloConStock: $("filtroSoloConStockProducto").checked ? true : null
    };
}

async function generarReporteProductos() {
    if (!reporteSeleccionadoActual) {
        showWarningToast("Selecciona un reporte", "Primero debes elegir el reporte de productos que deseas visualizar.", 2500);
        return;
    }

    const configuracion = REPORTES_PRODUCTOS[reporteSeleccionadoActual];
    if (!configuracion?.endpoint) {
        showWarningToast("Reporte pendiente", "Ese reporte todavía no tiene endpoint configurado.", 2500);
        return;
    }

    try {
        showLoader();
        const { blob } = await postBinaryData(
            configuracion.endpoint,
            obtenerPayloadReporte(),
            configuracion.filename,
            "Reporte de productos"
        );

        limpiarUrlReporteProductos();
        reporteProductosUrlActual = URL.createObjectURL(blob);
        $("visorReporteProductos").src = reporteProductosUrlActual;
        $("productoReporteEmpty").style.display = "none";
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }
}

function descargarExcelProductos() {
    if (!reporteSeleccionadoActual) {
        showWarningToast("Selecciona un reporte", "Primero debes elegir el reporte que deseas exportar.", 2500);
        return;
    }

    showWarningToast(
        "Excel pendiente",
        "El PDF ya está conectado. El botón de Excel queda preparado hasta que exista su endpoint en el backend.",
        3200
    );
}

async function init() {
    await cargarDepositosReporte();

    document.querySelectorAll("[data-reporte-producto]").forEach((button) => {
        button.addEventListener("click", () => {
            mostrarDetalleReporte(button.dataset.reporteProducto);
        });
    });

    $("btnVolverReportesProductos").addEventListener("click", mostrarCatalogoReportes);
    $("btnLimpiarReporteProductos").addEventListener("click", limpiarFiltrosReporte);
    $("btnDescargarExcelProductos").addEventListener("click", descargarExcelProductos);
    $("btnGenerarReporteProductos").addEventListener("click", () => {
        void generarReporteProductos();
    });

    window.addEventListener("beforeunload", limpiarUrlReporteProductos);
    mostrarCatalogoReportes();
}

void init();
