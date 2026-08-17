import { InsertCliente, listClientes, getByIdCliente, UpdateCliente, DeleteCliente, getUrlBuscar } from "../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData, SearchRuc } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { cargaOptionsTiposPrecios } from "../../js/options.js";
import { showSuccessToast } from "../../js/toast.js";
import { calcularFilasVisibles, dataRequiredClear, Enter, ICON_EDITAR, ICON_ELIMINAR, ICON_VER, Tab, tabActive, validarCampos } from "../../js/utilidades.js";
import { PAISES_FRECUENTES, PAISES_SIFEN, PAIS_DEFAULT, getPaisByCodigo } from "../../js/paises-sifen.js";
import { DEPARTAMENTOS, getCiudadByCodigo, getCiudadesByDistrito, getDepartamentoByCodigo, getDistritoByCodigo, getDistritosByDepartamento } from "../../js/paraguay-geografia.js";

const $ = (id) => document.getElementById(id);

const setVal = (id, val) => $(id).value = val;

let modo = 'INS';
let cliId = 0;
let DefaultFilter = {
    texto: "",
    limit: 0,
    offset: 0
};

Enter();
Tab();
cleanupLoader();
let currentPage = 1;
let currentBatch = 0;
let cachedData = [];
let totalRecords = 0;

let FILAS_POR_PAGINA = calcularFilasVisibles();
const ROWS_PER_PAGE = FILAS_POR_PAGINA;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH; // 90

const pageInfo = document.getElementById("pageinfo");
$("tipoprec").innerHTML += await cargaOptionsTiposPrecios();

const UBICACION_PARAGUAY_DEFAULT = {
    departamentoCodigo: "1",
    distritoCodigo: "1",
    ciudadCodigo: "1"
};

function selectedText(id) {
    const select = $(id);
    return select?.selectedOptions?.[0]?.textContent?.trim() || "";
}

function firstDefined(...values) {
    return values.find((value) => value !== undefined && value !== null && value !== "");
}

function renderPaisOptions(selectedCodigo = PAIS_DEFAULT) {
    const frecuentes = new Set(PAISES_FRECUENTES.map((item) => item.codigo));
    const otrasOpciones = PAISES_SIFEN.filter((item) => !frecuentes.has(item.codigo));

    $("pais_codigo").innerHTML = `
        <optgroup label="Frecuentes">
            ${PAISES_FRECUENTES.map((item) => (
                `<option value="${item.codigo}">${item.bandera ? `${item.bandera} ` : ""}${item.descripcion}</option>`
            )).join("")}
        </optgroup>
        <optgroup label="Todos">
            ${otrasOpciones.map((item) => (
                `<option value="${item.codigo}">${item.bandera ? `${item.bandera} ` : ""}${item.descripcion}</option>`
            )).join("")}
        </optgroup>
    `;

    $("pais_codigo").value = selectedCodigo || PAIS_DEFAULT;
}

function renderDepartamentoOptions(selectedCodigo = "", usarDefault = true) {
    $("departamento_cliente").innerHTML = '<option value="">Seleccionar...</option>' +
        DEPARTAMENTOS.map((item) => (
            `<option value="${item.codigo}">${item.descripcion}</option>`
        )).join("");
    $("departamento_cliente").value = selectedCodigo || (usarDefault ? UBICACION_PARAGUAY_DEFAULT.departamentoCodigo : "");
}

function renderDistritoOptions(departamentoCodigo, selectedCodigo = "", usarDefault = true) {
    const codigoDepartamento = departamentoCodigo || (usarDefault ? UBICACION_PARAGUAY_DEFAULT.departamentoCodigo : "");
    const distritos = codigoDepartamento ? getDistritosByDepartamento(Number(codigoDepartamento)) : [];
    $("distrito_cliente").innerHTML = '<option value="">Seleccionar...</option>' +
        distritos.map((item) => (
            `<option value="${item.codigo}">${item.descripcion}</option>`
        )).join("");
    $("distrito_cliente").value = selectedCodigo || (usarDefault ? UBICACION_PARAGUAY_DEFAULT.distritoCodigo : "");
}

