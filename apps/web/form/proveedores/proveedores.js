import { DeleteProveedor, getByIdProveedor, InsertProveedor, listProveedor, UpdateProveedor } from "../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData, SearchRuc } from "../../js/apiService.js";
import { confirmDelete } from "../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../js/loader.js";
import { cargaOptionsTiposDocumento } from "../../js/options.js";
import { showSuccessToast, showWarningToast } from "../../js/toast.js";
import { calcularFilasVisibles, dataRequiredClear, Enter, ICON_EDITAR, ICON_ELIMINAR, ICON_VER, validarCampos } from "../../js/utilidades.js";

const $ = (id) => document.getElementById(id);
const TIPOS_DOCUMENTO_PERMITIDOS = new Set(["1", "2", "3", "4", "5", "6", "9"]);
const TIPOS_DOCUMENTO_FALLBACK = [
    { value: "1", text: "Cédula paraguaya" },
    { value: "2", text: "Pasaporte" },
    { value: "3", text: "Cédula extranjera" },
    { value: "4", text: "Carnet de residencia" },
    { value: "5", text: "Innominado" },
    { value: "6", text: "Tarjeta Diplomática de exoneración fiscal" },
    { value: "9", text: "Otro (RUC)" }
];

let modo = "INS";
let proveedorId = 0;
const DefaultFilter = {
    texto: "",
    limit: 0,
    offset: 0
};

let currentPage = 1;
let currentBatch = 0;
let cachedData = [];
let totalRecords = 0;

Enter();
cleanupLoader();

let FILAS_POR_PAGINA = calcularFilasVisibles() || 8;
const ROWS_PER_PAGE = FILAS_POR_PAGINA;
const PAGES_PER_BATCH = 10;
const RECORDS_PER_BATCH = ROWS_PER_PAGE * PAGES_PER_BATCH;

function buildFallbackTipoDocumentoOptions(selectedValue = "9") {
    return ['<option value="">Seleccionar...</option>']
        .concat(TIPOS_DOCUMENTO_FALLBACK.map((item) => (
            `<option value="${item.value}"${item.value === selectedValue ? " selected" : ""}>${item.text}</option>`
        )))
        .join("");
}

async function renderTipoDocumentoOptions(selectedValue = "9") {
    const select = $("tipo_documento");
    let apiOptions = "";

    try {
        apiOptions = await cargaOptionsTiposDocumento();
    } catch (error) {
        console.error("Error cargando tipos de documento para proveedores:", error);
    }

    if (!apiOptions) {
        select.innerHTML = buildFallbackTipoDocumentoOptions(selectedValue);
        return;
    }

    const temp = document.createElement("select");
    temp.innerHTML = apiOptions;

    const options = ['<option value="">Seleccionar...</option>'];
    temp.querySelectorAll("option").forEach((option) => {
        const value = String(option.value || "").trim();
        if (!TIPOS_DOCUMENTO_PERMITIDOS.has(value)) {
            return;
        }

        const selected = value === String(selectedValue) ? " selected" : "";
        options.push(`<option value="${value}"${selected}>${option.textContent.trim()}</option>`);
    });

    if (options.length === 1) {
        select.innerHTML = buildFallbackTipoDocumentoOptions(selectedValue);
        return;
    }

    select.innerHTML = options.join("");
    if (!select.value) {
        select.value = selectedValue;
    }
}

function setSoloLecturaForm(soloLectura) {
    $("providerForm").querySelectorAll("input, textarea, select").forEach((field) => {
        const tagName = field.tagName.toLowerCase();

        if (tagName === "select") {
            field.disabled = soloLectura;
            return;
        }

        field.disabled = false;
        field.readOnly = soloLectura;
    });
}

