import { reporteClientePdf } from "../../../js/apiEndpoints.js";
import { postBinaryData } from "../../../js/apiService.js";
import { cleanupLoader, hideLoader, showLoader } from "../../../js/loader.js";
import { showWarningToast } from "../../../js/toast.js";

const $ = (id) => document.getElementById(id);
const REPORTES_CLIENTES = {
    clientes_pdf: {
        titulo: "Listado de Reporte",
        ayuda: "Si dejas las fechas vacías, el reporte incluirá todos los clientes.",
        empty: "Presiona Generar para visualizar el PDF del reporte seleccionado."
    },
    estado_cuenta: {
        titulo: "Estado de Cuenta",
        ayuda: "Por ahora esta vista utiliza la misma base visual mientras se implementa el endpoint específico.",
        empty: "Selecciona los filtros y presiona Generar para mostrar la vista previa cuando el reporte esté disponible."
    }
};

let reporteClientesUrlActual = null;
let reporteSeleccionadoActual = null;

cleanupLoader();

function limpiarUrlReporteClientes() {
    if (reporteClientesUrlActual) {
        URL.revokeObjectURL(reporteClientesUrlActual);
        reporteClientesUrlActual = null;
    }
}

function buildReporteClientesPayload() {
    return {
        fechaDesde: $("reporteFechaDesde").value || null,
        fechaHasta: $("reporteFechaHasta").value || null
    };
}

function limpiarReporteClientes() {
    $("reporteFechaDesde").value = "";
    $("reporteFechaHasta").value = "";
    $("visorReporteClientes").src = "";
    $("clienteReporteEmpty").style.display = "";
    limpiarUrlReporteClientes();
}

function mostrarCatalogoReportes() {
    $("reportesCatalogo").classList.remove("d-none");
    $("reportesDetalle").classList.add("d-none");
    reporteSeleccionadoActual = null;
    limpiarReporteClientes();
}

function mostrarDetalleReporte(reporteId) {
    const reporte = REPORTES_CLIENTES[reporteId];
    if (!reporte) {
        return;
    }

    reporteSeleccionadoActual = reporteId;
    $("reportesDetalleTitulo").textContent = reporte.titulo;
    $("reportesAyudaTexto").textContent = reporte.ayuda;
    $("reportesEmptyTexto").textContent = reporte.empty;
    $("reportesCatalogo").classList.add("d-none");
    $("reportesDetalle").classList.remove("d-none");
    limpiarReporteClientes();
}

async function generarReporteClientes() {
    if (!reporteSeleccionadoActual) {
        showWarningToast("Selecciona un reporte", "Primero debes elegir el tipo de reporte que deseas visualizar.", 2500);
        return;
    }

    if (reporteSeleccionadoActual !== "clientes_pdf") {
        showWarningToast("Reporte pendiente", "Ese reporte aún no tiene endpoint disponible. Dejé la vista preparada para conectarlo después.", 3000);
        return;
    }

    const fechaDesde = $("reporteFechaDesde").value;
    const fechaHasta = $("reporteFechaHasta").value;

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        showWarningToast("Rango inválido", "La fecha desde no puede ser mayor que la fecha hasta.", 2500);
        $("reporteFechaHasta").focus();
        return;
    }

    try {
        showLoader();

        const { blob } = await postBinaryData(
            reporteClientePdf,
            buildReporteClientesPayload(),
            "reporte_clientes.pdf",
            "Reporte de clientes"
        );

        limpiarUrlReporteClientes();
        reporteClientesUrlActual = URL.createObjectURL(blob);
        $("visorReporteClientes").src = reporteClientesUrlActual;
        $("clienteReporteEmpty").style.display = "none";
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }
}

function init() {
    document.querySelectorAll("[data-reporte]").forEach((button) => {
        button.addEventListener("click", () => {
            mostrarDetalleReporte(button.dataset.reporte);
        });
    });

    $("btnVolverReportesClientes").addEventListener("click", mostrarCatalogoReportes);
    $("btnLimpiarReporteClientes").addEventListener("click", limpiarReporteClientes);
    $("btnDescargarExcelClientes").addEventListener("click", () => {
        showWarningToast("Excel pendiente", "El botón ya quedó preparado, pero todavía falta conectar el endpoint de Excel para este reporte.", 3000);
    });
    $("btnGenerarReporteClientes").addEventListener("click", () => {
        void generarReporteClientes();
    });

    window.addEventListener("beforeunload", limpiarUrlReporteClientes);
}

limpiarReporteClientes();
mostrarCatalogoReportes();
init();
