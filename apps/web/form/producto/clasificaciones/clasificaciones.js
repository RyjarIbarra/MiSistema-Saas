import {
    DeleteCategoria,
    DeleteFamilia,
    DeleteMarca,
    DeleteUbicacion,
    getByIdCategoria,
    getByIdFamilia,
    getByIdMarca,
    getByIdUbicacion,
    InsertCategoria,
    InsertFamilia,
    InsertMarca,
    InsertUbicacion,
    listCategoria,
    listFamilia,
    listMarca,
    listUbicacion,
    UpdateCategoria,
    UpdateFamilia,
    UpdateMarca,
    UpdateUbicacion
} from "../../../js/apiEndpoints.js";
import { confirmDelete } from "../../../js/confirm.js";
import { deleteData, getData, postData, putData } from "../../../js/apiService.js";
import { cleanupLoader, hideLoader, showLoader } from "../../../js/loader.js";
import { showSuccessToast } from "../../../js/toast.js";
import { dataRequiredClear, Enter, Tab, validarCampos } from "../../../js/utilidades.js";

const $ = (id) => document.getElementById(id);
const setVal = (id, val) => $(id).value = val;

const DEFAULT_FILTER = {
    texto: "",
    limit: 0,
    offset: 0
};

let modoFamilia = "INS";
let modoCategoria = "INS";
let modoMarca = "INS";
let modoUbicacion = "INS";
let familiaId = 0;
let categoriaId = 0;
let marcaId = 0;
let ubicacionId = 0;
let familiasCache = [];

Enter();
Tab();
cleanupLoader();
showLoader();

function renderEmptyState(tbodyId, colspan, texto = "Este maestro todavía no tiene registros cargados.") {
    const tbody = $(tbodyId);
    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="${colspan}">
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>No se encontraron datos</h3>
                    <p>${texto}</p>
                </div>
            </td>
        </tr>
    `;
}

function cargarOptionsFamilia(familias = familiasCache, selectedValue = "") {
    $("categoriaFamilia").innerHTML = '<option value="">Seleccionar...</option>' +
        familias.map((item) => (
            `<option value="${item.fam_id}">${item.fam_nom}</option>`
        )).join("");
    $("categoriaFamilia").value = selectedValue || "";
}

function obtenerNombreFamilia(famId) {
    const familia = familiasCache.find((item) => String(item.fam_id) === String(famId));
    return familia?.fam_nom || "";
}

function stringDataFamilia() {
    return {
        fam_id: familiaId,
        fam_nom: $("familiaNombre").value.trim(),
        fam_desc: $("familiaDescripcion").value.trim() || null
    };
}

function stringDataCategoria() {
    return {
        cat_id: categoriaId,
        cat_nom: $("categoriaNombre").value.trim(),
        cat_desc: $("categoriaDescripcion").value.trim() || null,
        fam_id: Number($("categoriaFamilia").value)
    };
}

function stringDataMarca() {
    return {
        mar_id: marcaId,
        mar_nom: $("marcaNombre").value.trim(),
        mar_desc: $("marcaDescripcion").value.trim()
    };
}

function stringDataUbicacion() {
    return {
        ubi_id: ubicacionId,
        ubi_codigo: $("ubicacionCodigo").value.trim() || null,
        ubi_ubicacion: $("ubicacionNombre").value.trim(),
        ubi_referencia: $("ubicacionDescripcion").value.trim()
    };
}

function limpiarFamilia() {
    familiaId = 0;
    modoFamilia = "INS";
    $("familiaForm").reset();
    $("btnAgregarFamilia").innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => $("familiaNombre").focus(), 100);
}

function limpiarCategoria() {
    categoriaId = 0;
    modoCategoria = "INS";
    $("categoriaForm").reset();
    cargarOptionsFamilia();
    $("btnAgregarCategoria").innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => $("categoriaFamilia").focus(), 100);
}

function limpiarMarca() {
    marcaId = 0;
    modoMarca = "INS";
    $("marcaForm").reset();
    $("btnAgregarMarca").innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => $("marcaNombre").focus(), 100);
}

function limpiarUbicacion() {
    ubicacionId = 0;
    modoUbicacion = "INS";
    $("ubicacionForm").reset();
    $("btnAgregarUbicacion").innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => $("ubicacionCodigo").focus(), 100);
}

async function listFamilias() {
    const response = await postData(listFamilia, DEFAULT_FILTER);
    if (response.success) {
        familiasCache = response.objectsList || [];
        cargarOptionsFamilia(familiasCache);
        renderTableFamilias(familiasCache);
        return familiasCache;
    }
    familiasCache = [];
    cargarOptionsFamilia([]);
    renderEmptyState("familiaTableBody", 4);
    return [];
}

function renderTableFamilias(familias) {
    const tbody = $("familiaTableBody");
    tbody.innerHTML = "";

    if (!familias.length) {
        renderEmptyState("familiaTableBody", 4);
        return;
    }

    familias.forEach((item) => {
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.innerHTML = `
            <td data-label="ID">${item.fam_id}</td>
            <td data-label="Familia">${item.fam_nom}</td>
            <td data-label="Descripción">${item.fam_desc || ""}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarFamilia" data-id="${item.fam_id}" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarFamilia" data-id="${item.fam_id}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('[tipo-btn="editarFamilia"]').forEach((button) => {
        button.addEventListener("click", () => {
            modoFamilia = "UPD";
            $("btnAgregarFamilia").innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getByIdFamiliaData(button.dataset.id);
        });
    });

    document.querySelectorAll('[tipo-btn="eliminarFamilia"]').forEach((button) => {
        button.addEventListener("click", () => {
            confirmDelete({
                texto: "¿Está seguro de que desea eliminar la familia?",
                onEliminar: () => eliminarFamilia(button.dataset.id)
            });
        });
    });
}