function normalizarDocumentoProveedor() {
    const tipoDocumento = $("tipo_documento").value;
    const input = $("ruc");
    let valor = input.value;

    if (tipoDocumento === "1") {
        valor = valor.replace(/\D/g, "");
    } else if (tipoDocumento === "9") {
        valor = valor.replace(/[^0-9A-Za-z-]/g, "");
        const partes = valor.split("-");
        if (partes.length > 2) {
            valor = `${partes[0]}-${partes.slice(1).join("")}`;
        }
        if (partes.length >= 2) {
            valor = `${partes[0]}-${partes[1]}`;
        }
    }

    input.value = valor;
}

function actualizarTipoDocumentoUI() {
    const tipoDocumento = $("tipo_documento").value;
    const input = $("ruc");

    if (tipoDocumento === "1") {
        input.placeholder = "1234567";
    } else if (tipoDocumento === "9") {
        input.placeholder = "80012345-7";
    } else {
        input.placeholder = "Documento";
    }

    normalizarDocumentoProveedor();
}

function actualizarContribuyenteSegunNaturaleza() {
    const naturaleza = $("naturaleza").value;
    const selectContribuyente = $("contribuyente");
    const opcionJuridica = selectContribuyente.querySelector('option[value="2"]');

    if (naturaleza === "2") {
        selectContribuyente.value = "1";
        if (opcionJuridica) {
            opcionJuridica.disabled = true;
        }
    } else if (opcionJuridica) {
        opcionJuridica.disabled = false;
    }
}

function validarDocumentoProveedor() {
    const tipoDocumento = $("tipo_documento").value;
    const documento = $("ruc").value.trim();

    if (tipoDocumento === "1" && !/^\d+$/.test(documento)) {
        showWarningToast("Documento inválido", "Para Cédula paraguaya solo se permiten números.", 2500);
        $("ruc").focus();
        return false;
    }

    if (tipoDocumento === "9" && !/^[0-9]+-[0-9A-Za-z]$/.test(documento)) {
        showWarningToast("RUC inválido", "Para RUC debes incluir el dígito verificador. Ejemplo: 80012345-7.", 3000);
        $("ruc").focus();
        return false;
    }

    return true;
}

function validarNaturalezaContribuyente() {
    if ($("naturaleza").value === "2" && $("contribuyente").value === "2") {
        showWarningToast("Combinación inválida", "Un proveedor no contribuyente solo puede ser Persona Física.", 3000);
        $("contribuyente").focus();
        return false;
    }

    return true;
}

function openModal() {
    $("providerModal").classList.add("active");
    setTimeout(() => {
        $("ruc").focus();
    }, 200);
}

function closeModal() {
    $("providerModal").classList.remove("active");
}

function limpiar() {
    modo = "INS";
    proveedorId = 0;
    $("providerForm").reset();
    $("modalTitle").textContent = "Nuevo Proveedor";
    $("btnGuardar").style.display = "";
    setSoloLecturaForm(false);
    $("contribuyente").disabled = false;
    dataRequiredClear();
    $("naturaleza").value = "1";
    $("contribuyente").value = "1";
    actualizarContribuyenteSegunNaturaleza();
    $("tipo_documento").value = "9";
    actualizarTipoDocumentoUI();
}

function StringData() {
    return {
        prvid: proveedorId,
        prvrazon: $("razon").value.trim(),
        prvruc: $("ruc").value.trim(),
        prv_contrib: Number($("contribuyente").value),
        prv_naturaleza: Number($("naturaleza").value),
        tipo_documento: Number($("tipo_documento").value),
        prvtelefono: $("telefono").value.trim(),
        prvemail: $("email").value.trim(),
        prvcontacto: $("contacto").value.trim(),
        prvobserva: $("observaciones").value.trim()
    };
}

