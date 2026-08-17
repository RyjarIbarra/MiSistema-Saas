import { calcularFilasVisibles, Enter, dataRequiredClear, formatearFecha, textoConElipsis, validarCampos, ICON_EDITAR, ICON_ELIMINAR } from "../../../js/utilidades.js";
import { showSuccessToast, showWarningToast } from "../../../js/toast.js";
import ModalProducto from "../../componente/ModalProducto.js";
import { getByIdAjusteStock, InsertAjusteStock, listAjusteStock, listDeposito } from "../../../js/apiEndpoints.js";
import { getData, postData } from "../../../js/apiService.js";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY_ANTERIOR = "ajusteStockBorradores";

let detalle = [];
let editIndex = null;
let selectedProductoActual = null;
let depositosCache = [];
let modoFormulario = "NUEVO";
let currentPage = 1;
let totalRecords = 0;
const pageInfo = $("ajustePageinfo");
let FILAS_POR_PAGINA = calcularFilasVisibles();
const ROWS_PER_PAGE = FILAS_POR_PAGINA || 6;

const modalProducto = new ModalProducto({
    onSelect: (producto) => aplicarProductoSeleccionado(producto)
});

function hoy() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatCantidad(value) {
    const number = Number(value || 0);
    if (Number.isInteger(number)) {
        return String(number);
    }
    return number.toFixed(2).replace(/\.?0+$/, "");
}

async function cargarDepositos() {
    const response = await postData(listDeposito, {
        texto: "",
        limit: 0,
        offset: 0
    }, "Depósito");

    depositosCache = response.success ? (response.objectsList || []) : [];
    $("depositoAjuste").innerHTML = '<option value="">Seleccionar...</option>' + depositosCache
        .map((item) => `<option value="${item.depid}">${item.depnom}</option>`)
        .join("");
    $("filtroDeposito").innerHTML = '<option value="">Todos los depósitos</option>' + depositosCache
        .map((item) => `<option value="${item.depid}">${item.depnom}</option>`)
        .join("");
}

function getDepositoSeleccionado() {
    const depositoId = $("depositoAjuste").value;
    if (!depositoId) {
        return null;
    }

    return depositosCache.find((item) => String(item.depid) === String(depositoId)) || null;
}

function limpiarProductoSeleccionado({ keepCodigo = false } = {}) {
    selectedProductoActual = null;
    $("producto").value = "";
    $("productoId").value = "";
    $("stockActual").value = "";
    if (!keepCodigo) {
        $("codigo").value = "";
    }
}

function cargarProductos() {
    limpiarProductoSeleccionado();
}

function aplicarProductoSeleccionado(producto) {
    if (!producto) {
        return;
    }

    selectedProductoActual = {
        id: producto.id,
        descripcion: producto.descripcion || "",
        stock: Number(producto.stock || 0),
        stockFormat: producto.stockFormat || ""
    };

    $("producto").value = selectedProductoActual.descripcion;
    $("productoId").value = String(selectedProductoActual.id ?? "");
    $("codigo").value = String(selectedProductoActual.id ?? "");
    $("stockActual").value = formatCantidad(selectedProductoActual.stock);
    $("cantidad").focus();
}

function getProductoSeleccionado() {
    if (!selectedProductoActual) {
        return null;
    }

    if (String(selectedProductoActual.id) !== String($("productoId").value)) {
        return null;
    }

    return selectedProductoActual;
}

function setModoFormulario(modo) {
    modoFormulario = modo;
    const soloLectura = modo === "VER";

    document.querySelector("#ajusteModal .tituloform").textContent = soloLectura
        ? "Detalle de Ajuste de Stock"
        : "Nuevo Ajuste de Stock";

    $("fecha").disabled = soloLectura;
    $("depositoAjuste").disabled = soloLectura;
    $("descripcionAjuste").disabled = soloLectura;
    $("codigo").disabled = soloLectura;
    $("producto").disabled = soloLectura;
    $("tipoMovimiento").disabled = soloLectura;
    $("cantidad").disabled = soloLectura;
    $("btnAgregarItem").style.display = soloLectura ? "none" : "";
    $("btnGuardarAjuste").style.display = soloLectura ? "none" : "";
    $("btnCancelarAjuste").textContent = soloLectura ? "Cerrar" : "Cancelar";
}

