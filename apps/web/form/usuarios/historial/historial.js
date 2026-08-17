

const $ = (id) => document.getElementById(id);

function formatearFechaHora(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString("es-PY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function cargarFiltros(data, selectedUsuario = "", selectedModulo = "") {
    const usuarios = [...new Set(data.map(item => item.usuario).filter(Boolean))].sort();
    const modulos = [...new Set(data.map(item => item.modulo).filter(Boolean))].sort();

    $("histUsuario").innerHTML = '<option value="">Todos los usuarios</option>' + usuarios.map(usuario => (
        `<option value="${usuario}">${usuario}</option>`
    )).join("");

    $("histModulo").innerHTML = '<option value="">Todos los modulos</option>' + modulos.map(modulo => (
        `<option value="${modulo}">${modulo}</option>`
    )).join("");

    $("histUsuario").value = selectedUsuario;
    $("histModulo").value = selectedModulo;
}

function renderHistorial() {
    const historial = [];
    const usuario = $("histUsuario").value;
    const fecha = $("histFecha").value;
    const modulo = $("histModulo").value;
    const tbody = $("historialTableBody");

    cargarFiltros(historial, usuario, modulo);

    const filtrado = historial.filter(item => {
        const mismaFecha = !fecha || item.fecha.slice(0, 10) === fecha;
        const mismoUsuario = !usuario || item.usuario === usuario;
        const mismoModulo = !modulo || item.modulo === modulo;
        return mismaFecha && mismoUsuario && mismoModulo;
    });

    $("pageinfo").textContent = `Mostrando ${filtrado.length} de ${historial.length} registros`;
    tbody.innerHTML = "";

    if (filtrado.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <h3>No se encontraron movimientos</h3>
                        <p>Prueba con otros filtros o realiza nuevas operaciones en el sistema.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    filtrado.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Fecha">${formatearFechaHora(item.fecha)}</td>
            <td data-label="Usuario">${item.usuario}</td>
            <td data-label="Modulo">${item.modulo}</td>
            <td data-label="Operacion">${item.accion}</td>
            <td data-label="Detalle">${item.descripcion}</td>
        `;
        tbody.appendChild(row);
    });
}

function init() {
    ["histUsuario", "histFecha", "histModulo"].forEach(id => {
        $(id).addEventListener("change", renderHistorial);
    });

    $("btnLimpiarHistorial").addEventListener("click", () => {
        $("histUsuario").value = "";
        $("histFecha").value = "";
        $("histModulo").value = "";
        renderHistorial();
    });

    renderHistorial();
}

init();