function estadoVacio() {
    return `
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
}

async function loadBatch(batchNumber) {
    const offset = batchNumber * RECORDS_PER_BATCH;
    DefaultFilter.texto = $("searchInput").value.trim();
    DefaultFilter.limit = RECORDS_PER_BATCH;
    DefaultFilter.offset = offset;

    const response = await postData(listProveedor, DefaultFilter, "Proveedor");
    if (response.success) {
        currentBatch = batchNumber;
        cachedData = response.objectsList || [];
        totalRecords = response.totalRecords || 0;
    }
}

function renderPaginationControls(totalPages) {
    const pagesContainer = $("proveedorPaginationPages");
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

function renderTable(data) {
    const tbody = $("tablaProveedores");
    tbody.innerHTML = "";

    if (data.length === 0) {
        hideLoader();
        tbody.innerHTML = estadoVacio();
        return;
    }

    data.forEach((proveedor) => {
        const fila = document.createElement("tr");
        fila.classList.add("sm");
        fila.innerHTML = `
            <td data-label="ID">${proveedor.prvid}</td>
            <td data-label="Razón Social">${proveedor.prvrazon || ""}</td>
            <td data-label="RUC/Documento">${proveedor.prvruc || ""}</td>
            <td class="hide-mobile" data-label="Contacto">${proveedor.prvcontacto || ""}</td>
            <td class="hide-mobile" data-label="Teléfono">${proveedor.prvtelefono || ""}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="ver" data-id="${proveedor.prvid}" title="Ver">
                        ${ICON_VER}
                    </button>
                    <button class="btn-icon" tipo-btn="editar" data-id="${proveedor.prvid}" title="Editar">
                        ${ICON_EDITAR}
                    </button>
                    <button class="btn-icon" tipo-btn="eliminar" data-id="${proveedor.prvid}" title="Eliminar">
                        ${ICON_ELIMINAR}
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });

    document.querySelectorAll('[tipo-btn="ver"]').forEach((button) => {
        button.addEventListener("click", () => {
            limpiar();
            modo = "VER";
            void getById(button.dataset.id);
        });
    });

    document.querySelectorAll('[tipo-btn="editar"]').forEach((button) => {
        button.addEventListener("click", () => {
            limpiar();
            modo = "UPD";
            void getById(button.dataset.id);
        });
    });

    document.querySelectorAll('[tipo-btn="eliminar"]').forEach((button) => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;
            confirmDelete({
                texto: "¿Está seguro de que desea eliminar el proveedor?",
                onEliminar: () => eliminar(id)
            });
        });
    });

    hideLoader();
}

function renderPage(pageNumber) {
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    pageNumber = pageNumber > totalPages ? totalPages : pageNumber;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    currentPage = pageNumber;
    const indexInBatch = (pageNumber - 1) % PAGES_PER_BATCH;
    const startIndex = indexInBatch * ROWS_PER_PAGE;
    const pageData = cachedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    $("pageinfo").textContent = `Total registros ${totalRecords}`;
    renderPaginationControls(totalPages);
    renderTable(pageData);
}

async function firstPage() {
    if (currentBatch !== 0) {
        await loadBatch(0);
    }
    renderPage(1);
}

async function previousPage() {
    if (currentPage > 1) {
        const newBatch = Math.floor((currentPage - 2) / PAGES_PER_BATCH);
        if (newBatch !== currentBatch) {
            await loadBatch(newBatch);
        }
        renderPage(currentPage - 1);
    }
}

async function nextPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    if (currentPage < totalPages) {
        const newBatch = Math.floor(currentPage / PAGES_PER_BATCH);
        if (newBatch !== currentBatch) {
            await loadBatch(newBatch);
        }
        renderPage(currentPage + 1);
    }
}

async function lastPage() {
    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);
    const lastBatch = Math.floor((totalPages - 1) / PAGES_PER_BATCH);
    if (lastBatch !== currentBatch) {
        await loadBatch(lastBatch);
    }
    renderPage(totalPages);
}

async function initPagination() {
    await loadBatch(0);
    renderPage(1);
}

async function insert() {
    const response = await postData(InsertProveedor, StringData(), "Proveedor");
    if (response.success) {
        await initPagination();
        limpiar();
        showSuccessToast("Registrado", "Proveedor registrado con éxito", 2000);
    }
}

async function update() {
    const response = await putData(UpdateProveedor, StringData(), "Proveedor");
    if (response.success) {
        await initPagination();
        closeModal();
        limpiar();
        showSuccessToast("Modificado", "Proveedor modificado con éxito", 2000);
    }
}