function getFiltroListado(pageNumber = 1) {
    const filtroFecha = $("filtroFecha")?.value || "";
    const depositoId = $("filtroDeposito")?.value || "";

    return {
        texto: "",
        fecha: filtroFecha || null,
        depositoId: depositoId ? Number(depositoId) : null,
        limit: ROWS_PER_PAGE,
        offset: (pageNumber - 1) * ROWS_PER_PAGE
    };
}

async function cargarAjustes(pageNumber = 1) {
    const response = await postData(listAjusteStock, getFiltroListado(pageNumber), "Ajuste de stock");
    totalRecords = Number(response.totalRecords || 0);
    return response.objectsList || [];
}

function renderPaginationControls(totalPages) {
    const pagesContainer = $("ajustePaginationPages");
    if (!pagesContainer) {
        return;
    }

    pagesContainer.innerHTML = "";

    const items = [];
    const safeTotal = Math.max(1, totalPages);

    if (safeTotal <= 4) {
        for (let page = 1; page <= safeTotal; page += 1) {
            items.push(page);
        }
    } else if (currentPage <= 2) {
        items.push(1, 2, 3, "ellipsis", safeTotal);
    } else if (currentPage >= safeTotal - 1) {
        items.push(1, "ellipsis", safeTotal - 2, safeTotal - 1, safeTotal);
    } else {
        items.push(currentPage - 1, currentPage, currentPage + 1, "ellipsis", safeTotal);
    }

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
        if (Number(item) === currentPage) {
            button.classList.add("active", "no-cursor");
        } else {
            button.addEventListener("click", async () => {
                await renderPage(Number(item));
            });
        }

        pagesContainer.appendChild(button);
    });

    $("ajusteBtnpagPrimero").disabled = currentPage <= 1;
    $("ajusteBtnpagAnterior").disabled = currentPage <= 1;
    $("ajusteBtnpagSiguiente").disabled = currentPage >= safeTotal;
    $("ajusteBtnpagUltimo").disabled = currentPage >= safeTotal;
}