function renderCiudadOptions(distritoCodigo, selectedCodigo = "", usarDefault = true) {
    const codigoDistrito = distritoCodigo || (usarDefault ? UBICACION_PARAGUAY_DEFAULT.distritoCodigo : "");
    const ciudades = codigoDistrito ? getCiudadesByDistrito(Number(codigoDistrito)) : [];
    $("ciudad_cliente").innerHTML = '<option value="">Seleccionar...</option>' +
        ciudades.map((item) => (
            `<option value="${item.codigo}">${item.descripcion}</option>`
        )).join("");
    $("ciudad_cliente").value = selectedCodigo || (usarDefault ? UBICACION_PARAGUAY_DEFAULT.ciudadCodigo : "");
}

function limpiarUbicacionParaguay() {
    renderDepartamentoOptions(UBICACION_PARAGUAY_DEFAULT.departamentoCodigo);
    renderDistritoOptions(UBICACION_PARAGUAY_DEFAULT.departamentoCodigo, UBICACION_PARAGUAY_DEFAULT.distritoCodigo);
    renderCiudadOptions(UBICACION_PARAGUAY_DEFAULT.distritoCodigo, UBICACION_PARAGUAY_DEFAULT.ciudadCodigo);
}

function actualizarPaisCliente() {
    const pais = getPaisByCodigo($("pais_codigo").value) || getPaisByCodigo(PAIS_DEFAULT);
    setVal("pais_prefijo", pais?.codigo_telefono || "");

    const esParaguay = pais?.codigo === PAIS_DEFAULT;
    $("ubicacionParaguayRow").style.display = esParaguay ? "" : "none";
    $("departamento_cliente").disabled = !esParaguay;
    $("distrito_cliente").disabled = !esParaguay;
    $("ciudad_cliente").disabled = !esParaguay;

    if (!esParaguay) {
        limpiarUbicacionParaguay();
    }

    if (!$("telefono").value.trim() && pais?.codigo_telefono && pais.codigo_telefono !== "-") {
        $("telefono").placeholder = `${pais.codigo_telefono} ...`;
    }
}

function cargarUbicacionCliente(paraguayData = {}) {
    const departamentoCodigo = paraguayData.departamentoCodigo || UBICACION_PARAGUAY_DEFAULT.departamentoCodigo;
    const distritoCodigo = paraguayData.distritoCodigo || UBICACION_PARAGUAY_DEFAULT.distritoCodigo;
    const ciudadCodigo = paraguayData.ciudadCodigo || UBICACION_PARAGUAY_DEFAULT.ciudadCodigo;

    renderDepartamentoOptions(departamentoCodigo);
    renderDistritoOptions(departamentoCodigo, distritoCodigo);
    renderCiudadOptions(distritoCodigo, ciudadCodigo);
}

function inicializarUbicacionCliente() {
    renderPaisOptions();
    cargarUbicacionCliente();
    actualizarPaisCliente();
}

/**
 * Carga un lote desde la API
 */
async function loadBatch(batchNumber) {
    const offset = batchNumber * RECORDS_PER_BATCH;

    DefaultFilter.texto = document.getElementById("searchInput").value.trim();
    DefaultFilter.limit = RECORDS_PER_BATCH;
    DefaultFilter.offset = offset;

    const response = await postData(listClientes, DefaultFilter);
    
    if (response.success) {
        currentBatch = batchNumber;
        cachedData = response.objectsList || [];
        totalRecords = response.totalRecords || 0;
    }
}

/**
 * Renderiza una página
 */
function renderPage(pageNumber) {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    pageNumber = pageNumber > totalPages ? totalPages : pageNumber;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    currentPage = pageNumber;
    const indexInBatch = (pageNumber - 1) % PAGES_PER_BATCH;
    const startIndex = indexInBatch * ROWS_PER_PAGE;
    const pageData = cachedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    pageInfo.textContent = `Total registros ${totalRecords}`;
    renderPaginationControls(totalPages);
    renderTable(pageData);
}