async function eliminar(id) {
    const response = await deleteData(`${DeleteProveedor}?id=${id}`, "Proveedor");
    if (response.success) {
        await initPagination();
        showSuccessToast("Eliminado", "Proveedor eliminado con éxito", 2000);
    }
}

async function getById(id) {
    $("btnGuardar").style.display = "";
    $("modalTitle").textContent = "Modificar Proveedor";

    if (modo === "VER") {
        $("btnGuardar").style.display = "none";
        $("modalTitle").textContent = "Visualizar Proveedor";
    }

    const response = await getData(`${getByIdProveedor}?id=${id}`, "Proveedor");
    if (!response.success) {
        return;
    }

    const proveedor = response.data || {};
    proveedorId = Number(proveedor.prvid || 0);
    $("tipo_documento").value = String(proveedor.tipo_documento ?? "9");
    $("ruc").value = proveedor.prvruc || "";
    $("razon").value = proveedor.prvrazon || "";
    $("contacto").value = proveedor.prvcontacto || "";
    $("naturaleza").value = String(proveedor.prv_naturaleza ?? "1");
    $("contribuyente").value = String(proveedor.prv_contrib ?? "1");
    $("email").value = proveedor.prvemail || "";
    $("telefono").value = proveedor.prvtelefono || "";
    $("observaciones").value = proveedor.prvobserva || "";

    actualizarContribuyenteSegunNaturaleza();
    actualizarTipoDocumentoUI();
    setSoloLecturaForm(modo === "VER");
    openModal();
}

async function buscarProveedorPorRuc() {
    try {
        const tipoDocumento = Number($("tipo_documento").value);
        const valorRuc = $("ruc").value.trim();
        const digitosRuc = valorRuc.replace(/\D/g, "");

        if (tipoDocumento !== 9 || digitosRuc.length <= 3 || modo === "VER") {
            return;
        }

        const proveedor = await SearchRuc(valorRuc);
        const datos = proveedor?.data?.[0];
        if (!datos) {
            return;
        }

        $("ruc").value = `${datos.ruc}-${datos.dv}`;
        if (!$("razon").value.trim()) {
            $("razon").value = datos.nombre || "";
        }
    } catch (error) {
        console.error("Error buscando proveedor por RUC:", error);
    }
}

function newProveedor() {
    limpiar();
    openModal();
}

async function init() {
    await renderTipoDocumentoOptions();
    limpiar();
    showLoader();
    await initPagination();

    $("btnNewProvider").addEventListener("click", newProveedor);
    $("btnCloseModal").addEventListener("click", closeModal);
    $("btnCancel").addEventListener("click", closeModal);
    $("btnpagPrimero").addEventListener("click", () => {
        void firstPage();
    });
    $("btnpagAnterior").addEventListener("click", () => {
        void previousPage();
    });
    $("btnpagSiguiente").addEventListener("click", () => {
        void nextPage();
    });
    $("btnpagUltimo").addEventListener("click", () => {
        void lastPage();
    });

    $("searchInput").addEventListener("input", () => {
        void initPagination();
    });

    $("tipo_documento").addEventListener("change", actualizarTipoDocumentoUI);
    $("naturaleza").addEventListener("change", actualizarContribuyenteSegunNaturaleza);
    $("ruc").addEventListener("input", normalizarDocumentoProveedor);
    $("ruc").addEventListener("blur", () => {
        void buscarProveedorPorRuc();
    });

    $("btnGuardar").addEventListener("click", async () => {
        if (!validarCampos($("providerForm"))) {
            return;
        }

        if (!validarNaturalezaContribuyente() || !validarDocumentoProveedor()) {
            return;
        }

        try {
            if (modo === "INS") {
                await insert();
            } else {
                await update();
            }
        } catch (error) {
            console.error(error);
        }
    });

    window.addEventListener("click", (event) => {
        if (event.target === $("providerModal")) {
            closeModal();
        }
    });
}

void init();
