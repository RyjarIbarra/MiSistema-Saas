import {
    DeleteAccess,
    getByIdAccess,
    InsertAccess,
    listAccess,
    menuByUser,
    UpdateAccess
} from "../../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData } from "../../../js/apiService.js";
import { cleanupLoader, hideLoader, showLoader } from "../../../js/loader.js";
import { confirmDelete } from "../../../js/confirm.js";
import { showSuccessToast, showWarningToast } from "../../../js/toast.js";
import { Enter, calcularFilasVisibles, dataRequiredClear, validarCampos } from "../../../js/utilidades.js";

const $ = (id) => document.getElementById(id);

let accessOptions = [];
let levels = [];
let filteredLevels = [];
let permissionsDraft = [];
let mode = "INS";
let currentLevelId = 0;
let filasPorPagina = 10;
const paginasPorBatch = 10;

const defaultFilter = {
    texto: "",
    limit: 100,
    offset: 0
};

Enter();
cleanupLoader();

function normalizeOptionsFromMenu(menuModules = []) {
    return (menuModules || [])
        .flatMap((moduleItem) => (moduleItem.children || []).map((child) => ({
            key: child.key,
            module: child.module || moduleItem.module,
            option: child.label,
            moduleSortOrder: moduleItem.sort_order ?? 0,
            optionSortOrder: child.sort_order ?? 0
        })))
        .filter((item) => item.key && item.module && item.option)
        .sort((a, b) => {
            if (a.moduleSortOrder !== b.moduleSortOrder) {
                return a.moduleSortOrder - b.moduleSortOrder;
            }
            if (a.module !== b.module) {
                return a.module.localeCompare(b.module, "es");
            }
            if (a.optionSortOrder !== b.optionSortOrder) {
                return a.optionSortOrder - b.optionSortOrder;
            }
            return a.option.localeCompare(b.option, "es");
        });
}

async function loadAccessOptions() {
    const response = await getData(menuByUser, "Opciones del sistema");
    accessOptions = normalizeOptionsFromMenu(response.objectsList || response.data || []);
    return accessOptions;
}

function buildDefaultPermissions() {
    return accessOptions.map((item) => ({
        key: item.key,
        module: item.module,
        option: item.option,
        moduleSortOrder: item.moduleSortOrder ?? 0,
        optionSortOrder: item.optionSortOrder ?? 0,
        view: false,
        create: false,
        update: false,
        delete: false
    }));
}

function syncPermissions(level) {
    const currentMap = new Map((level.permissions || []).map((permission) => [permission.key, permission]));
    return accessOptions.map((item) => {
        const existing = currentMap.get(item.key);
        return {
            key: item.key,
            module: item.module,
            option: item.option,
            moduleSortOrder: item.moduleSortOrder ?? existing?.moduleSortOrder ?? 0,
            optionSortOrder: item.optionSortOrder ?? existing?.optionSortOrder ?? 0,
            view: existing?.view ?? false,
            create: existing?.create ?? false,
            update: existing?.update ?? false,
            delete: existing?.delete ?? false
        };
    });
}

async function loadLevels() {
    defaultFilter.texto = $("searchInput").value.trim();
    defaultFilter.limit = filasPorPagina * paginasPorBatch;
    defaultFilter.offset = 0;

    const response = await postData(listAccess, defaultFilter, "Niveles de acceso");
    levels = (response.objectsList || []).map((level) => ({
        ...level,
        id: level.id ?? level.accid ?? level.access_id ?? 0,
        name: level.name ?? level.nombre ?? "",
        description: level.description ?? level.descripcion ?? "",
        active: (level.active ?? level.activo) !== false,
        permissions: Array.isArray(level.permissions) ? level.permissions : []
    }));
    filteredLevels = [...levels];
}

function permissionCount(level) {
    return (level.permissions || []).reduce((total, permission) => (
        total +
        (permission.view ? 1 : 0) +
        (permission.create ? 1 : 0) +
        (permission.update ? 1 : 0) +
        (permission.delete ? 1 : 0)
    ), 0);
}