function renderPaginationControls(totalPages) {
    const pagesContainer = $("clientePaginationPages");
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
                const targetPage = Number(item);
                const newBatch = Math.floor((targetPage - 1) / PAGES_PER_BATCH);
                if (newBatch !== currentBatch) {
                    await loadBatch(newBatch);
                }
                renderPage(targetPage);
            });
        }

        pagesContainer.appendChild(button);
    });

    $("btnpagPrimero").disabled = currentPage <= 1;
    $("btnpagAnterior").disabled = currentPage <= 1;
    $("btnpagSiguiente").disabled = currentPage >= safeTotal;
    $("btnpagUltimo").disabled = currentPage >= safeTotal;
}


/**
 * Primera página
 */
async function firstPage() {
    if (currentBatch !== 0) await loadBatch(0);
    renderPage(1);
}

/**
 * Página anterior
 */
async function previousPage() {
    if (currentPage > 1) {
        const newBatch = Math.floor((currentPage - 2) / PAGES_PER_BATCH);
        if (newBatch !== currentBatch) await loadBatch(newBatch);
        renderPage(currentPage - 1);

    }
}
document.getElementById("btnpagAnterior").addEventListener("click", async function(){
    previousPage()
});

/**
 * Página siguiente
 */
async function nextPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    if (currentPage < totalPages) {
        const newBatch = Math.floor(currentPage / PAGES_PER_BATCH);
        if (newBatch !== currentBatch) await loadBatch(newBatch);
        renderPage(currentPage + 1);
    }
}
document.getElementById("btnpagSiguiente").addEventListener("click", async function(){
    nextPage()
});

$("btnpagPrimero").addEventListener("click", async function(){
    firstPage();
});

$("btnpagUltimo").addEventListener("click", async function(){
    lastPage();
});

/**
 * Última página
 */
async function lastPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    const lastBatch = Math.floor((totalPages - 1) / PAGES_PER_BATCH);
    if (lastBatch !== currentBatch) await loadBatch(lastBatch);
    renderPage(totalPages);
}

/**
 * Inicializar
 */
async function initPagination() {    
    await loadBatch(0);
    renderPage(1);
}
initPagination();
showLoader();

/**
 * Función para renderizar tabla (implementar según tu HTML)
 */