function renderListaAjustes(data) {
    const body = $("tablaAjustes");
    const ajustes = Array.isArray(data) ? data : [];

    body.innerHTML = "";

    if (!ajustes.length) {
        body.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="ajuste-empty">
                        <div>
                            <i class="fa-solid fa-boxes-stacked"></i>
                            <p>Aún no hay ajustes de stock registrados</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    ajustes.forEach((ajuste, index) => {
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="ID">${ajuste.ajstid ?? ""}</td>
            <td data-label="Fecha">${ajuste.fecha ? formatearFecha(ajuste.fecha) : ""}</td>
            <td data-label="Descripción">${textoConElipsis(ajuste.descripcion || "", 45)}</td>
            <td data-label="Depósito">${ajuste.deposito || ""}</td>
            <td data-label="Productos" class="text-right">${Number(ajuste.cantidadProductos || 0)}</td>
            <td data-label="Total mov." class="text-right">${formatCantidad(ajuste.totalMovimiento)}</td>
            <td data-label="Resumen">${Number(ajuste.salidas ?? ajuste.descuentos ?? 0)} sal. / ${Number(ajuste.entradas ?? ajuste.aumentos ?? 0)} ent.</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="verAjuste" data-id="${ajuste.ajstid}" title="Ver">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
            </td>
        `;
        body.appendChild(fila);
    });

    document.querySelectorAll('[tipo-btn="verAjuste"]').forEach((button) => {
        button.addEventListener("click", () => verAjuste(Number(button.dataset.id)));
    });
}

async function renderPage(pageNumber) {
    const totalPagesPrevios = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE) || 1);
    const safePage = Math.min(Math.max(pageNumber, 1), totalPagesPrevios);
    let pageData = await cargarAjustes(safePage);
    let totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE) || 1);
    let paginaFinal = Math.min(safePage, totalPages);

    if (paginaFinal !== safePage) {
        pageData = await cargarAjustes(paginaFinal);
        totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE) || 1);
    }

    currentPage = paginaFinal;
    pageInfo.textContent = `Total registros ${totalRecords}`;
    renderPaginationControls(totalPages);
    renderListaAjustes(pageData);
}

async function firstPage() {
    await renderPage(1);
}

async function previousPage() {
    if (currentPage > 1) {
        await renderPage(currentPage - 1);
    }
}

async function nextPage() {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    if (currentPage < totalPages) {
        await renderPage(currentPage + 1);
    }
}

async function lastPage() {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    await renderPage(totalPages);
}

function actualizarResumen() {
    return detalle;
}

function renderDetalle() {
    const body = $("detalleBody");
    body.innerHTML = "";

    if (!detalle.length) {
        body.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="ajuste-empty" style="min-height: 200px;">
                        <div>
                            <i class="fa-solid fa-layer-group"></i>
                            <p>Agrega productos para armar el detalle del ajuste</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        actualizarResumen();
        return;
    }

    detalle.forEach((item, index) => {
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Producto">${item.descripcion}</td>
            <td data-label="Tipo">
                <span class="badge-movimiento ${item.tipoMovimiento === "ENTRADA" ? "aumento" : "descuento"}">
                    ${item.tipoMovimiento === "ENTRADA" ? "ENTRADA" : "SALIDA"}
                </span>
            </td>
            <td data-label="Stock actual" class="text-right">${formatCantidad(item.stockActual)}</td>
            <td data-label="Cantidad" class="text-right">${formatCantidad(item.cantidad)}</td>
            <td data-label="Stock resultante" class="text-right">${formatCantidad(item.stockResultante)}</td>
            <td data-label="Acciones">${modoFormulario === "VER" ? "" : `
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarItem" data-index="${index}" title="Editar">
                        ${ICON_EDITAR}
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarItem" data-index="${index}" title="Eliminar">
                        ${ICON_ELIMINAR}
                    </button>
                </div>
            `}</td>
        `;
        body.appendChild(fila);
    });

    if (modoFormulario === "VER") {
        return;
    }

    document.querySelectorAll('[tipo-btn="editarItem"]').forEach((button) => {
        button.addEventListener("click", () => editarItem(Number(button.dataset.index)));
    });

    document.querySelectorAll('[tipo-btn="eliminarItem"]').forEach((button) => {
        button.addEventListener("click", () => eliminarItem(Number(button.dataset.index)));
    });

    actualizarResumen();
}

function openModal() {
    $("ajusteModal").classList.add("active");
    setTimeout(() => $("descripcionAjuste").focus(), 120);
}

function closeModal() {
    $("ajusteModal").classList.remove("active");
}

function openProductoBusquedaModal(query = "") {
    const deposito = getDepositoSeleccionado();
    if (!deposito) {
        showWarningToast("Depósito requerido", "Selecciona un depósito antes de buscar productos.", 2500);
        $("depositoAjuste").focus();
        return;
    }

    modalProducto.abrir({
        query,
        idDeposito: Number(deposito.depid),
        onSelect: (producto) => aplicarProductoSeleccionado(producto)
    });
}

function limpiarDetalleForm() {
    $("detalleForm").reset();
    editIndex = null;
    limpiarProductoSeleccionado();
    $("tipoMovimiento").value = "ENTRADA";
    $("btnAgregarItem").innerHTML = '<i class="fa-solid fa-plus"></i> Agregar';
    dataRequiredClear();
}

function limpiarAjuste() {
    setModoFormulario("NUEVO");
    $("ajusteForm").reset();
    $("fecha").value = hoy();
    $("depositoAjuste").value = "";
    detalle = [];
    editIndex = null;
    limpiarDetalleForm();
    renderDetalle();
    dataRequiredClear();
}

function cargarDetalleAjuste(data) {
    $("fecha").value = data.fecha || "";
    $("depositoAjuste").value = data.depositoId ? String(data.depositoId) : "";
    $("descripcionAjuste").value = data.motivo || "";

    detalle = (data.detalle || []).map((item) => ({
        detalleId: item.detalleId,
        productoId: item.productoId,
        codigo: item.codigo || String(item.productoId ?? ""),
        descripcion: item.producto || "",
        tipoMovimiento: item.tipoMovimiento,
        stockActual: Number(item.stockActual || 0),
        cantidad: Number(item.cantidad || 0),
        stockResultante: Number(item.stockResultante || 0)
    }));

    editIndex = null;
    limpiarProductoSeleccionado();
    renderDetalle();
}

async function verAjuste(id) {
    try {
        const response = await getData(`${getByIdAjusteStock}?id=${id}`, "Ajuste de stock");
        setModoFormulario("VER");
        cargarDetalleAjuste(response.data || {});
        $("ajusteModal").classList.add("active");
    } catch (error) {
        console.error("Error obteniendo ajuste:", error);
    }
}

function validarCantidad(producto, cantidad, tipoMovimiento) {
    if (!producto) {
        showWarningToast("Producto requerido", "Selecciona un producto para continuar.", 2500);
        return false;
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        showWarningToast("Cantidad inválida", "Ingresa una cantidad mayor a cero.", 2500);
        return false;
    }

    if (tipoMovimiento === "SALIDA" && cantidad > producto.stock) {
        showWarningToast("Stock insuficiente", "La cantidad a descontar no puede superar el stock actual.", 3000);
        return false;
    }

    return true;
}

function agregarItem() {
    if (!validarCampos($("detalleForm"))) {
        return;
    }

    const producto = getProductoSeleccionado();
    const cantidad = Number($("cantidad").value);
    const tipoMovimiento = $("tipoMovimiento").value;

    if (!validarCantidad(producto, cantidad, tipoMovimiento)) {
        return;
    }

    const duplicateIndex = detalle.findIndex((item, index) => item.productoId === producto.id && index !== editIndex);
    if (duplicateIndex >= 0) {
        showWarningToast("Producto repetido", "Ese producto ya fue agregado al detalle.", 2500);
        return;
    }

    const stockResultante = tipoMovimiento === "ENTRADA"
        ? producto.stock + cantidad
        : producto.stock - cantidad;

    const item = {
        productoId: producto.id,
        codigo: String(producto.id ?? ""),
        descripcion: producto.descripcion,
        tipoMovimiento,
        stockActual: producto.stock,
        cantidad,
        stockResultante
    };

    if (editIndex !== null) detalle[editIndex] = item;
    else detalle.push(item);

    renderDetalle();
    limpiarDetalleForm();
    $("producto").focus();
}

function editarItem(index) {
    const item = detalle[index];
    if (!item) return;

    editIndex = index;
    selectedProductoActual = {
        id: item.productoId,
        descripcion: item.descripcion,
        stock: Number(item.stockActual || 0)
    };
    $("producto").value = item.descripcion;
    $("productoId").value = String(item.productoId);
    $("codigo").value = String(item.productoId ?? "");
    $("tipoMovimiento").value = item.tipoMovimiento;
    $("stockActual").value = formatCantidad(item.stockActual);
    $("cantidad").value = item.cantidad;
    $("btnAgregarItem").innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Modificar';
    $("cantidad").focus();
}

function eliminarItem(index) {
    detalle.splice(index, 1);
    renderDetalle();
    limpiarDetalleForm();
}

async function guardarAjuste() {
    if (!validarCampos($("ajusteForm"))) {
        showWarningToast("Campos incompletos", "Completa la fecha y la descripción del ajuste.", 2500);
        return;
    }

    if (!detalle.length) {
        showWarningToast("Sin detalle", "Agrega al menos un producto al ajuste de stock.", 2500);
        return;
    }

    const deposito = getDepositoSeleccionado();
    if (!deposito) {
        showWarningToast("Depósito requerido", "Selecciona un depósito para guardar el ajuste.", 2500);
        return;
    }

    const payload = {
        fecha: $("fecha").value,
        depositoId: deposito.depid,
        motivo: $("descripcionAjuste").value.trim(),
        detalle: detalle.map((item) => ({
            productoId: item.productoId,
            tipoMovimiento: item.tipoMovimiento,
            cantidad: Number(item.cantidad),
            stockActual: Number(item.stockActual || 0),
            stockResultante: Number(item.stockResultante || 0)
        }))
    };

    try {
        await postData(InsertAjusteStock, payload, "Ajuste de stock");
        await renderPage(1);
        closeModal();
        limpiarAjuste();
        showSuccessToast("Ajuste guardado", "El ajuste se registró correctamente.", 2500);
    } catch (error) {
        console.error("Error guardando ajuste:", error);
    }
}

function handleCodigoInput() {
    if (!selectedProductoActual) {
        return;
    }

    if ($("codigo").value.trim() !== String(selectedProductoActual.id ?? "").trim()) {
        limpiarProductoSeleccionado({ keepCodigo: true });
    }
}

function handleCodigoEnter(event) {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    openProductoBusquedaModal($("codigo").value.trim());
}

function handleDepositoChange() {
    limpiarProductoSeleccionado();
    if (detalle.length > 0) {
        detalle = [];
        renderDetalle();
    }
}

async function init() {
    localStorage.removeItem(STORAGE_KEY_ANTERIOR);
    setModoFormulario("NUEVO");
    $("fecha").value = hoy();
    await cargarDepositos();
    try {
        await renderPage(1);
    } catch (error) {
        console.error("Error cargando ajustes:", error);
        totalRecords = 0;
        pageInfo.textContent = "Total registros 0";
        renderPaginationControls(1);
        renderListaAjustes([]);
    }
    cargarProductos();
    Enter();
    renderDetalle();

    $("filtroFecha").addEventListener("change", async () => await renderPage(1));
    $("filtroDeposito").addEventListener("change", async () => await renderPage(1));
    $("depositoAjuste").addEventListener("change", handleDepositoChange);
    $("codigo").addEventListener("input", handleCodigoInput);
    $("codigo").addEventListener("keydown", handleCodigoEnter, true);
    $("producto").addEventListener("click", () => openProductoBusquedaModal($("producto").value.trim() || $("codigo").value.trim()));
    $("btnAgregarItem").addEventListener("click", agregarItem);
    $("ajusteBtnpagPrimero").addEventListener("click", async () => await firstPage());
    $("ajusteBtnpagAnterior").addEventListener("click", async () => await previousPage());
    $("ajusteBtnpagSiguiente").addEventListener("click", async () => await nextPage());
    $("ajusteBtnpagUltimo").addEventListener("click", async () => await lastPage());
    $("btnNuevoAjuste").addEventListener("click", () => {
        limpiarAjuste();
        openModal();
    });
    $("btnGuardarAjuste").addEventListener("click", guardarAjuste);
    $("btnCancelarAjuste").addEventListener("click", () => {
        closeModal();
        limpiarAjuste();
    });
    $("btnCloseAjusteModal").addEventListener("click", () => {
        closeModal();
        limpiarAjuste();
    });
    $("ajusteModal").addEventListener("click", (event) => {
        if (event.target === $("ajusteModal")) {
            closeModal();
            limpiarAjuste();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (modalProducto.estaAbierto()) {
            return;
        }

        if (event.key === "Escape" && $("ajusteModal").classList.contains("active")) {
            closeModal();
            limpiarAjuste();
        }
    });
}

init();