async function insertFamilia() {
    const response = await postData(InsertFamilia, stringDataFamilia(), "Familia");
    if (response.success) {
        await listFamilias();
        limpiarFamilia();
        showSuccessToast("Registrado", "Familia registrada con éxito", 2000);
    }
}

async function updateFamilia() {
    const response = await putData(UpdateFamilia, stringDataFamilia(), "Familia");
    if (response.success) {
        await listFamilias();
        limpiarFamilia();
        showSuccessToast("Modificado", "Familia modificada con éxito", 2000);
    }
}

async function getByIdFamiliaData(id) {
    const response = await getData(`${getByIdFamilia}?id=${id}`);
    if (response.success) {
        const familia = response.data;
        setVal("familiaNombre", familia.fam_nom);
        setVal("familiaDescripcion", familia.fam_desc || "");
        familiaId = familia.fam_id;
    }
}

async function eliminarFamilia(id) {
    const response = await deleteData(`${DeleteFamilia}?id=${id}`, "Familia");
    if (response.success) {
        await listFamilias();
        showSuccessToast("Eliminado", "Familia eliminada con éxito", 2000);
    }
}

async function listCategorias() {
    const response = await postData(listCategoria, DEFAULT_FILTER);
    if (response.success) {
        renderTableCategorias(response.objectsList || []);
        return;
    }
    renderEmptyState("categoriaTableBody", 5);
}

