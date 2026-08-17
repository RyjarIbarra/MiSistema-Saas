import { DeleteUsuario, getUrlById, InsertUsuario, listUsuarios, UpdateUsuario } from "../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, showLoader, hideLoader } from "../../js/loader.js";
import { cargaOptionsAccess } from "../../js/options.js";
import { showSuccessToast } from "../../js/toast.js";
import { Enter, calcularFilasVisibles, dataRequiredClear, validarCampos } from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);

const setVal = (id, val) => $(id).value = val;

let modo = 'INS';
let usuId = 0;
let DefaultFilter = {
    texto: "",
    limit: 0,
    offset: 0
};

Enter();
cleanupLoader();
const perfilSelect = $("perfil");
const opcionesPerfilBase = perfilSelect.innerHTML;
const opcionesPerfilApi = await cargaOptionsAccess();

if (opcionesPerfilApi) {
    const contenedorTemporal = document.createElement("select");
    contenedorTemporal.innerHTML = opcionesPerfilBase + opcionesPerfilApi;

    const valuesVistos = new Set();
    const opcionesFinales = [];

    contenedorTemporal.querySelectorAll("option").forEach((option) => {
        const value = option.value ?? "";
        if (valuesVistos.has(value)) {
            return;
        }
        valuesVistos.add(value);
        opcionesFinales.push(option.outerHTML);
    });

    perfilSelect.innerHTML = opcionesFinales.join("");
}

function actualizarOpcionesPerfil({ incluirTitular = true } = {}) {
    perfilSelect.querySelectorAll("option").forEach((option) => {
        if (option.value === "0") {
            option.hidden = !incluirTitular;
        }
    });

    if (!incluirTitular && perfilSelect.value === "0") {
        perfilSelect.value = "";
    }
}

let currentPage = 1;
let currentBatch = 0;
let cachedData = [];
let totalRecords = 0;

let FILAS_POR_PAGINA = calcularFilasVisibles();
const ROWS_PER_PAGE = FILAS_POR_PAGINA;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH; // 90

const pageInfo = document.getElementById("pageinfo");

/**
 * Carga un lote desde la API
 */
async function loadBatch(batchNumber) {
    const offset = batchNumber * RECORDS_PER_BATCH;

    DefaultFilter.texto = document.getElementById("searchInput").value.trim();
    DefaultFilter.limit = RECORDS_PER_BATCH;
    DefaultFilter.offset = offset;

    const response = await postData(listUsuarios, DefaultFilter);
    
    if (response.success) {
        currentBatch = batchNumber;
        cachedData = response.objectsList || [];
        totalRecords = response.totalRecords || 0;
    }
    pageInfo.textContent = `Mostrando 1 a ${FILAS_POR_PAGINA > totalRecords ? totalRecords : FILAS_POR_PAGINA} de ${totalRecords} registros`;
}

/**
 * Renderiza una página
 */