function renderTable(data) {
    const htmlTablaClientes = document.getElementById("tablaClientes");
    htmlTablaClientes.innerHTML = "";
    if(data.length === 0) {
        hideLoader();         
        htmlTablaClientes.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <h3>No se encontraron datos</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </td>
            </tr>
        `;
        return;    
    }

    data.forEach(cliente => {
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="ID">${cliente.cliid}</td>
            <td data-label="Nombre">${cliente.clinom}</td>
            <td data-label="RUC">${cliente.cliruc === '0' ? '-' : cliente.cliruc}</td>
            <td class="hide-mobile" data-label="Email">${cliente.climail}</td>
            <td class="hide-mobile" data-label="Teléfono">${cliente.clitel}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="ver" data-id="${cliente.cliid}" title="Ver">
                        ${ICON_VER}
                    </button>
                    ${cliente.cliruc === '0' ? '' : 
                    `<button class="btn-icon" tipo-btn="editar" data-id="${cliente.cliid}" title="Editar" title="Editar">
                        ${ICON_EDITAR}
                    </button>
                    <button class="btn-icon" tipo-btn="eliminar" data-id="${cliente.cliid}" title="Eliminar">
                        ${ICON_ELIMINAR}
                    </button>`
                    }
                </div>
            </td>             
        `;
        htmlTablaClientes.appendChild(fila);     
    });

    const botonesVer = document.querySelectorAll('[tipo-btn="ver"]');
    botonesVer.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;            
            modo = 'VER';
            getById(id);
        });
    });     

    const botonesModificar = document.querySelectorAll('[tipo-btn="editar"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;  
            modo = 'UPD';
            getById(id);
        });
    });    

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminar"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;            
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el cliente?`,
                onEliminar: () => eliminar(id)
            });
        });
    });   

    hideLoader(); 
}

function openModal() {    
    $('clientModal').classList.add('active');
    tabActive("cliente-general");
    setTimeout(function() {
        $("ruc").focus();
    }, 200);
}

function closeModal() {
    $("clientModal").classList.remove('active');
}

window.onclick = function(event) {
    var modal = $("clientModal");
    if (event.target === modal) {
        closeModal();
    }
};

$("btnNewClient").addEventListener("click", newCliente);

$("btnCloseModal").addEventListener("click", closeModal);
$("btnCancel").addEventListener("click", closeModal);

$("searchInput").addEventListener("input", () => {
    DefaultFilter.texto = $("searchInput").value;
    initPagination();
});

function newCliente() {
    $('modalTitle').textContent = 'Nuevo Cliente';
    limpiar();
    openModal();
}

function StringData() {
    const pais = getPaisByCodigo($("pais_codigo").value);
    const esParaguay = pais?.codigo === PAIS_DEFAULT;
    const paisCodigo = $("pais_codigo").value.trim();
    const departamentoCodigo = $("departamento_cliente").value.trim();
    const distritoCodigo = $("distrito_cliente").value.trim();
    const ciudadCodigo = $("ciudad_cliente").value.trim();

    const formData = {
        cliid: cliId,        
        clinom: $("nombre").value.trim(),
        cliruc: $("ruc").value.trim(),
        tipo_documento: Number($("tipodoc").value),
        naturaleza_receptor: Number($("naturaleza_receptor").value),
        clitel: $("telefono").value.trim(),
        clidir: $("direccion").value.trim(),
        climail: $("email").value.trim(),
        tipoprecio: $("tipoprec").value ? Number($("tipoprec").value) : null,
        cliobs: $("observaciones").value.trim(),
        tipo_operacion: $("tipo_operacion").value,
        tipo_contribuyente: $("tipo_contribuyente").value,
        pais_codigo: paisCodigo || "",
        pais_descripcion: paisCodigo ? (pais?.descripcion || "") : "",
        pais_prefijo: paisCodigo ? $("pais_prefijo").value.trim() : "",
        departamento_codigo: esParaguay && departamentoCodigo ? Number(departamentoCodigo) : null,
        departamento_descripcion: esParaguay && departamentoCodigo ? selectedText("departamento_cliente") : "",
        distrito_codigo: esParaguay && distritoCodigo ? Number(distritoCodigo) : null,
        distrito_descripcion: esParaguay && distritoCodigo ? selectedText("distrito_cliente") : "",
        ciudad_codigo: esParaguay && ciudadCodigo ? Number(ciudadCodigo) : null,
        ciudad_descripcion: esParaguay && ciudadCodigo ? selectedText("ciudad_cliente") : ""
    }
    return formData;
}

async function insert() {
    try {        
        const response = await postData(InsertCliente, StringData(), "Cliente");
        if (response.success) {
            initPagination();
            limpiar();
            showSuccessToast("Registrado","Cliente registrado con éxito", 2000);
        }
    } catch (error) {
        console.error(error);
    }
}

async function update() {
    try {              
        const response = await putData(UpdateCliente, StringData(), "Cliente");
        if (response.success) {
            initPagination();
            closeModal();
            limpiar();            
            showSuccessToast("Modificado","Cliente modificado con éxito", 2000);
        }
    } catch (error) {
        console.error(error);
    }
}

function limpiar() {
    cliId = 0;
    modo = "INS";
    $("clientForm").reset();
    $("btnGuardar").style.display = '';
    renderPaisOptions(PAIS_DEFAULT);
    cargarUbicacionCliente();
    actualizarPaisCliente();
    tabActive("cliente-general");
    dataRequiredClear();
    setTimeout(() => {
        $("ruc").focus();
    }, 100);
}

export async function eliminar(id) {
    try {
        const response = await deleteData(`${DeleteCliente}?id=${id}`);
        if (response.success) {
            initPagination();
            showSuccessToast("Eliminado","Cliente eliminado con éxito", 2000);
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getById(id) {
    try {

        $("btnGuardar").style.display = '';
        $("modalTitle").textContent = 'Modificar Cliente';
        
        if(modo === "VER") {
            $("btnGuardar").style.display = 'none';
            $("modalTitle").textContent = 'Visualizar Cliente';
        }

        const response = await getData(`${getByIdCliente}?id=${id}`);
        if (response.success) {
            const cliente = response.data;
            setVal("nombre", cliente.clinom);
            setVal("ruc", cliente.cliruc);
            setVal("tipodoc", firstDefined(cliente.tipo_documento, "9"));
            setVal("naturaleza_receptor", firstDefined(cliente.naturaleza_receptor, "1"));
            setVal("telefono", cliente.clitel);
            setVal("direccion", cliente.clidir);
            setVal("tipo_operacion", firstDefined(cliente.tipo_operacion, "1"));
            setVal("tipo_contribuyente", firstDefined(cliente.tipo_contribuyente, "1"));
            setVal("tipoprec", cliente.tipoprecio ?? "");
            setVal("email", cliente.climail);   
            setVal("observaciones", cliente.cliobs);
            const paisCodigo = firstDefined(cliente.pais_codigo, cliente.clipais, cliente.clipaicod, PAIS_DEFAULT);
            renderPaisOptions(paisCodigo);
            actualizarPaisCliente();

            if (paisCodigo === PAIS_DEFAULT) {
                const departamentoCodigo = firstDefined(cliente.departamento_codigo, cliente.clidepartamento, cliente.clidep, "");
                const distritoCodigo = firstDefined(cliente.distrito_codigo, cliente.clidistrito, cliente.clidis, "");
                const ciudadCodigo = firstDefined(cliente.ciudad_codigo, cliente.cliciudad, cliente.cliciu, "");
                cargarUbicacionCliente({ departamentoCodigo, distritoCodigo, ciudadCodigo });

                if (!departamentoCodigo && !distritoCodigo && ciudadCodigo) {
                    const ciudad = getCiudadByCodigo(Number(ciudadCodigo));
                    const distrito = ciudad ? getDistritoByCodigo(ciudad.distrito) : null;
                    const departamento = distrito ? getDepartamentoByCodigo(distrito.departamento) : null;
                    cargarUbicacionCliente({
                        departamentoCodigo: departamento?.codigo || "",
                        distritoCodigo: distrito?.codigo || "",
                        ciudadCodigo: ciudad?.codigo || ""
                    });
                }
            } else {
                cargarUbicacionCliente();
            }
            cliId = id;
            openModal();
        }
    } catch (error) {
        console.log(error);
    }
}

$("ruc").addEventListener("blur", () => {
    buscarCliente();
});

export async function buscarCliente() {
    try {
        const tipoDocumento = Number($("tipodoc").value);
        const valorRuc = $("ruc").value.trim();
        const digitosRuc = valorRuc.replace(/\D/g, "");

        if (tipoDocumento !== 9 || digitosRuc.length <= 3) {
            return;
        }

        const cliente = await SearchRuc(valorRuc);        
        const ruc = cliente.data[0].ruc + "-" + cliente.data[0].dv;
        setVal("ruc", ruc);
        setVal("nombre", cliente.data[0].nombre);
    } catch (error) {
        console.error(error);
    }
}

$("btnGuardar").addEventListener("click", () => {
    if(!validarCampos()){
        return;
    }
    if(modo === "INS"){
        insert();  
    } else {
        update();
    }         
});

$("pais_codigo").addEventListener("change", actualizarPaisCliente);
$("departamento_cliente").addEventListener("change", () => {
    const codigo = $("departamento_cliente").value;
    renderDistritoOptions(codigo, "", false);
    renderCiudadOptions("", "", false);
});
$("distrito_cliente").addEventListener("change", () => {
    const codigo = $("distrito_cliente").value;
    renderCiudadOptions(codigo, "", false);
});

inicializarUbicacionCliente();