function renderTableCategorias(categorias) {
    const tbody = $("categoriaTableBody");
    tbody.innerHTML = "";

    if (!categorias.length) {
        renderEmptyState("categoriaTableBody", 5);
        return;
    }

    categorias.forEach((item) => {
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.innerHTML = `
            <td data-label="ID">${item.cat_id}</td>
            <td data-label="Familia">${item.fam_nom || obtenerNombreFamilia(item.fam_id) || ""}</td>
            <td data-label="Categoría">${item.cat_nom}</td>
            <td data-label="Descripción">${item.cat_desc || ""}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarCategoria" data-id="${item.cat_id}" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarCategoria" data-id="${item.cat_id}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('[tipo-btn="editarCategoria"]').forEach((button) => {
        button.addEventListener("click", () => {
            modoCategoria = "UPD";
            $("btnAgregarCategoria").innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getByIdCategoriaData(button.dataset.id);
        });
    });

    document.querySelectorAll('[tipo-btn="eliminarCategoria"]').forEach((button) => {
        button.addEventListener("click", () => {
            confirmDelete({
                texto: "¿Está seguro de que desea eliminar la categoría?",
                onEliminar: () => eliminarCategoria(button.dataset.id)
            });
        });
    });
}

async function insertCategoria() {
    const response = await postData(InsertCategoria, stringDataCategoria(), "Categoría");
    if (response.success) {
        await listCategorias();
        limpiarCategoria();
        showSuccessToast("Registrado", "Categoría registrada con éxito", 2000);
    }
}

async function updateCategoria() {
    const response = await putData(UpdateCategoria, stringDataCategoria(), "Categoría");
    if (response.success) {
        await listCategorias();
        limpiarCategoria();
        showSuccessToast("Modificado", "Categoría modificada con éxito", 2000);
    }
}

async function getByIdCategoriaData(id) {
    const response = await getData(`${getByIdCategoria}?id=${id}`);
    if (response.success) {
        const categoria = response.data;
        setVal("categoriaNombre", categoria.cat_nom);
        setVal("categoriaDescripcion", categoria.cat_desc || "");
        cargarOptionsFamilia(familiasCache, categoria.fam_id ? String(categoria.fam_id) : "");
        categoriaId = categoria.cat_id;
    }
}

async function eliminarCategoria(id) {
    const response = await deleteData(`${DeleteCategoria}?id=${id}`, "Categoría");
    if (response.success) {
        await listCategorias();
        showSuccessToast("Eliminado", "Categoría eliminada con éxito", 2000);
    }
}

async function listMarcas() {
    const response = await postData(listMarca, DEFAULT_FILTER);
    if (response.success) {
        renderTableMarcas(response.objectsList || []);
        return;
    }
    renderEmptyState("marcaTableBody", 4);
}

function renderTableMarcas(marcas) {
    const tbody = $("marcaTableBody");
    tbody.innerHTML = "";

    if (!marcas.length) {
        renderEmptyState("marcaTableBody", 4);
        return;
    }

    marcas.forEach((item) => {
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.innerHTML = `
            <td data-label="ID">${item.mar_id}</td>
            <td data-label="Marca">${item.mar_nom}</td>
            <td data-label="Descripción">${item.mar_desc || ""}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarMarca" data-id="${item.mar_id}" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarMarca" data-id="${item.mar_id}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('[tipo-btn="editarMarca"]').forEach((button) => {
        button.addEventListener("click", () => {
            modoMarca = "UPD";
            $("btnAgregarMarca").innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getByIdMarcaData(button.dataset.id);
        });
    });

    document.querySelectorAll('[tipo-btn="eliminarMarca"]').forEach((button) => {
        button.addEventListener("click", () => {
            confirmDelete({
                texto: "¿Está seguro de que desea eliminar la marca?",
                onEliminar: () => eliminarMarca(button.dataset.id)
            });
        });
    });
}

async function insertMarca() {
    const response = await postData(InsertMarca, stringDataMarca(), "Marca");
    if (response.success) {
        await listMarcas();
        limpiarMarca();
        showSuccessToast("Registrado", "Marca registrada con éxito", 2000);
    }
}

async function updateMarca() {
    const response = await putData(UpdateMarca, stringDataMarca(), "Marca");
    if (response.success) {
        await listMarcas();
        limpiarMarca();
        showSuccessToast("Modificado", "Marca modificada con éxito", 2000);
    }
}

async function getByIdMarcaData(id) {
    const response = await getData(`${getByIdMarca}?id=${id}`);
    if (response.success) {
        const marca = response.data;
        setVal("marcaNombre", marca.mar_nom);
        setVal("marcaDescripcion", marca.mar_desc || "");
        marcaId = marca.mar_id;
    }
}

async function eliminarMarca(id) {
    const response = await deleteData(`${DeleteMarca}?id=${id}`, "Marca");
    if (response.success) {
        await listMarcas();
        showSuccessToast("Eliminado", "Marca eliminada con éxito", 2000);
    }
}

