import { Enter, ICON_EDITAR, ICON_ELIMINAR, dataRequiredClear, formatearImportes, importeFormato, validarCampos } from "../../../js/utilidades.js";
import { showSuccessToast, showWarningToast } from "../../../js/toast.js";
import { InsertDocumento, listClientes, listSucursal, listTimbrado, precioVentaProducto } from "../../../js/apiEndpoints.js";
import { postData, SearchRuc } from "../../../js/apiService.js";
import ModalCliente from "../../componente/ModalCliente.js";
import ModalProducto from "../../componente/ModalProducto.js";

const $ = (id) => document.getElementById(id);
let detalle = [];
let editIndex = null;
let selectedProductoActual = null;
let selectedClienteActual = null;
let precioRequestSequence = 0;
let ventaPendienteCobro = null;
let sucursalesVenta = [];
let timbradosVenta = [];
let timbradoSeleccionado = null;

const modalCliente = new ModalCliente({
    onSelect: (cliente) => aplicarClienteSeleccionado(cliente)
});

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

function monedaActual() {
    return $("moneda").value || "PYG";
}

function totalActualVenta() {
    return calcularTotales().total;
}

function redondear2(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function normalizarFechaSinHora(value) {
    const fecha = new Date(value);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
}

function obtenerSucursalSeleccionada() {
    return sucursalesVenta.find((item) => String(item.sucest) === String($("sucursalId").value)) || null;
}

function timbradoDisponible(item, tipoDocumento, sucursal) {
    if (!item || !sucursal) {
        return false;
    }

    const coincideTipo = String(item.timtipdoc || "") === String(tipoDocumento || "");
    const coincideSucursal = String(item.timestab || "") === String(sucursal.sucest || "");
    const activo = item.timactivo !== false;

    if (!coincideTipo || !coincideSucursal || !activo) {
        return false;
    }

    if (!item.timfecvto) {
        return true;
    }

    return normalizarFechaSinHora(item.timfecvto) >= normalizarFechaSinHora(new Date());
}

function actualizarTimbradoSeleccionado() {
    const sucursal = obtenerSucursalSeleccionada();
    const tipoDocumento = $("comprobanteId").value;

    timbradoSeleccionado = timbradosVenta.find((item) => timbradoDisponible(item, tipoDocumento, sucursal)) || null;
    $("nroTimbrado").value = timbradoSeleccionado?.timnumero || "";
}

function limpiarClienteSeleccionado({ keepRuc = false } = {}) {
    selectedClienteActual = null;
    if (!keepRuc) {
        $("clienteRuc").value = "";
    }
    $("clienteNombre").value = "";

    if (selectedProductoActual?.id) {
        void actualizarPrecioProductoSeleccionado();
    }
}

function aplicarClienteSeleccionado(cliente) {
    if (!cliente) {
        return;
    }

    selectedClienteActual = {
        id: cliente.id,
        ruc: cliente.ruc || "",
        nombre: cliente.nombre || "",
        tipoPrecio: Number(cliente.tipoPrecio || 0) || null,
        raw: cliente.raw || null
    };

    $("clienteRuc").value = selectedClienteActual.ruc === "0" ? "" : selectedClienteActual.ruc;
    $("clienteNombre").value = selectedClienteActual.nombre;

    if (selectedProductoActual?.id) {
        void actualizarPrecioProductoSeleccionado();
    }
}

function normalizarRucTexto(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function mapClienteVenta(item) {
    return {
        id: item.cliid,
        ruc: item.cliruc || "",
        nombre: item.clinom || "",
        tipoPrecio: item.tipoprecio ?? null,
        raw: item
    };
}

async function buscarClientePorRuc() {
    const valorRuc = $("clienteRuc").value.trim();
    const digitosRuc = normalizarRucTexto(valorRuc);

    if (digitosRuc.length <= 3) {
        return false;
    }

    try {
        const cliente = await SearchRuc(valorRuc);
        const clienteRuc = cliente?.data?.[0];
        if (clienteRuc) {
            $("clienteRuc").value = `${clienteRuc.ruc}-${clienteRuc.dv}`;
            if (!selectedClienteActual?.id) {
                $("clienteNombre").value = clienteRuc.nombre || "";
            }
        }
    } catch (error) {
        console.error("Error consultando RUC:", error);
    }

    try {
        const response = await postData(listClientes, {
            texto: valorRuc,
            limit: 20,
            offset: 0
        }, "Cliente");

        if (!response.success) {
            return false;
        }

        const coincidencia = (response.objectsList || []).find((item) => (
            normalizarRucTexto(item.cliruc) === normalizarRucTexto($("clienteRuc").value)
        ));

        if (coincidencia) {
            aplicarClienteSeleccionado(mapClienteVenta(coincidencia));
            return true;
        }
    } catch (error) {
        console.error("Error buscando cliente por RUC:", error);
    }

    return false;
}

async function buscarClientePorRucYContinuar() {
    const valorRuc = $("clienteRuc").value.trim();
    const digitosRuc = normalizarRucTexto(valorRuc);

    if (digitosRuc.length <= 3) {
        $("clienteRuc").focus();
        $("clienteRuc").select();
        return;
    }

    await buscarClientePorRuc();
    $("condicion").focus();
}

function openClienteBusquedaModal() {
    modalCliente.abrir({
        query: "",
        onSelect: (cliente) => aplicarClienteSeleccionado(cliente)
    });
}

function handleClienteRucInput() {
    if (!selectedClienteActual) {
        return;
    }

    const rucActual = $("clienteRuc").value.trim();
    const rucSeleccionado = String(selectedClienteActual.ruc || "").trim();
    if (rucActual !== rucSeleccionado) {
        limpiarClienteSeleccionado({ keepRuc: true });
    }
}

function handleClienteRucEnter(event) {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    void buscarClientePorRucYContinuar();
}

function limpiarProductoSeleccionado({ keepCodigo = false } = {}) {
    selectedProductoActual = null;
    if (!keepCodigo) {
        $("codigo").value = "";
    }
    $("producto").value = "";
    $("precio").innerHTML = '<option value="">Seleccionar...</option>';
    habilitarPrecio(true);
}

async function aplicarProductoSeleccionado(producto) {
    if (!producto) {
        return;
    }

    selectedProductoActual = {
        id: producto.id,
        descripcion: producto.descripcion || "",
        gtin: producto.gtin || "",
        precio: null,
        precioOpciones: [],
        iva: 10
    };

    $("codigo").value = String(selectedProductoActual.id ?? "");
    $("producto").value = selectedProductoActual.descripcion;
    await actualizarPrecioProductoSeleccionado();
    $("cantidad").focus();
}

function openProductoBusquedaModal() {
    modalProducto.abrir({
        query: "",
        idDeposito: 1,
        onSelect: (producto) => aplicarProductoSeleccionado(producto)
    });
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
    openProductoBusquedaModal();
}

function handleDetalleEnter(event) {
    if (event.key !== "Enter") {
        return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    if (target.id !== "btnAgregarItem") {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    agregarItem();
}

function getTipoPrecioVenta() {
    const tipoPrecio = Number(selectedClienteActual?.tipoPrecio ?? 0);
    return Number.isFinite(tipoPrecio) && tipoPrecio > 0 ? tipoPrecio : 0;
}

function habilitarPrecio(habilitado) {
    $("precio").disabled = !habilitado;
    $("btnAgregarItem").disabled = !habilitado;
}

function construirTextoPrecio(item) {
    return importeFormato(Number(item.precio || 0), item.moneda || monedaActual());
}

function aplicarPrecioSeleccionado(indexSeleccionado = 0) {
    if (!selectedProductoActual) {
        return;
    }

    const opciones = selectedProductoActual.precioOpciones || [];
    const precioSeleccionado = opciones[indexSeleccionado];

    if (!precioSeleccionado) {
        selectedProductoActual.precio = null;
        selectedProductoActual.iva = 0;
        $("precio").value = "";
        return;
    }

    selectedProductoActual.precio = Number(precioSeleccionado.precio || 0);
    selectedProductoActual.iva = Number(precioSeleccionado.iva || 0);
    $("precio").value = String(indexSeleccionado);
}

function renderPrecioOptions(items = []) {
    const selectPrecio = $("precio");

    if (!items.length) {
        selectPrecio.innerHTML = '<option value="">Seleccionar...</option>';
        return;
    }

    selectPrecio.innerHTML = items.map((item, index) => `
        <option value="${index}">${construirTextoPrecio(item)}</option>
    `).join("");

    aplicarPrecioSeleccionado(0);
}

async function cargarTimbradosVenta() {
    const response = await postData(listTimbrado, {
        texto: "",
        limit: 0,
        offset: 0
    }, "Timbrado");

    timbradosVenta = response.success ? (response.objectsList || []) : [];
    actualizarTimbradoSeleccionado();
}

async function actualizarPrecioProductoSeleccionado() {
    if (!selectedProductoActual?.id) {
        return;
    }

    const requestId = ++precioRequestSequence;
    const moneda = monedaActual();
    const tipoPrecio = getTipoPrecioVenta();

    // Evita que el usuario agregue la línea mientras el precio depende de la respuesta del back.
    habilitarPrecio(false);
    $("precio").innerHTML = '<option value="">Consultando precios...</option>';

    try {
        const response = await postData(precioVentaProducto, {
            productoId: Number(selectedProductoActual.id),
            tipoPrecio,
            moneda
        }, "Precio de venta");

        if (requestId !== precioRequestSequence) {
            return;
        }

        const precioProducto = response.objectsList?.[0];
        const precios = response.objectsList || [];
        if (!precioProducto || !precios.length) {
            throw new Error("No se recibió precio para el producto seleccionado.");
        }

        selectedProductoActual.precioOpciones = precios.map((item) => ({
            tipoPrecio: Number(item.tipoPrecio || 0),
            moneda: item.moneda || moneda,
            precio: Number(item.precio || 0),
            iva: Number(item.iva || 0)
        }));
        renderPrecioOptions(selectedProductoActual.precioOpciones);
    } catch (error) {
        if (requestId !== precioRequestSequence) {
            return;
        }

        selectedProductoActual.precio = null;
        selectedProductoActual.precioOpciones = [];
        $("precio").innerHTML = '<option value="">Sin precio disponible</option>';
        console.error("Error consultando precio de venta:", error);
    } finally {
        if (requestId !== precioRequestSequence) {
            return;
        }

        habilitarPrecio(true);
    }
}

function calcularItem(item) {
    const subtotal = item.cantidad * item.precio;
    const iva = item.iva === 10 ? subtotal / 11 : item.iva === 5 ? subtotal / 21 : 0;

    return {
        subtotal,
        iva
    };
}

function construirDetalleDocumento() {
    return detalle.map((item, index) => {
        const subtotal = redondear2(Number(item.cantidad || 0) * Number(item.precio || 0));
        const tasaIva = Number(item.iva || 0);
        let dodafectiva = 3;
        let dodpropiva = 0;
        let dodbaseimp = 0;
        let dodmontoiva = 0;

        if (tasaIva === 5 || tasaIva === 10) {
            dodafectiva = 1;
            dodpropiva = 100;
            dodbaseimp = redondear2(subtotal / (1 + (tasaIva / 100)));
            dodmontoiva = redondear2(subtotal - dodbaseimp);
        }

        return {
            dodid: 0,
            doddocid: 0,
            dodorden: index + 1,
            dodproid: Number(item.productoId || 0),
            dodcodigo: item.gtin || item.codigo || String(item.productoId || ""),
            doddescri: item.descripcion || "",
            dodunimed: null,
            dodcantidad: Number(item.cantidad || 0),
            dodpreuni: Number(item.precio || 0),
            doddescuni: 0,
            dodafectiva,
            dodtasaiva: tasaIva,
            dodpropiva,
            dodbaseimp,
            dodmontoiva,
            dodsubtotal: subtotal,
            dodlote: null,
            dodfecvto: null
        };
    });
}

function construirCabeceraTotales(detalleDocumento) {
    const totales = detalleDocumento.reduce((acc, item) => {
        acc.doctotal = redondear2(acc.doctotal + Number(item.dodsubtotal || 0));
        acc.doctotdesc = redondear2(acc.doctotdesc + (Number(item.doddescuni || 0) * Number(item.dodcantidad || 0)));

        if (item.dodafectiva === 1 && item.dodtasaiva === 5) {
            acc.docgravada5 = redondear2(acc.docgravada5 + Number(item.dodbaseimp || 0));
            acc.dociva5 = redondear2(acc.dociva5 + Number(item.dodmontoiva || 0));
        } else if (item.dodafectiva === 1 && item.dodtasaiva === 10) {
            acc.docgravada10 = redondear2(acc.docgravada10 + Number(item.dodbaseimp || 0));
            acc.dociva10 = redondear2(acc.dociva10 + Number(item.dodmontoiva || 0));
        } else if (item.dodafectiva === 2) {
            acc.docexoneradas = redondear2(acc.docexoneradas + Number(item.dodsubtotal || 0));
        } else {
            acc.docexentas = redondear2(acc.docexentas + Number(item.dodsubtotal || 0));
        }

        return acc;
    }, {
        docexentas: 0,
        docexoneradas: 0,
        docgravada5: 0,
        docgravada10: 0,
        dociva5: 0,
        dociva10: 0,
        doctotiva: 0,
        doctotdesc: 0,
        doctotal: 0
    });

    totales.doctotiva = redondear2(totales.dociva5 + totales.dociva10);
    return totales;
}

function construirDatosClienteDocumento() {
    const rucCliente = String(selectedClienteActual?.ruc || $("clienteRuc").value || "").trim();
    const nombreCliente = String(selectedClienteActual?.nombre || $("clienteNombre").value || "").trim();

    return {
        doccliid: Number(selectedClienteActual?.id || 0),
        doclirazon: nombreCliente,
        docliruc: rucCliente || null,
        doclidirec: selectedClienteActual?.raw?.clidir || ""
    };
}

function construirDocumentoPayload({ doccuotas = 0 } = {}) {
    const detalleDocumento = construirDetalleDocumento();
    const totales = construirCabeceraTotales(detalleDocumento);
    const cliente = construirDatosClienteDocumento();

    return {
        doctipdoc: $("comprobanteId").value,
        doctimbrado: Number(timbradoSeleccionado?.timid || 0),
        docfecemi: `${$("fecha").value}T00:00:00`,
        docfecvto: null,
        doccliid: cliente.doccliid,
        doccajaap: null,
        doclirazon: cliente.doclirazon,
        docliruc: cliente.docliruc,
        doclidirec: cliente.doclidirec,
        doccondvta: $("condicion").value === "CREDITO" ? "R" : "C",
        doccuotas: doccuotas,
        docmoneda: monedaActual(),
        doctipcambio: 1,
        docexentas: totales.docexentas,
        docexoneradas: totales.docexoneradas,
        docgravada5: totales.docgravada5,
        docgravada10: totales.docgravada10,
        dociva5: totales.dociva5,
        dociva10: totales.dociva10,
        doctotiva: totales.doctotiva,
        doctotdesc: totales.doctotdesc,
        doctotal: totales.doctotal,
        docobserva: null,
        detalle: detalleDocumento
    };
}

async function emitirDocumento(payload, successMessage) {
    const response = await postData(InsertDocumento, payload, "Documento");
    const documento = response.data || {};
    const numero = documento.docnrocompleto || documento.docnumero || "";
    $("nroComprobante").value = documento.docnrocompleto || "";
    showSuccessToast("Documento emitido", `${successMessage} ${numero}`.trim(), 3000);
    return documento;
}

function calcularTotales() {
    return detalle.reduce((acc, item) => {
        const calculo = calcularItem(item);
        acc.subtotal += calculo.subtotal;
        acc.total += calculo.subtotal;

        if (item.iva === 10) {
            acc.iva10 += calculo.iva;
        }

        if (item.iva === 5) {
            acc.iva5 += calculo.iva;
        }

        return acc;
    }, {
        subtotal: 0,
        iva5: 0,
        iva10: 0,
        total: 0
    });
}

function actualizarTotales() {
    const totales = calcularTotales();
    $("iva5").textContent = importeFormato(totales.iva5, monedaActual());
    $("iva10").textContent = importeFormato(totales.iva10, monedaActual());
    $("totalVenta").textContent = importeFormato(totales.total, monedaActual());
}

function abrirCobroModal() {
    $("cobroModal").classList.add("active");
}

function cerrarCobroModal() {
    $("cobroModal").classList.remove("active");
    ventaPendienteCobro = null;
    $("cobroForm").reset();
    $("vuelto").value = "";
}

function abrirCreditoModal() {
    $("creditoModal").classList.add("active");
}

function cerrarCreditoModal() {
    $("creditoModal").classList.remove("active");
    ventaPendienteCobro = null;
    $("creditoForm").reset();
    $("saldoFinanciado").value = "";
}

function actualizarEstadoCobro() {
    const formaPago = $("formaPago").value;
    const total = totalActualVenta();

    if (formaPago === "EFECTIVO") {
        $("montoRecibido").disabled = false;
        if (!$("montoRecibido").value.trim()) {
            $("vuelto").value = importeFormato(0, monedaActual());
        }
        calcularVuelto();
        return;
    }

    $("montoRecibido").disabled = true;
    $("montoRecibido").value = importeFormato(total, monedaActual());
    $("vuelto").value = importeFormato(0, monedaActual());
}

function calcularNumeroCobro(value) {
    if (!value) {
        return 0;
    }

    const normalizado = String(value).replace(/\./g, "").replace(",", ".");
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
}

function calcularVuelto() {
    const total = totalActualVenta();
    const recibido = calcularNumeroCobro($("montoRecibido").value);
    const vuelto = Math.max(recibido - total, 0);
    $("vuelto").value = importeFormato(vuelto, monedaActual());
}

function actualizarSaldoCredito() {
    const total = totalActualVenta();
    const entregaInicial = calcularNumeroCobro($("entregaInicial").value);
    const saldo = Math.max(total - entregaInicial, 0);
    $("saldoFinanciado").value = importeFormato(saldo, monedaActual());
}

function prepararCobroVenta() {
    const totales = calcularTotales();
    ventaPendienteCobro = {
        fecha: $("fecha").value,
        condicion: $("condicion").value,
        moneda: monedaActual(),
        sucursalId: $("sucursalId").value,
        comprobanteId: $("comprobanteId").value,
        nroComprobante: $("nroComprobante").value.trim(),
        clienteId: selectedClienteActual?.id ?? null,
        clienteRuc: $("clienteRuc").value.trim(),
        clienteNombre: $("clienteNombre").value.trim(),
        observacion: $("observacion")?.value?.trim?.() || "",
        detalle: [...detalle],
        totales
    };

    $("cobroCliente").textContent = ventaPendienteCobro.clienteNombre || ventaPendienteCobro.clienteRuc || "Sin cliente";
    $("cobroComprobante").textContent = ventaPendienteCobro.nroComprobante || "-";
    $("cobroTotal").textContent = importeFormato(totales.total, monedaActual());

    $("cobroForm").reset();
    $("formaPago").value = ventaPendienteCobro.condicion === "CREDITO" ? "CREDITO" : "EFECTIVO";
    $("observacionCobro").value = "";
    actualizarEstadoCobro();

    if (!$("montoRecibido").disabled) {
        $("montoRecibido").value = importeFormato(totales.total, monedaActual());
        calcularVuelto();
    }

    abrirCobroModal();
    setTimeout(() => {
        if ($("montoRecibido").disabled) {
            $("formaPago").focus();
        } else {
            $("montoRecibido").focus();
            $("montoRecibido").select();
        }
    }, 60);
}

function prepararCreditoVenta() {
    const totales = calcularTotales();
    ventaPendienteCobro = {
        fecha: $("fecha").value,
        condicion: $("condicion").value,
        moneda: monedaActual(),
        sucursalId: $("sucursalId").value,
        comprobanteId: $("comprobanteId").value,
        nroComprobante: $("nroComprobante").value.trim(),
        clienteId: selectedClienteActual?.id ?? null,
        clienteRuc: $("clienteRuc").value.trim(),
        clienteNombre: $("clienteNombre").value.trim(),
        observacion: $("observacion")?.value?.trim?.() || "",
        detalle: [...detalle],
        totales
    };

    $("creditoCliente").textContent = ventaPendienteCobro.clienteNombre || ventaPendienteCobro.clienteRuc || "Sin cliente";
    $("creditoComprobante").textContent = ventaPendienteCobro.nroComprobante || "-";
    $("creditoTotal").textContent = importeFormato(totales.total, monedaActual());
    $("creditoForm").reset();
    $("cantidadCuotas").value = "1";
    $("entregaInicial").value = importeFormato(0, monedaActual());
    $("observacionCredito").value = "";
    actualizarSaldoCredito();

    abrirCreditoModal();
    setTimeout(() => {
        $("cantidadCuotas").focus();
        $("cantidadCuotas").select();
    }, 60);
}

function confirmarCobroVenta() {
    if (!ventaPendienteCobro) {
        return;
    }

    const formaPago = $("formaPago").value;
    const total = ventaPendienteCobro.totales.total;
    const recibido = $("montoRecibido").disabled ? total : calcularNumeroCobro($("montoRecibido").value);

    if (formaPago === "EFECTIVO" && recibido < total) {
        showWarningToast("Cobro incompleto", "El monto recibido no puede ser menor al total de la factura.", 2500);
        $("montoRecibido").focus();
        return;
    }

    const payload = construirDocumentoPayload({ doccuotas: 0 });
    void emitirDocumento(payload, "Factura emitida con número").then(() => {
        cerrarCobroModal();
        limpiarVenta();
        irListaFacturas();
    }).catch((error) => {
        console.error("Error emitiendo documento:", error);
    });
}

function confirmarCreditoVenta() {
    if (!ventaPendienteCobro) {
        return;
    }

    if (!validarCampos($("creditoForm"))) {
        showWarningToast("Campos incompletos", "Define al menos la cantidad de cuotas para continuar.", 2500);
        return;
    }

    const total = ventaPendienteCobro.totales.total;
    const cantidadCuotas = Number($("cantidadCuotas").value || 0);
    const entregaInicial = calcularNumeroCobro($("entregaInicial").value);

    if (!Number.isInteger(cantidadCuotas) || cantidadCuotas <= 0) {
        showWarningToast("Cuotas inválidas", "La cantidad de cuotas debe ser mayor a cero.", 2500);
        $("cantidadCuotas").focus();
        return;
    }

    if (entregaInicial < 0 || entregaInicial > total) {
        showWarningToast("Entrega inválida", "La entrega inicial no puede ser mayor al total de la factura.", 2500);
        $("entregaInicial").focus();
        return;
    }

    const saldoFinanciado = Math.max(total - entregaInicial, 0);

    const payload = construirDocumentoPayload({ doccuotas: cantidadCuotas });
    void emitirDocumento(payload, "Factura a crédito emitida con número").then(() => {
        cerrarCreditoModal();
        limpiarVenta();
        irListaFacturas();
    }).catch((error) => {
        console.error("Error emitiendo documento a crédito:", error);
    });
}

function renderDetalle() {
    const body = $("detalleBody");
    body.innerHTML = "";

    if (detalle.length === 0) {
        body.innerHTML = `
            <tr class="sm">
                <td colspan="6">
                    <div class="empty-detail">
                        <div>
                            <i class="fa-solid fa-receipt"></i>
                            <p>Agrega productos para iniciar la venta</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        actualizarTotales();
        return;
    }

    detalle.forEach((item, index) => {
        const calculo = calcularItem(item);
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="Producto">${item.descripcion}</td>
            <td data-label="Cantidad" class="text-right">${item.cantidad}</td>
            <td data-label="Precio" class="text-right">${importeFormato(item.precio, monedaActual())}</td>
            <td data-label="IVA" class="text-right">${item.iva}%</td>
            <td data-label="Subtotal" class="text-right">${importeFormato(calculo.subtotal, monedaActual())}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarItem" data-index="${index}" title="Editar">
                        ${ICON_EDITAR}
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarItem" data-index="${index}" title="Eliminar">
                        ${ICON_ELIMINAR}
                    </button>
                </div>
            </td>
        `;
        body.appendChild(fila);
    });

    document.querySelectorAll('[tipo-btn="editarItem"]').forEach((button) => {
        button.addEventListener("click", () => editarItem(Number(button.dataset.index)));
    });

    document.querySelectorAll('[tipo-btn="eliminarItem"]').forEach((button) => {
        button.addEventListener("click", () => eliminarItem(Number(button.dataset.index)));
    });

    actualizarTotales();
}

function limpiarDetalleForm() {
    $("detalleForm").reset();
    editIndex = null;
    limpiarProductoSeleccionado();
    $("btnAgregarItem").innerHTML = '<i class="fa-solid fa-plus"></i> Agregar';
    dataRequiredClear();
}

function agregarItem() {
    // Si el usuario no indicó cantidad, asumimos una unidad para agilizar la carga.
    if (!$("cantidad").value.trim()) {
        $("cantidad").value = "1";
    }

    if (!validarCampos($("detalleForm"))) {
        return;
    }

    const producto = selectedProductoActual;
    const cantidad = Number($("cantidad").value);
    const precio = Number(selectedProductoActual?.precio || 0);

    if (!producto || cantidad <= 0 || !precio) {
        showWarningToast("Atención", "Verifica producto, cantidad y precio.", 2500);
        return;
    }

    const item = {
        productoId: producto.id,
        codigo: String(producto.id ?? ""),
        gtin: producto.gtin || "",
        descripcion: producto.descripcion,
        tipoPrecio: Number(producto.precioOpciones?.[$("precio").value]?.tipoPrecio || getTipoPrecioVenta()),
        moneda: producto.precioOpciones?.[$("precio").value]?.moneda || monedaActual(),
        cantidad,
        precio,
        iva: Number(producto.iva || 10)
    };

    if (editIndex !== null) {
        detalle[editIndex] = item;
    } else {
        detalle.push(item);
    }

    renderDetalle();
    limpiarDetalleForm();
    $("codigo").focus();
}

function editarItem(index) {
    const item = detalle[index];
    if (!item) {
        return;
    }

    editIndex = index;
    selectedProductoActual = {
        id: item.productoId,
        descripcion: item.descripcion,
        gtin: item.gtin || "",
        precio: Number(item.precio || 0),
        precioOpciones: [{
            tipoPrecio: Number(item.tipoPrecio || getTipoPrecioVenta()),
            moneda: item.moneda || monedaActual(),
            precio: Number(item.precio || 0),
            iva: Number(item.iva || 10)
        }],
        iva: Number(item.iva || 10)
    };
    $("codigo").value = String(selectedProductoActual.id ?? "");
    $("producto").value = item.descripcion;
    $("cantidad").value = item.cantidad;
    renderPrecioOptions(selectedProductoActual.precioOpciones);
    $("btnAgregarItem").innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Modificar';
    $("cantidad").focus();
}

function eliminarItem(index) {
    detalle.splice(index, 1);
    renderDetalle();
    limpiarDetalleForm();
}

function limpiarVenta() {
    $("ventaForm").reset();
    $("fecha").value = hoy();
    $("nroComprobante").value = "";
    $("nroTimbrado").value = "";
    detalle = [];
    editIndex = null;
    limpiarClienteSeleccionado();
    limpiarDetalleForm();
    renderDetalle();
    dataRequiredClear();
    void cargarSucursalesVenta().then(() => actualizarTimbradoSeleccionado());
    $("clienteRuc").focus();
}

function guardarVenta() {
    if (!validarCampos($("ventaForm"))) {
        showWarningToast("Campos incompletos", "Completa los datos obligatorios del comprobante.", 2500);
        return;
    }

    if (detalle.length === 0) {
        showWarningToast("Sin detalle", "Agrega al menos un producto para guardar la venta.", 2500);
        return;
    }

    if (!timbradoSeleccionado?.timid) {
        showWarningToast("Timbrado requerido", "No existe un timbrado activo para la sucursal y el tipo de documento seleccionados.", 3000);
        return;
    }

    if ($("condicion").value === "CREDITO") {
        prepararCreditoVenta();
        return;
    }

    prepararCobroVenta();
}

function irListaFacturas() {
    try {
        const parentOption = window.parent.document.querySelector('.option[data-key="5F2V8A1"]');
        if (parentOption) {
            parentOption.click();
            return;
        }
    } catch (error) {
        console.warn("No se pudo navegar desde el contenedor principal:", error);
    }

    window.location.href = "./lista.html";
}

async function cargarSucursalesVenta() {
    const response = await postData(listSucursal, {
        texto: "",
        limit: 0,
        offset: 0
    }, "Sucursal");

    sucursalesVenta = response.success ? (response.objectsList || []) : [];
    const selectSucursal = $("sucursalId");
    selectSucursal.innerHTML = '<option value="">Seleccionar...</option>' + sucursalesVenta
        .map((item) => `<option value="${item.sucest}">${item.sucnom}</option>`)
        .join("");

    if (selectSucursal.options.length > 1) {
        selectSucursal.selectedIndex = 1;
    }
}

async function init() {
    $("fecha").value = hoy();
    $("clienteNombre").readOnly = true;
    $("producto").readOnly = true;
    await cargarSucursalesVenta();
    await cargarTimbradosVenta();
    actualizarTimbradoSeleccionado();
    formatearImportes(monedaActual());
    Enter();
    renderDetalle();

    $("clienteRuc").addEventListener("input", handleClienteRucInput);
    $("clienteRuc").addEventListener("keydown", handleClienteRucEnter, true);
    $("clienteRuc").addEventListener("blur", () => {
        void buscarClientePorRuc();
    });
    $("clienteNombre").addEventListener("click", () => openClienteBusquedaModal());

    $("codigo").addEventListener("input", handleCodigoInput);
    $("codigo").addEventListener("keydown", handleCodigoEnter, true);
    $("producto").addEventListener("click", () => openProductoBusquedaModal());
    $("detalleForm").addEventListener("keydown", handleDetalleEnter, true);

    $("moneda").addEventListener("change", async () => {
        formatearImportes(monedaActual());
        renderDetalle();

        if (selectedProductoActual?.id) {
            await actualizarPrecioProductoSeleccionado();
        }
    });

    $("precio").addEventListener("change", (event) => {
        const indexSeleccionado = Number(event.target.value || 0);
        aplicarPrecioSeleccionado(indexSeleccionado);
    });
    $("sucursalId").addEventListener("change", actualizarTimbradoSeleccionado);
    $("comprobanteId").addEventListener("change", actualizarTimbradoSeleccionado);

    $("entregaInicial").addEventListener("input", actualizarSaldoCredito);
    $("formaPago").addEventListener("change", actualizarEstadoCobro);
    $("montoRecibido").addEventListener("input", calcularVuelto);
    $("btnCloseCobroModal").addEventListener("click", cerrarCobroModal);
    $("btnCancelCobro").addEventListener("click", cerrarCobroModal);
    $("btnConfirmarCobro").addEventListener("click", confirmarCobroVenta);
    $("cobroModal").addEventListener("click", (event) => {
        if (event.target === $("cobroModal")) {
            cerrarCobroModal();
        }
    });
    $("btnCloseCreditoModal").addEventListener("click", cerrarCreditoModal);
    $("btnCancelCredito").addEventListener("click", cerrarCreditoModal);
    $("btnConfirmarCredito").addEventListener("click", confirmarCreditoVenta);
    $("creditoModal").addEventListener("click", (event) => {
        if (event.target === $("creditoModal")) {
            cerrarCreditoModal();
        }
    });

    $("btnAgregarItem").addEventListener("click", agregarItem);
    $("btnCancel").addEventListener("click", limpiarVenta);
    $("btnGuardar").addEventListener("click", guardarVenta);
}

void init();