function renderPage(pageNumber) {
    currentPage = pageNumber;
    document.getElementById("pagActual").textContent = `${currentPage}`;
    document.getElementById("totalPage").textContent = `${Math.ceil(totalRecords / ROWS_PER_PAGE)}`;
    const indexInBatch = (pageNumber - 1) % PAGES_PER_BATCH;
    const startIndex = indexInBatch * ROWS_PER_PAGE;
    const pageData = cachedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    //document.getElementById("paginationInfo").textContent = `Pagina ${pageNumber} de ${Math.ceil(totalRecords / ROWS_PER_PAGE)}`;
    // Renderizar tabla con pageData
    renderTable(pageData);
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
    const htmlTablaUsuarios = document.getElementById("tablaUsuarios");
    htmlTablaUsuarios.innerHTML = "";
    if(data.length === 0) {
        hideLoader();        
        htmlTablaUsuarios.innerHTML = `
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

    data.forEach(usuario => {
        const esTitular = Number(usuario.nivel ?? -1) === 0;
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="ID">${usuario.id_usuario}</td>
            <td data-label="Nombre">${usuario.username}</td>
            <td class="hide-mobile">${usuario.email}</td>
            <td class="hide-mobile">${usuario.rol}</td>
            <td class="hide-mobile">${usuario.activo ? "Activo" : "Bloqueado"}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="ver" data-id="${usuario.id_usuario}" title="Ver">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="editar" data-id="${usuario.id_usuario}" title="Editar" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    ${esTitular ? "" : `
                    <button class="btn-icon" tipo-btn="eliminar" data-id="${usuario.id_usuario}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    `}
                </div>
            </td>             
        `;
        htmlTablaUsuarios.appendChild(fila);     
    });

    const botonesVer = document.querySelectorAll('[tipo-btn="ver"]');
    botonesVer.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;  
            limpiar();          
            modo = 'VER';
            getById(id);
        });
    });     

    const botonesModificar = document.querySelectorAll('[tipo-btn="editar"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;  
            limpiar();
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
    $('userModal').classList.add('active');    
    setTimeout(function() {
        $("usuario").focus();
    }, 200);
}

function closeModal() {
    $("userModal").classList.remove('active');
}

function newUsuario() {
    $('modalTitle').textContent = 'Nuevo Usuario';
    actualizarOpcionesPerfil({ incluirTitular: false });
    openModal();
    limpiar();
}

// Botones del modal
$("btnNewUser").addEventListener("click", newUsuario);
$("btnCloseModal").addEventListener("click", closeModal);
$("btnCancel").addEventListener("click", closeModal);

window.onclick = function(event) {
    var modal = $("userModal");
    if (event.target === modal) {
        closeModal();
    }
};

function StringData() {
    const perfilOption = $("perfil").selectedOptions?.[0] || null;
    const nivelSeleccionado = Number.parseInt($("perfil").value || "0", 10);
    const formData = {
        id_usuario: usuId,        
        id_licencia: 0,
        username: $("usuario").value.trim(),
        password_hash: $("password").value.trim(),
        email: $("email").value.trim(),
        telefono: $("telefono").value.trim(),
        rol: perfilOption ? perfilOption.textContent.trim() : "",
        nivel: Number.isNaN(nivelSeleccionado) ? 0 : nivelSeleccionado,
        activo: $("activo").value
    }
    return formData;
}

function limpiar() {
    modo = 'INS';
    $("userForm").reset();
    actualizarOpcionesPerfil({ incluirTitular: false });
    $("perfil").disabled = false;
    $("activo").disabled = false;
    $("password").disabled = false;
    $("confirmPassword").disabled = false;
    dataRequiredClear();
}

async function insert() {
    try {             
        const response = await postData(InsertUsuario, StringData(), "Usuario");
        if (response.success) {
            initPagination();
            limpiar();
            showSuccessToast("Registrado","Usuario registrado con éxito", 2000);
        }
    } catch (error) {
        console.error(error);
    }
}

async function update() {
    try {              
        const response = await putData(UpdateUsuario, StringData(), "Usuario");
        if (response.success) {
            initPagination();
            closeModal();
            limpiar();            
            showSuccessToast("Modificado","Usuario modificado con éxito", 2000);
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getById(id) {
    try {

        $("btnGuardar").style.display = '';
        $("modalTitle").textContent = 'Modificar Usuario';
        
        if(modo === "VER") {
            $("btnGuardar").style.display = 'none';
            $("modalTitle").textContent = 'Visualizar Usuario';
        }

        $("perfil").disabled = false;
        $("activo").disabled = false;
        $("password").disabled = true;
        $("confirmPassword").disabled = true;

        const response = await getData(`${getUrlById}?id=${id}`);
        if (response.success) {
            const usuario = response.data;
            const esTitular = Number(usuario.nivel ?? -1) === 0;
            actualizarOpcionesPerfil({ incluirTitular: esTitular });
            setVal("usuario", usuario.username);
            setVal("email", usuario.email);
            setVal("telefono", usuario.telefono);
            setVal("perfil", usuario.nivel ?? usuario.rol ?? "");
            setVal("activo", usuario.activo);
            $("perfil").disabled = modo === "VER" || esTitular;
            $("activo").disabled = modo === "VER" || esTitular;
            usuId = id;
            openModal();
        }

    } catch (error) {
        console.log(error);
    }
}

export async function eliminar(id) {
    try {
        const response = await deleteData(`${DeleteUsuario}?id=${id}`, "Usuario");
        if (response.success) {
            initPagination();
            showSuccessToast("Eliminado","Usuario eliminado con éxito", 2000);
        }
    } catch (error) {
        console.error(error);
    }
}

$("btnGuardar").addEventListener("click", () => {
    if(!validarCampos()){
        return;
    }
    if(modo === "INS") {
        insert();  
    } else {
        update();
    }         
});