async function listUbicaciones() {
    const response = await postData(listUbicacion, DEFAULT_FILTER);
    if (response.success) {
        renderTableUbicaciones(response.objectsList || []);
        return;
    }
    renderEmptyState("ubicacionTableBody", 5);
}

function renderTableUbicaciones(ubicaciones) {
    const tbody = $("ubicacionTableBody");
    tbody.innerHTML = "";

    if (!ubicaciones.length) {
        renderEmptyState("ubicacionTableBody", 5);
        return;
    }

    ubicaciones.forEach((item) => {
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.innerHTML = `
            <td data-label="ID">${item.ubi_id}</td>
            <td data-label="Código">${item.ubi_codigo || ""}</td>
            <td data-label="Ubicación">${item.ubi_ubicacion}</td>
            <td data-label="Referencia">${item.ubi_referencia || ""}</td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarUbicacion" data-id="${item.ubi_id}" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarUbicacion" data-id="${item.ubi_id}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('[tipo-btn="editarUbicacion"]').forEach((button) => {
        button.addEventListener("click", () => {
            modoUbicacion = "UPD";
            $("btnAgregarUbicacion").innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getByIdUbicacionData(button.dataset.id);
        });
    });

    document.querySelectorAll('[tipo-btn="eliminarUbicacion"]').forEach((button) => {
        button.addEventListener("click", () => {
            confirmDelete({
                texto: "¿Está seguro de que desea eliminar la ubicación?",
                onEliminar: () => eliminarUbicacion(button.dataset.id)
            });
        });
    });
}

async function insertUbicacion() {
    const data = stringDataUbicacion();
    delete data.ubi_id;
    const response = await postData(InsertUbicacion, data, "Ubicación");
    if (response.success) {
        await listUbicaciones();
        limpiarUbicacion();
        showSuccessToast("Registrado", "Ubicación registrada con éxito", 2000);
    }
}

async function updateUbicacion() {
    const response = await putData(UpdateUbicacion, stringDataUbicacion(), "Ubicación");
    if (response.success) {
        await listUbicaciones();
        limpiarUbicacion();
        showSuccessToast("Modificado", "Ubicación modificada con éxito", 2000);
    }
}

async function getByIdUbicacionData(id) {
    const response = await getData(`${getByIdUbicacion}?id=${id}`);
    if (response.success) {
        const ubicacion = response.data;
        setVal("ubicacionCodigo", ubicacion.ubi_codigo || "");
        setVal("ubicacionNombre", ubicacion.ubi_ubicacion || "");
        setVal("ubicacionDescripcion", ubicacion.ubi_referencia || "");
        ubicacionId = ubicacion.ubi_id;
    }
}

async function eliminarUbicacion(id) {
    const response = await deleteData(`${DeleteUbicacion}?id=${id}`, "Ubicación");
    if (response.success) {
        await listUbicaciones();
        showSuccessToast("Eliminado", "Ubicación eliminada con éxito", 2000);
    }
}

$("btnAgregarFamilia").addEventListener("click", async () => {
    if (!validarCampos($("familiaForm"))) {
        return;
    }
    if (modoFamilia === "INS") {
        await insertFamilia();
    } else {
        await updateFamilia();
    }
});

$("btnAgregarCategoria").addEventListener("click", async () => {
    if (!validarCampos($("categoriaForm"))) {
        return;
    }
    if (modoCategoria === "INS") {
        await insertCategoria();
    } else {
        await updateCategoria();
    }
});

$("btnAgregarMarca").addEventListener("click", async () => {
    if (!validarCampos($("marcaForm"))) {
        return;
    }
    if (modoMarca === "INS") {
        await insertMarca();
    } else {
        await updateMarca();
    }
});

$("btnAgregarUbicacion").addEventListener("click", async () => {
    if (!validarCampos($("ubicacionForm"))) {
        return;
    }
    if (modoUbicacion === "INS") {
        await insertUbicacion();
    } else {
        await updateUbicacion();
    }
});

await listFamilias();
await listCategorias();
await listMarcas();
await listUbicaciones();
hideLoader(); 