function filterLevelsLocally() {
    const text = $("searchInput").value.trim().toLowerCase();
    filteredLevels = levels.filter((level) => (
        !text ||
        (level.name || "").toLowerCase().includes(text) ||
        (level.description || "").toLowerCase().includes(text)
    ));
    renderLevels();
}

function renderEmptyLevels() {
    $("tablaNiveles").innerHTML = `
        <tr>
            <td colspan="5">
                <div class="empty-state">
                    <i class="fa-solid fa-shield-halved"></i>
                    <h3>No se encontraron niveles</h3>
                    <p>Crea un nivel para comenzar a configurar accesos por opción.</p>
                </div>
            </td>
        </tr>
    `;
}

function renderLevels() {
    const tbody = $("tablaNiveles");
    tbody.innerHTML = "";

    if (!filteredLevels.length) {
        renderEmptyLevels();
        return;
    }

    filteredLevels.forEach((level) => {
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.innerHTML = `
            <td data-label="ID">${level.id}</td>
            <td data-label="Nivel">
                <div class="access-level-name">${level.name}</div>
            </td>
            <td data-label="Descripción">${level.description || ""}</td>
            <td data-label="Estado">
                ${level.active ? "Activo" : "Inactivo"}
            </td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="verNivel" data-id="${level.id}" title="Ver">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="editarNivel" data-id="${level.id}" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="duplicarNivel" data-id="${level.id}" title="Duplicar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarNivel" data-id="${level.id}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('[tipo-btn="verNivel"]').forEach((button) => {
        button.addEventListener("click", () => openLevelModal("VER", Number(button.dataset.id)));
    });
    document.querySelectorAll('[tipo-btn="editarNivel"]').forEach((button) => {
        button.addEventListener("click", () => openLevelModal("UPD", Number(button.dataset.id)));
    });
    document.querySelectorAll('[tipo-btn="duplicarNivel"]').forEach((button) => {
        button.addEventListener("click", () => duplicateLevel(Number(button.dataset.id)));
    });
    document.querySelectorAll('[tipo-btn="eliminarNivel"]').forEach((button) => {
        button.addEventListener("click", () => {
            confirmDelete({
                texto: "¿Está seguro de que desea eliminar el nivel de acceso?",
                onEliminar: () => removeLevel(Number(button.dataset.id))
            });
        });
    });
}

function groupPermissions(items) {
    const groups = new Map();
    items.forEach((item) => {
        if (!groups.has(item.module)) {
            groups.set(item.module, {
                sortOrder: item.moduleSortOrder ?? 0,
                items: []
            });
        }
        groups.get(item.module).items.push(item);
    });
    return Array.from(groups.entries())
        .sort((a, b) => {
            if (a[1].sortOrder !== b[1].sortOrder) {
                return a[1].sortOrder - b[1].sortOrder;
            }
            return a[0].localeCompare(b[0], "es");
        })
        .map(([moduleName, group]) => [moduleName, group.items]);
}

function renderPermissionSummary() {
    const enabledOptions = permissionsDraft.filter((permission) => (
        permission.view || permission.create || permission.update || permission.delete
    )).length;
    const totalPermissions = permissionCount({ permissions: permissionsDraft });
    $("permissionSummary").innerHTML = `
        <span class="summary-pill">Opciones configuradas: ${enabledOptions} / ${permissionsDraft.length}</span>
        <span class="summary-pill summary-pill-strong">Permisos activos: ${totalPermissions}</span>
    `;
}

function createSwitch(permissionKey, action, checked) {
    return `
        <label class="switch switch-sm">
            <input type="checkbox" class="permission-toggle" data-key="${permissionKey}" data-action="${action}" ${checked ? "checked" : ""}>
            <span class="slider"></span>
        </label>
    `;
}

function getVisiblePermissions(searchText = $("permissionSearch").value.trim().toLowerCase()) {
    return permissionsDraft.filter((permission) => (
        !searchText ||
        permission.module.toLowerCase().includes(searchText) ||
        permission.option.toLowerCase().includes(searchText)
    ));
}

function renderPermissions() {
    const items = getVisiblePermissions();
    const grouped = groupPermissions(items);
    const tbody = $("permissionsTableBody");
    tbody.innerHTML = "";

    if (!grouped.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state compact-empty-state">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <h3>Sin coincidencias</h3>
                        <p>Prueba con otro texto para ubicar una opción del sistema.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    grouped.forEach(([moduleName, permissions]) => {
        const moduleRow = document.createElement("tr");
        moduleRow.className = "module-row";
        moduleRow.innerHTML = `
            <td colspan="6">
                <div class="module-row-content">
                    <span class="module-pill">${moduleName}</span>
                </div>
            </td>
        `;
        tbody.appendChild(moduleRow);

        permissions.forEach((permission) => {
            const row = document.createElement("tr");
            row.className = "sm";
            row.innerHTML = `
                <td data-label="Módulo">${permission.module}</td>
                <td data-label="Opción">${permission.option}</td>
                <td class="center" data-label="Vista">${createSwitch(permission.key, "view", permission.view)}</td>
                <td class="center" data-label="Guardar">${createSwitch(permission.key, "create", permission.create)}</td>
                <td class="center" data-label="Modificar">${createSwitch(permission.key, "update", permission.update)}</td>
                <td class="center" data-label="Eliminar">${createSwitch(permission.key, "delete", permission.delete)}</td>
            `;
            tbody.appendChild(row);
        });
    });

    const isReadOnly = mode === "VER";
    document.querySelectorAll(".permission-toggle").forEach((checkbox) => {
        checkbox.disabled = isReadOnly;
        checkbox.addEventListener("change", handlePermissionToggle);
    });
}

function handlePermissionToggle(event) {
    const { key, action } = event.target.dataset;
    const permission = permissionsDraft.find((item) => item.key === key);
    if (!permission) {
        return;
    }
    permission[action] = event.target.checked;
    renderPermissionSummary();
}

function setFormDisabled(disabled) {
    document.querySelectorAll("#accessLevelForm input, #accessLevelForm select").forEach((field) => {
        field.disabled = disabled;
    });
    document.querySelectorAll(".permission-toggle").forEach((field) => {
        field.disabled = disabled;
    });
    document.querySelectorAll("[data-bulk-action]").forEach((button) => {
        button.disabled = disabled;
    });
    $("permissionSearch").disabled = disabled;
    $("btnGuardar").style.display = disabled ? "none" : "";
}

function clearForm() {
    currentLevelId = 0;
    mode = "INS";
    $("accessLevelForm").reset();
    $("nivelActivo").value = "true";
    $("permissionSearch").value = "";
    permissionsDraft = buildDefaultPermissions();
    dataRequiredClear();
    renderPermissions();
    renderPermissionSummary();
    setFormDisabled(false);
}

function openModal() {
    $("accessLevelModal").classList.add("active");
    setTimeout(() => $("nivelNombre").focus(), 150);
}

function closeModal() {
    $("accessLevelModal").classList.remove("active");
}

async function openLevelModal(nextMode, levelId = 0) {
    clearForm();
    mode = nextMode;

    if (nextMode === "INS") {
        $("modalTitle").textContent = "Nuevo Nivel de Acceso";
        openModal();
        return;
    }

    try {
        showLoader();
        const response = await getData(`${getByIdAccess}?id=${levelId}`, "Nivel de acceso");
        const level = response.data;

        currentLevelId = level.id;
        $("nivelNombre").value = level.name;
        $("nivelDescripcion").value = level.description || "";
        $("nivelActivo").value = String(level.active);
        $("permissionSearch").value = "";
        permissionsDraft = syncPermissions(level);

        if (nextMode === "VER") {
            $("modalTitle").textContent = `Visualizar Nivel: ${level.name}`;
            renderPermissions();
            renderPermissionSummary();
            setFormDisabled(true);
        } else {
            $("modalTitle").textContent = `Modificar Nivel: ${level.name}`;
            renderPermissions();
            renderPermissionSummary();
            setFormDisabled(false);
        }

        openModal();
    } catch (error) {
        console.error(error);
        showWarningToast("Atención", "No se pudo cargar el nivel seleccionado.", 2500);
    } finally {
        hideLoader();
    }
}

function collectFormData() {
    return {
        id: currentLevelId || 0,
        name: $("nivelNombre").value.trim(),
        description: $("nivelDescripcion").value.trim(),
        active: $("nivelActivo").value === "true",
        permissions: permissionsDraft.map((permission) => ({ ...permission }))
    };
}

async function upsertLevel() {
    if (!validarCampos($("accessLevelForm"))) {
        return;
    }

    if (!permissionsDraft.length) {
        showWarningToast("Atención", "No hay opciones disponibles para configurar permisos.", 2500);
        return;
    }

    const formData = collectFormData();

    if (!permissionsDraft.some((permission) => (
        permission.view || permission.create || permission.update || permission.delete
    ))) {
        showWarningToast("Atención", "Configura al menos un permiso antes de guardar el nivel.", 2500);
        return;
    }

    try {
        showLoader();
        if (mode === "INS") {
            await postData(InsertAccess, formData, "Nivel de acceso");
            showSuccessToast("Registrado", "Nivel de acceso registrado con éxito", 2000);
        } else {
            await putData(UpdateAccess, formData, "Nivel de acceso");
            showSuccessToast("Modificado", "Nivel de acceso modificado con éxito", 2000);
        }

        await refreshLevels();
        closeModal();
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }
}

async function removeLevel(levelId) {
    try {
        showLoader();
        const response = await deleteData(`${DeleteAccess}?id=${levelId}`, "Nivel de acceso");
        if (response.success) {
            await refreshLevels();
            showSuccessToast("Eliminado", "Nivel de acceso eliminado con éxito", 2000);
        }
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }
}

async function duplicateLevel(levelId) {
    try {
        showLoader();
        const response = await getData(`${getByIdAccess}?id=${levelId}`, "Nivel de acceso");
        const level = response.data;
        const copy = {
            id: 0,
            name: `${level.name} - Copia`,
            description: level.description || "",
            active: level.active !== false,
            permissions: syncPermissions(level)
        };
        await postData(InsertAccess, copy, "Nivel de acceso");
        await refreshLevels();
        showSuccessToast("Duplicado", "Nivel de acceso duplicado con éxito", 2000);
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }
}

function applyBulkAction(action) {
    const visiblePermissions = getVisiblePermissions();
    const visibleKeys = new Set(visiblePermissions.map((permission) => permission.key));
    const shouldEnable = visiblePermissions.some((permission) => !permission[action]);

    permissionsDraft = permissionsDraft.map((permission) => (
        visibleKeys.has(permission.key)
            ? { ...permission, [action]: shouldEnable }
            : permission
    ));

    renderPermissions();
    renderPermissionSummary();
}

async function refreshLevels() {
    await loadLevels();
    filterLevelsLocally();
}

$("btnNewLevel").addEventListener("click", () => openLevelModal("INS"));
$("btnCloseModal").addEventListener("click", closeModal);
$("btnCancel").addEventListener("click", closeModal);
$("btnGuardar").addEventListener("click", upsertLevel);
$("searchInput").addEventListener("input", filterLevelsLocally);
$("permissionSearch").addEventListener("input", renderPermissions);
document.querySelectorAll("[data-bulk-action]").forEach((button) => {
    button.addEventListener("click", () => applyBulkAction(button.dataset.bulkAction));
});

window.onclick = function (event) {
    if (event.target === $("accessLevelModal")) {
        closeModal();
    }
};

async function init() {
    try {
        showLoader();
        await loadAccessOptions();
        filasPorPagina = Math.max(calcularFilasVisibles(), 10);

        if (!accessOptions.length) {
            showWarningToast("Atención", "No se encontraron opciones disponibles en el menú del usuario.", 3500);
        }

        permissionsDraft = buildDefaultPermissions();
        renderPermissions();
        renderPermissionSummary();
        await refreshLevels();
    } catch (error) {
        console.error("Error inicializando niveles de acceso:", error);
    } finally {
        hideLoader();
    }
}

init();
