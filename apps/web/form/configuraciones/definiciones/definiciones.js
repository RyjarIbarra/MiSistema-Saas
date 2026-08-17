import { actEstadoCaja, actEstadoTimbrado, DeleteCaja, DeleteDeposito, DeleteMoneda, DeleteSucursal, DeleteTimbrado, DeleteTipoPrecio, DeleteUnidad, getByIdCaja, getByIdDeposito, getByIdSucursal, getByIdTimbrado, getByIdTipoPrecio, InsertCaja, InsertDeposito, InsertMoneda, InsertSucursal, InsertTimbrado, InsertTipoPrecio, InsertUnidad, listCaja, listDeposito, listMoneda, listSucursal, listTimbrado, listTipoPrecio, listUnidad, UpdateCaja, UpdateDeposito, UpdateSucursal, UpdateTimbrado, UpdateTipoPrecio } from "../../../js/apiEndpoints.js";
import { deleteData, getData, postData, putData } from "../../../js/apiService.js";
import { confirmDelete } from "../../../js/confirm.js";
import { cleanupLoader, hideLoader, showLoader } from "../../../js/loader.js";
import { cargaOptionsTiposDocumento } from "../../../js/options.js";
import { showSuccessToast, showWarningToast } from "../../../js/toast.js";
import { configurarInputs, dataRequiredClear, Enter, formatearFecha, Tab, validarCampos } from "../../../js/utilidades.js";
import { MONEDAS_COMUNES, MONEDAS_SIFEN, buscarMoneda } from "./monedas-sifen.js";
import { UNIDADES_MEDIDA, buscarUnidadMedida } from "./unidades-medida.js";

const $ = (id) => document.getElementById(id);

const setVal = (id, val) => $(id).value = val;
const formatearNumeroTimbrado = (value) => {
    if (value === null || value === undefined || value === "") {
        return "";
    }
    return String(value).replace(/\D/g, "").padStart(7, "0");
};
const mostrarNumeroTimbrado = (value) => formatearNumeroTimbrado(value) || "-";

Enter();
cleanupLoader();
configurarInputs();
Tab();

// Timbrados

let modo = 'INS';
let timId = 0;
let timNroActual = "";
let DefaultFilter = {
    texto: "",
    limit: 0,
    offset: 0
};
const btnAgregar = $("btnAgregar");

async function cargarTiposDocumentoTimbrado() {
    $("timtipdoc").innerHTML = '<option value="">Seleccionar...</option>' + await cargaOptionsTiposDocumento();
}

async function listTimbrados() {
    const response = await postData(listTimbrado, DefaultFilter);
    if (response.success) {
        renderTablehtml(response.objectsList || []);
    }
}
listTimbrados();
showLoader();

async function renderTablehtml(timbrados) {
    const tableBody = $("timbradosTableBody");
    tableBody.innerHTML = "";
    if(timbrados.length === 0) {
        hideLoader(); 
        tableBody.innerHTML = `
            <tr>
                <td colspan="11">
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

    timbrados.forEach(timbrado => {
        const row = document.createElement("tr");
        row.classList.add('sm')
        row.innerHTML = `
            <td data-label="ID">${timbrado.timid}</td>
            <td data-label="Documento">${timbrado.timtipdoc}</td>
            <td data-label="Timbrado">${timbrado.timnumero}</td>
            <td data-label="Fecha Inicio">${timbrado.timfecini ? formatearFecha(timbrado.timfecini) : 'Sin Vencimiento'}</td>    
            <td data-label="Fecha Venc.">${timbrado.timfecvto ? formatearFecha(timbrado.timfecvto) : 'Sin Vencimiento'}</td>
            <td data-label="Sucursal">${timbrado.timestab}</td>
            <td data-label="Punto Exp.">${timbrado.timpunexp}</td>
            <td data-label="Nº Desde">${mostrarNumeroTimbrado(timbrado.timnrodesde)}</td>
            <td data-label="Nº Hasta">${mostrarNumeroTimbrado(timbrado.timnrohasta)}</td>
            <td data-label="Nº Actual">${mostrarNumeroTimbrado(timbrado.timnroactual)}</td>
            <td data-label="Acciones">
                <div class="action-buttons">                                        
                    <button class="btn-icon" tipo-btn="editar" data-id="${timbrado.timid}" title="Editar" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminar" data-id="${timbrado.timid}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    <label class="switch">
                        <input type="checkbox" data-id="${timbrado.timid}" ${timbrado.timactivo ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>                                        
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminar"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;                
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el timbrado?`,
                onEliminar: () => eliminar(id)
            });
        });
    });  

    const botonesModificar = document.querySelectorAll('[tipo-btn="editar"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;  
            modo = 'UPD';
            btnAgregar.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getById(id);
        });
    });    

    document.querySelectorAll('#timbradosTableBody .switch input').forEach(checkbox => {
        checkbox.addEventListener('change', async function(event) {
            const timId = event.target.getAttribute('data-id');
            const activo = event.target.checked;
            actEstadoTim(timId, activo);
        });
    });    

    hideLoader(); 
}

function StringData() {
    const esElectronico = $("timmodalid").value === "E";
    const formData = {
        timid: timId,
        timtipdoc: $("timtipdoc").value,
        timnumero: $("timnumero").value.trim(),
        timfecini: $("timfecini").value.trim(),
        timmodalid: $("timmodalid").value,
        timfecvto: esElectronico ? null : ($("timfecvto").value.trim() || null),
        timestab: $("timestab").value.trim(),
        timpunexp: $("timpunexp").value.trim(),
        timnrodesde: esElectronico ? null : ($("timnrodesde").value.trim() || "0000001"),
        timnrohasta: esElectronico ? null : ($("timnrohasta").value.trim() || "1000000"),
        timnroactual: esElectronico
            ? null
            : (timNroActual || $("timnrodesde").value.trim() || "0000001"),
        timactivo: true
    }
    return formData;
}

async function insert() {
    try {        
        const response = await postData(InsertTimbrado, StringData(), "Timbrado");
        if (response.success) {
            listTimbrados();
            limpiar();
            showSuccessToast("Registrado","Timbrado registrado con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertTimbrado:", error);
    }
}

async function update() {
    try {
        const response = await putData(UpdateTimbrado, StringData(), "Timbrado");
        if (response.success) {
            listTimbrados();
            limpiar();
            showSuccessToast("Modificado","Timbrado modificado con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en updateTimbrado:", error);
    }    
}

async function getById(id) {
    try {
        const response = await getData(`${getByIdTimbrado}?id=${id}`);
        if (response.success) {
            const timbrado = response.data;
            verTipoComprobante(timbrado.timtipdoc);
            setVal("timtipdoc", timbrado.timtipdoc);
            setVal("timnumero", timbrado.timnumero);
            setVal("timfecini", timbrado.timfecini || '');
            setVal("timmodalid", timbrado.timmodalid || "P");
            setVal("timfecvto", timbrado.timfecvto || '');
            setVal("timestab", timbrado.timestab);
            setVal("timpunexp", timbrado.timpunexp);
            setVal("timnrodesde", formatearNumeroTimbrado(timbrado.timnrodesde));
            setVal("timnrohasta", formatearNumeroTimbrado(timbrado.timnrohasta));
            timNroActual = formatearNumeroTimbrado(timbrado.timnroactual);
            aplicarModalidadTimbrado();
            timId = timbrado.timid;            
        }
    } catch (error) {
        console.error("Error en getByidTimbrado:", error);
    }    
}

async function eliminar(id) {
    try {
        const response = await deleteData(`${DeleteTimbrado}?id=${id}`, "Timbrado");
        if (response.success) {
            listTimbrados();    
            showSuccessToast("Eliminado","Timbrado eliminado con éxito", 2000);        
        }
    } catch (error) {
        console.error("Error en eliminarTimbrado:", error);
    }
}

// function validarLargoCampos() {
//   const validaciones = [
//     { id: 'timbrado', largo: 8, nombre: 'Timbrado' },
//     { id: 'timsuc', largo: 3, nombre: 'Sucursal' },
//     { id: 'timcaja', largo: 3, nombre: 'Caja' },
//     { id: 'timdesde', largo: 7, nombre: 'Nº Desde' },
//     { id: 'timhasta', largo: 7, nombre: 'Nº Hasta' },
//   ];
  
//   for (let validacion of validaciones) {
//     const campo = document.getElementById(validacion.id);
//     if (campo.value.length !== validacion.largo) {      
//        showWarningToast(`${validacion.nombre} inválido`, `El campo ${validacion.nombre} debe tener exactamente ${validacion.largo} caracteres`,5000);
//       campo.focus();
//       return false;
//     }
//   }
  
//   return true;
// }

function validarLargoCampos(form) {
  const campos = form.querySelectorAll(`[data-longitud]:not([disabled])`);
  
  for (let campo of campos) {
    
    const largoRequerido = parseInt(campo.dataset[`longitud`]);
    const nombre = campo.dataset.nombre;
    
    if (campo.value.length !== largoRequerido) {
        showWarningToast(`${nombre} inválido`, `El campo ${nombre} debe tener exactamente ${largoRequerido} caracteres`,5000);
        campo.focus();
        return false;
    }

  }
  
  return true;
}

function validarFechaVencimiento() {
  const fechaVencimiento = $("timfecvto");

  if (fechaVencimiento.disabled) {
    return true;
  }
  
  if (!fechaVencimiento.value) {
    showWarningToast('Fecha inválida', 'Debe ingresar una fecha de vencimiento',5000);   
    fechaVencimiento.focus();
    return false;
  }
  
  const fechaVenc = new Date(fechaVencimiento.value + 'T00:00:00');
  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fecha
  
  if (fechaVenc < fechaActual) {
    showWarningToast('Fecha inválida', 'Fecha de vencimiento inválida. No se puede registrar un timbrado vencido',5000);
    fechaVencimiento.focus();
    return false;
  }
  
  return true;
}

function validarRangoNumeros() {
    const desde = $("timnrodesde");
    const hasta = $("timnrohasta");

    if(desde.disabled || hasta.disabled) {
        return true;
    }
  
    if (!desde.value || !hasta.value) {
      showWarningToast('Rango inválido', 'Debe completar ambos campos: Desde y Hasta',5000);
      return false;
    }
    
    const numDesde = parseInt(desde.value);
    const numHasta = parseInt(hasta.value);
    
    if (numHasta <= numDesde) {
        showWarningToast('Rango inválido', 'El campo "Hasta" debe ser mayor que el campo "Desde"',5000);
        hasta.focus();
        return false;
    }
  
    if(numDesde > 0 && numHasta > 0) {
        return true;
    }
  
    showWarningToast('Rango inválido', 'Debe ingresar valores numéricos positivos en todos los campos',5000);
    return false;
}

function validarCajaSucursal() {
    const caja = $("timpunexp");
    const sucursal = $("timestab");

    if(caja.disabled && sucursal.disabled) {
        return true;
    }

    if (!caja.value || !sucursal.value) {
      showWarningToast('Rango inválido', 'Debe completar ambos campos: Caja y Sucursal',5000);
      return false;
    }

    const numCaja = parseInt(caja.value);
    const numSucursal = parseInt(sucursal.value);

    if(numCaja > 0 && numSucursal > 0) {
        return true;
    }   
    
    showWarningToast('Rango inválido', 'Debe ingresar valores numéricos positivos en todos los campos',5000);
    return false;    
}

async function actEstadoTim(id, activo) {
    try {        
        const response = await getData(`${actEstadoTimbrado}?id=${id}`);
        if (response.success) {            
            showSuccessToast("Estado Actualizado","Timbrado actualizado con éxito", 1000);
        }
    } catch (error) {
        console.log("Error en actEstadoTimbrado:", error);
    }
}

function limpiar() {
    timId = 0;
    timNroActual = "";
    modo = "INS";
    $("timbradoForm").reset();    
    $("timmodalid").value = "P";
    btnAgregar.innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => {
        $("timtipdoc").focus();
    }, 100);
    aplicarModalidadTimbrado();
}

async function inicializarTimbrados() {
    await cargarTiposDocumentoTimbrado();
    limpiar();
}

void inicializarTimbrados();


btnAgregar.addEventListener("click", function() {
    const miFormulario = $("timbradoForm");
    if(!validarLargoCampos(miFormulario) || !validarFechaVencimiento() || !validarCampos(miFormulario) || !validarRangoNumeros() || !validarCajaSucursal()) {
        return;
    }
    if(modo === "INS") {
        insert();  
    } else {
        update();
    }     
});

// Agregar evento para Enter
btnAgregar.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        btnAgregar.click();
    }
});

$("timtipdoc").addEventListener("change", function(event) {
    const tipoDocumento = event.target.value;
    verTipoComprobante(tipoDocumento);
});

$("timmodalid").addEventListener("change", aplicarModalidadTimbrado);

$("timestab").addEventListener('blur', function(event) {
  const valor = event.target.value.replace(/\D/g, '');
  event.target.value = valor.padStart(3, '0');
});

$("timpunexp").addEventListener('blur', function(event) {
  const valor = event.target.value.replace(/\D/g, '');
  event.target.value = valor.padStart(3, '0');
});

$("timnrodesde").addEventListener('blur', function(event) {
  const valor = event.target.value.replace(/\D/g, '');
  event.target.value = valor.padStart(7, '0');
});

$("timnrohasta").addEventListener('blur', function(event) {
  const valor = event.target.value.replace(/\D/g, '');
  event.target.value = valor.padStart(7, '0');
});

function verTipoComprobante(tipoDocumento) {
    const timsuc = $("timestab");
    const timcaja = $("timpunexp");
    switch(tipoDocumento) {
        case "TIC":
            timsuc.disabled = true;
            timcaja.disabled = true;
            break;            
        default:
            timsuc.disabled = false;
            timcaja.disabled = false;
            break;
    }
}

function aplicarModalidadTimbrado() {
    const modalidad = $("timmodalid").value;
    const timdesde = $("timnrodesde");
    const timhasta = $("timnrohasta");
    const timfecvto = $("timfecvto");

    if (modalidad === "E") {
        timfecvto.disabled = true;
        timfecvto.value = "";
        timfecvto.removeAttribute("data-required");
        timdesde.disabled = true;
        timhasta.disabled = true;
        timdesde.value = "";
        timhasta.value = "";
        return;
    }

    timfecvto.disabled = false;
    timfecvto.setAttribute("data-required", "true");
    timdesde.disabled = false;
    timhasta.disabled = false;
}






// Sucursal

let modoSuc = 'INS';
let sucEstActual = "";
const btnAgregarSuc = $("btnAgregarSuc");
let sucursalesCaja = [];
let sucursalNombrePorCodigo = new Map();
let cajasCache = [];
let DefaultFilterSuc = {
    texto: "",
    limit: 0,
    offset: 0
};

async function listSucursalT() {
    const response = await postData(listSucursal, DefaultFilterSuc);
    if (response.success) {
        const sucursales = response.objectsList || [];
        sucursalesCaja = sucursales;
        sucursalNombrePorCodigo = new Map(
            sucursales.map((item) => [String(item.sucest), item.sucnom])
        );
        renderTablehtmlSuc(sucursales);
        cargarOptionsCajaSucursal(sucursales);
        if (cajasCache.length > 0) {
            renderTablehtmlCaja(cajasCache);
        }
    }
}
listSucursalT();

async function renderTablehtmlSuc(sucursal) {
    const tableBody = $("sucursalTableBody");
    tableBody.innerHTML = "";
    if(sucursal.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
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
    sucursal.forEach(item => {
        const row = document.createElement("tr");
        row.classList.add('sm')
        row.innerHTML = `
            <td data-label="Estab.">${item.sucest || ''}</td>
            <td data-label="Denominación">${item.sucnom}</td>
            <td data-label="Establ.">${item.sucest || ''}</td>
            <td class="hide-mobile" data-label="Dirección">${item.sucdir}</td>            
            <td class="hide-mobile" data-label="Telefono">${item.suctel}</td>
            <td data-label="Acciones">
                <div class="action-buttons">                                        
                    <button class="btn-icon" tipo-btn="editarSuc" data-id="${item.sucest}" title="Editar" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarSuc" data-id="${item.sucest}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>                                       
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminarSuc"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;                
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el registro?`,
                onEliminar: () => eliminarSuc(id)
            });
        });
    });
    
    const botonesModificar = document.querySelectorAll('[tipo-btn="editarSuc"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;
            modoSuc = 'UPD';
            btnAgregarSuc.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getByIdSuc(id);
        });
    });     
}

function StringDataSuc() {
    const formData = {
        sucnom: $("sucnom").value,
        sucest: $("sucest").value.trim() || null,
        sucdir: $("sucdir").value.trim(),
        suctel: $("suctel").value.trim(),       
    }
    return formData;
}

function limpiarSuc() {
    sucEstActual = "";
    modoSuc = "INS";
    $("SucursalForm").reset();
    $("sucest").disabled = false;
    btnAgregarSuc.innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => {
        $("sucnom").focus();
    }, 100);    
}

btnAgregarSuc.addEventListener("click", function() {
    const miFormulario = $("SucursalForm");
    if(!validarLargoCampos(miFormulario) || !validarCampos(miFormulario)) {
        return;
    }
    if(modoSuc === "INS"){
        insertSuc();  
    } else {
        updateSuc();
    }     
});

// Agregar evento para Enter
btnAgregarSuc.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        btnAgregarSuc.click();
    }
});

async function insertSuc() {
    try {        
        const response = await postData(InsertSucursal, StringDataSuc(), "Sucursal");
        if (response.success) {
            listSucursalT();
            limpiarSuc();
            showSuccessToast("Registrado","Sucursal registrado con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertSuc:", error);
    }
}

async function updateSuc() {
    try {        
        const response = await putData(UpdateSucursal, StringDataSuc(), "Sucursal");
        if (response.success) {
            listSucursalT();
            limpiarSuc();
            showSuccessToast("Modificado","Sucursal modificado con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertSuc:", error);
    }    
}

async function getByIdSuc(id) {
    try {        
        const response = await getData(`${getByIdSucursal}?id=${id}`);
        if (response.success) {
            const sucursal = response.data;
            setVal("sucnom", sucursal.sucnom);
            setVal("sucest", sucursal.sucest);
            setVal("sucdir", sucursal.sucdir);
            setVal("suctel", sucursal.suctel);
            sucEstActual = sucursal.sucest;
            $("sucest").disabled = true;
        }
    } catch (error) {
        console.error("Error en getByidSuc:", error);
    }    
}

async function eliminarSuc(id) {
    try {
        const response = await deleteData(`${DeleteSucursal}?id=${id}`, "Sucursal");
        if (response.success) {
            listSucursalT();    
            showSuccessToast("Eliminado","Sucursal eliminado con éxito", 2000);        
        }
    } catch (error) {
        console.error("Error en eliminarSuc:", error);
    }
}

$("cajpuntoexp").addEventListener('blur', function(event) {
    const valor = event.target.value.replace(/\D/g, '');
    event.target.value = valor.padStart(3, '0');
});

let modoCaja = 'INS';
let cajaPkActual = { sucest: "", puntoexp: "" };
const btnAgregarCaja = $("btnAgregarCaja");
let DefaultFilterCaja = {
    texto: "",
    limit: 0,
    offset: 0
};

function cargarOptionsCajaSucursal(sucursales) {
    $("cajsucest").innerHTML = '<option value="">Seleccionar...</option>' + sucursales.map((item) => (
        `<option value="${item.sucest}">${item.sucnom}</option>`
    )).join("");
}

async function listCajaT() {
    if (!sucursalesCaja.length) {
        await listSucursalT();
    }
    const response = await postData(listCaja, DefaultFilterCaja);
    if (response.success) {
        cajasCache = response.objectsList || [];
        renderTablehtmlCaja(cajasCache);
    }
}
listCajaT();

function obtenerNombreSucursalCaja(item) {
    return item.sucnom || item.cajsucnom || sucursalNombrePorCodigo.get(String(item.cajsucest)) || item.cajsucest;
}

async function renderTablehtmlCaja(cajas) {
    const tableBody = $("cajaTableBody");
    tableBody.innerHTML = "";

    if (cajas.length === 0) {
        tableBody.innerHTML = `
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

    cajas.forEach(item => {
        const sucest = String(item.cajsucest || "");
        const puntoexp = String(item.cajpuntoexp || "");
        const cajaPk = `${sucest}|${puntoexp}`;
        const row = document.createElement("tr");
        row.classList.add('sm');
        row.innerHTML = `
            <td data-label="Suc. / Punto">${sucest && puntoexp ? `${sucest}-${puntoexp}` : ""}</td>
            <td data-label="Sucursal">${obtenerNombreSucursalCaja(item)}</td>
            <td data-label="Caja">${item.cajnombre}</td>
            <td data-label="Punto Exp.">${item.cajpuntoexp}</td>
            <td data-label="Estado">
                <label class="switch">
                    <input type="checkbox" data-pk="${cajaPk}" ${item.cajactivo ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </td>
            <td data-label="Acciones">
                <div class="action-buttons">
                    <button class="btn-icon" tipo-btn="editarCaja" data-pk="${cajaPk}" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarCaja" data-pk="${cajaPk}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('[tipo-btn="eliminarCaja"]').forEach(boton => {
        boton.addEventListener('click', () => {
            const pk = boton.dataset.pk;
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar la caja?`,
                onEliminar: () => eliminarCaja(pk)
            });
        });
    });

    document.querySelectorAll('[tipo-btn="editarCaja"]').forEach(boton => {
        boton.addEventListener('click', () => {
            const pk = boton.dataset.pk;
            modoCaja = 'UPD';
            btnAgregarCaja.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getByIdCajaData(pk);
        });
    });

    document.querySelectorAll('#cajaTableBody .switch input').forEach(checkbox => {
        checkbox.addEventListener('change', async function(event) {
            const pk = event.target.getAttribute('data-pk');
            const activo = event.target.checked;
            actEstadoCaj(pk, activo);
        });
    });
}

function StringDataCaja() {
    return {
        cajsucest: $("cajsucest").value,
        cajnombre: $("cajnombre").value.trim(),
        cajpuntoexp: $("cajpuntoexp").value.trim(),
        cajactivo: true
    };
}

function limpiarCaja() {
    cajaPkActual = { sucest: "", puntoexp: "" };
    modoCaja = "INS";
    $("CajaForm").reset();
    $("cajsucest").disabled = false;
    $("cajpuntoexp").disabled = false;
    btnAgregarCaja.innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => {
        $("cajsucest").focus();
    }, 100);
}

btnAgregarCaja.addEventListener("click", function() {
    const miFormulario = $("CajaForm");
    if (!validarLargoCampos(miFormulario) || !validarCampos(miFormulario)) {//Ryjar
        return;
    }
    if (modoCaja === "INS") {
        insertCaja();
    } else {
        updateCaja();
    }
});

btnAgregarCaja.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        btnAgregarCaja.click();
    }
});

async function insertCaja() {
    try {
        const response = await postData(InsertCaja, StringDataCaja(), "Caja");
        if (response.success) {
            listCajaT();
            limpiarCaja();
            showSuccessToast("Registrado", "Caja registrada con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertCaja:", error);
    }
}

async function updateCaja() {
    try {
        const response = await putData(UpdateCaja, StringDataCaja(), "Caja");
        if (response.success) {
            listCajaT();
            limpiarCaja();
            showSuccessToast("Modificado", "Caja modificada con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en updateCaja:", error);
    }
}

function parseCajaPk(value) {
    const [sucest = "", puntoexp = ""] = String(value || "").split("|");
    return { sucest, puntoexp };
}

async function getByIdCajaData(pk) {
    try {
        const { sucest, puntoexp } = parseCajaPk(pk);
        const response = await getData(`${getByIdCaja}?sucest=${encodeURIComponent(sucest)}&puntoexp=${encodeURIComponent(puntoexp)}`);
        if (response.success) {
            const caja = response.data;
            setVal("cajsucest", caja.cajsucest);
            setVal("cajnombre", caja.cajnombre);
            setVal("cajpuntoexp", caja.cajpuntoexp);
            cajaPkActual = {
                sucest: caja.cajsucest,
                puntoexp: caja.cajpuntoexp
            };
            $("cajsucest").disabled = true;
            $("cajpuntoexp").disabled = true;
        }
    } catch (error) {
        console.error("Error en getByIdCaja:", error);
    }
}

async function eliminarCaja(pk) {
    try {
        const { sucest, puntoexp } = parseCajaPk(pk);
        const response = await deleteData(`${DeleteCaja}?sucest=${encodeURIComponent(sucest)}&puntoexp=${encodeURIComponent(puntoexp)}`, "Caja");
        if (response.success) {
            listCajaT();
            showSuccessToast("Eliminado", "Caja eliminada con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en eliminarCaja:", error);
    }
}

async function actEstadoCaj(pk, activo) {
    try {
        const { sucest, puntoexp } = parseCajaPk(pk);
        const response = await getData(`${actEstadoCaja}?sucest=${encodeURIComponent(sucest)}&puntoexp=${encodeURIComponent(puntoexp)}`);
        if (response.success) {
            showSuccessToast("Estado Actualizado", "Caja actualizada con éxito", 1000);
        }
    } catch (error) {
        console.error("Error en actEstadoCaja:", error);
    }
}


// Deposito

let modoDep = 'INS';
let depId = 0;
const btnAgregarDep = $("btnAgregarDep");
let DefaultFilterDep = {
    texto: "",
    limit: 0,
    offset: 0
};

async function listDepositoT() {
    const response = await postData(listDeposito, DefaultFilterDep);
    if (response.success) {
        renderTablehtmlDep(response.objectsList || []);
    }
}
listDepositoT();

async function renderTablehtmlDep(deposito) {
    const tableBody = $("depositoTableBody");
    tableBody.innerHTML = "";
    if(deposito.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
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
    deposito.forEach(item => {
        const row = document.createElement("tr");
        row.classList.add('sm')
        row.innerHTML = `
            <td data-label="ID">${item.depid}</td>
            <td data-label="Denominación">${item.depnom}</td>
            <td class="hide-mobile" data-label="Dirección">${item.depdir}</td>            
            <td class="hide-mobile" data-label="Telefono">${item.deptel}</td>
            <td data-label="Acciones">
                <div class="action-buttons">                                        
                    <button class="btn-icon" tipo-btn="editarDep" data-id="${item.depid}" title="Editar" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarDep" data-id="${item.depid}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>                                       
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminarDep"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;                
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el registro?`,
                onEliminar: () => eliminarDep(id)
            });
        });
    });
    
    const botonesModificar = document.querySelectorAll('[tipo-btn="editarDep"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;
            modoDep = 'UPD';
            btnAgregarDep.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            getByIdDep(id);
        });
    });     
}

function StringDataDep() {
    const formData = {
        depid: depId,
        depnom: $("depnom").value.trim(),
        depdir: $("depdir").value.trim(),
        deptel: $("deptel").value.trim(),       
    }
    return formData;
}

function limpiarDep() {
    depId = 0;
    modoDep = "INS";
    $("DepositoForm").reset();
    btnAgregarDep.innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => {
        $("depnom").focus();
    }, 100);    
}

btnAgregarDep.addEventListener("click", function() {
    const miFormulario = $("DepositoForm");
    if(!validarCampos(miFormulario)) {
        return;
    }
    if(modoDep === "INS"){
        insertDep();  
    } else {
        updateDep();
    }     
});

// Agregar evento para Enter
btnAgregarDep.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        btnAgregarDep.click();
    }
});

async function insertDep() {
    try {        
        const response = await postData(InsertDeposito, StringDataDep(), "Deposito");
        if (response.success) {
            listDepositoT();
            limpiarDep();
            showSuccessToast("Registrado","Deposito registrado con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertDep:", error);
    }
}

async function updateDep() {
    try {        
        const response = await putData(UpdateDeposito, StringDataDep(), "Deposito");
        if (response.success) {
            listDepositoT();
            limpiarDep();
            showSuccessToast("Modificado","Deposito modificado con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en updateDep:", error);
    }    
}

async function getByIdDep(id) {
    try {        
        const response = await getData(`${getByIdDeposito}?id=${id}`);
        if (response.success) {
            const deposito = response.data;
            setVal("depnom", deposito.depnom);
            setVal("depdir", deposito.depdir);
            setVal("deptel", deposito.deptel);
            depId = deposito.depid            
        }
    } catch (error) {
        console.error("Error en getByidDep:", error);
    }    
}

async function eliminarDep(id) {
    try {
        const response = await deleteData(`${DeleteDeposito}?id=${id}`, "Deposito");
        if (response.success) {
            listDepositoT();    
            showSuccessToast("Eliminado","Deposito eliminado con éxito", 2000);        
        }
    } catch (error) {
        console.error("Error en eliminarDep:", error);
    }
}



// Moneda

let monedaSeleccionada = null;
let monedasRegistradas = new Set();
let DefaultFilterMon = {
    texto: "",
    limit: 0,
    offset: 0
};

function openMonedaCatalogo() {
    $("monedaCatalogoModal").classList.add("active");
    renderMonedaCatalogo();
    setTimeout(() => {
        $("monedaCatalogoBuscar").focus();
    }, 120);
}

function closeMonedaCatalogo() {
    $("monedaCatalogoModal").classList.remove("active");
}

async function aplicarMonedaSeleccionada(moneda) {
    if (!moneda) {
        return;
    }

    monedaSeleccionada = moneda;

    if (monedasRegistradas.has(monedaSeleccionada.codigo)) {
        showWarningToast("Moneda existente", "Esa moneda ya forma parte de tu base de datos.", 3000);
        return;
    }

    try {
        const response = await postData(InsertMoneda, StringDataMon(), "Moneda");
        if (response.success) {
            closeMonedaCatalogo();
            await listMonedaT();
            monedaSeleccionada = null;
            showSuccessToast("Registrado","Moneda registrada con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertMon:", error);
    }
}

function renderMonedaCatalogo() {
    const texto = $("monedaCatalogoBuscar").value.trim();
    const tipo = $("monedaCatalogoTipo").value;
    const tbody = $("monedaCatalogoTableBody");

    let monedas = texto ? buscarMoneda(texto) : [...MONEDAS_SIFEN];
    if (tipo === "comunes") {
        const comunes = new Set(MONEDAS_COMUNES.map((item) => item.codigo));
        monedas = monedas.filter((item) => comunes.has(item.codigo));
    }

    tbody.innerHTML = "";

    if (!monedas.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <h3>No se encontraron monedas</h3>
                        <p>Prueba con otro criterio de búsqueda.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    monedas.slice(0, 200).forEach((item) => {
        const yaRegistrada = monedasRegistradas.has(item.codigo);
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.style.cursor = yaRegistrada ? "not-allowed" : "pointer";
        row.style.opacity = yaRegistrada ? "0.65" : "1";
        row.innerHTML = `
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Descripción">${item.descripcion_es || item.descripcion}</td>
            <td data-label="Símbolo">${item.simbolo || ""}</td>
            <td data-label="Decimales">${item.decimales}</td>
            <td data-label="País">${yaRegistrada ? `${item.pais || ""} - Ya agregada` : item.pais || ""}</td>
        `;
        row.addEventListener("click", () => {
            if (yaRegistrada) {
                showWarningToast("Moneda existente", "Esa moneda ya forma parte de tu base de datos.", 3000);
                return;
            }
            aplicarMonedaSeleccionada(item);
        });
        tbody.appendChild(row);
    });
}

async function listMonedaT() {
    const response = await postData(listMoneda, DefaultFilterMon);
    if (response.success) {
        const monedas = response.objectsList || [];
        monedasRegistradas = new Set(monedas.map((item) => item.codigo));
        renderTablehtmlMon(monedas);
    }
}
listMonedaT();

async function renderTablehtmlMon(moneda) {
    const tableBody = $("monedaTableBody");
    tableBody.innerHTML = "";
    if(moneda.length === 0) {
        tableBody.innerHTML = `
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
    moneda.forEach(item => {
        const row = document.createElement("tr");
        row.classList.add('sm')
        row.innerHTML = `
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Descripción">${item.descripcion}</td>
            <td data-label="Símbolo">${item.simbolo || ""}</td>
            <td data-label="Decimales">${item.decimales ?? 2}</td>
            <td data-label="Estado">${item.activo !== false ? "Activo" : "Inactivo"}</td>
            <td data-label="Acciones">
                ${item.codigo !== 'PYG' ? `<div class="action-buttons">                                        
                    <button class="btn-icon" tipo-btn="eliminarMon" data-codigo="${item.codigo}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>                                       
                </div>` : '<div class="action-buttons"><span class="tag tag-success" style="padding: 8px;">Base</span></div>'}
            </td>
        `;
        tableBody.appendChild(row);
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminarMon"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const codigo = boton.dataset.codigo;
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el registro?`,
                onEliminar: () => eliminarMon(codigo)
            });
        });
    });
}

function StringDataMon() {
    if (!monedaSeleccionada) {
        return null;
    }
    const formData = {
        codigo: monedaSeleccionada.codigo,
        descripcion: monedaSeleccionada.descripcion_es || monedaSeleccionada.descripcion,
        simbolo: monedaSeleccionada.simbolo || null,
        decimales: monedaSeleccionada.decimales ?? 2,
        activo: true
    };
    return formData;
}

async function eliminarMon(codigo) {
    try {
        const response = await deleteData(`${DeleteMoneda}?id=${encodeURIComponent(codigo)}`, "Moneda");
        if (response.success) {
            listMonedaT();    
            showSuccessToast("Eliminado","Moneda eliminada con éxito", 2000);        
        }
    } catch (error) {
        console.error("Error en eliminarMon:", error);
    }
}

$("btnBuscarMoneda").addEventListener("click", openMonedaCatalogo);
$("btnCloseMonedaCatalogo").addEventListener("click", closeMonedaCatalogo);
$("monedaCatalogoBuscar").addEventListener("input", renderMonedaCatalogo);
$("monedaCatalogoTipo").addEventListener("change", renderMonedaCatalogo);
$("monedaCatalogoModal").addEventListener("click", (event) => {
    if (event.target === $("monedaCatalogoModal")) {
        closeMonedaCatalogo();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("monedaCatalogoModal").classList.contains("active")) {
        closeMonedaCatalogo();
    }
});




// Unidad de Medida

let unidadSeleccionada = null;
let unidadesRegistradas = new Set();
let DefaultFilterUnidad = {
    texto: "",
    limit: 0,
    offset: 0
};

function openUnidadCatalogo() {
    $("unidadCatalogoModal").classList.add("active");
    renderUnidadCatalogo();
    setTimeout(() => {
        $("unidadCatalogoBuscar").focus();
    }, 120);
}

function closeUnidadCatalogo() {
    $("unidadCatalogoModal").classList.remove("active");
}

async function aplicarUnidadSeleccionada(unidad) {
    if (!unidad) {
        return;
    }

    unidadSeleccionada = unidad;

    if (unidadesRegistradas.has(unidadSeleccionada.codigo)) {
        showWarningToast("Unidad existente", "Esa unidad ya forma parte de tu base de datos.", 3000);
        return;
    }

    try {
        const response = await postData(InsertUnidad, StringDataUnidad(), "Unidad");
        if (response.success) {
            closeUnidadCatalogo();
            await listUnidadT();
            unidadSeleccionada = null;
            showSuccessToast("Registrado","Unidad registrada con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertUnidad:", error);
    }
}

function renderUnidadCatalogo() {
    const texto = $("unidadCatalogoBuscar").value.trim();
    const tbody = $("unidadCatalogoTableBody");
    const unidades = texto ? buscarUnidadMedida(texto) : [...UNIDADES_MEDIDA];

    tbody.innerHTML = "";

    if (!unidades.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="empty-state">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <h3>No se encontraron unidades</h3>
                        <p>Prueba con otro criterio de búsqueda.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    unidades.forEach((item) => {
        const yaRegistrada = unidadesRegistradas.has(item.codigo);
        const row = document.createElement("tr");
        row.classList.add("sm");
        row.style.cursor = yaRegistrada ? "not-allowed" : "pointer";
        row.style.opacity = yaRegistrada ? "0.65" : "1";
        row.innerHTML = `
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Descripción">${yaRegistrada ? `${item.descripcion} - Ya agregada` : item.descripcion}</td>
            <td data-label="Abreviatura">${item.abreviatura}</td>
        `;
        row.addEventListener("click", () => {
            if (yaRegistrada) {
                showWarningToast("Unidad existente", "Esa unidad ya forma parte de tu base de datos.", 3000);
                return;
            }
            aplicarUnidadSeleccionada(item);
        });
        tbody.appendChild(row);
    });
}

async function listUnidadT() {
    const response = await postData(listUnidad, DefaultFilterUnidad);
    if (response.success) {
        const unidades = response.objectsList || [];
        unidadesRegistradas = new Set(unidades.map((item) => item.codigo));
        renderTablehtmlUnidad(unidades);
    }
}
listUnidadT();

async function renderTablehtmlUnidad(unidad) {
    const tableBody = $("unidadTableBody");
    tableBody.innerHTML = "";
    if(unidad.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
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
    unidad.forEach(item => {
        const row = document.createElement("tr");
        row.classList.add('sm')
        row.innerHTML = `
            <td data-label="Código">${item.codigo}</td>
            <td data-label="Descripción">${item.descripcion}</td>
            <td data-label="Abreviatura">${item.abreviatura}</td>
            <td data-label="Acciones">
                <div class="action-buttons">                                        
                    <button class="btn-icon" tipo-btn="eliminarUnidad" data-codigo="${item.codigo}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>                                       
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminarUnidad"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const codigo = boton.dataset.codigo;
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el registro?`,
                onEliminar: () => eliminarUnidad(codigo)
            });
        });
    });
}

function StringDataUnidad() {
    if (!unidadSeleccionada) {
        return null;
    }

    const formData = {
        codigo: unidadSeleccionada.codigo,
        descripcion: unidadSeleccionada.descripcion,
        abreviatura: unidadSeleccionada.abreviatura,
        activo: true
    };
    return formData;
}

async function eliminarUnidad(codigo) {
    try {
        const response = await deleteData(`${DeleteUnidad}?id=${encodeURIComponent(codigo)}`, "Unidad");
        if (response.success) {
            listUnidadT();    
            showSuccessToast("Eliminado","Unidad eliminada con éxito", 2000);        
        }
    } catch (error) {
        console.error("Error en eliminarUnidad:", error);
    }
}

$("btnBuscarUnidad").addEventListener("click", openUnidadCatalogo);
$("btnCloseUnidadCatalogo").addEventListener("click", closeUnidadCatalogo);
$("unidadCatalogoBuscar").addEventListener("input", renderUnidadCatalogo);
$("unidadCatalogoModal").addEventListener("click", (event) => {
    if (event.target === $("unidadCatalogoModal")) {
        closeUnidadCatalogo();
    }
});


// Tipo Precio

let modoTipoPrecio = 'INS';
let tipoPrecioId = 0;
const btnAgregarTipoPrecio = $("btnAgregarTipoPrecio");
let DefaultFilterTipoPrecio = {
    texto: "",
    limit: 0,
    offset: 0
};

async function listTipoPrecioT() {
    const response = await postData(listTipoPrecio, DefaultFilterTipoPrecio);
    if (response.success) {
        renderTablehtmlTipoPrecio(response.objectsList || []);
    }
}
listTipoPrecioT();

async function renderTablehtmlTipoPrecio(tipoPrecio) {
    const tableBody = $("tipoPrecioTableBody");
    tableBody.innerHTML = "";
    if(tipoPrecio.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
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
    tipoPrecio.forEach(item => {
        const row = document.createElement("tr");
        row.classList.add('sm')
        row.innerHTML = `
            <td data-label="ID">${item.tipid}</td>
            <td data-label="Unidad">${item.tipnom}</td>                       
            <td data-label="Acciones">
                <div class="action-buttons">       
                    ${item.tipid !== 1 ? `
                    <button class="btn-icon" tipo-btn="editarTipoPrecio" data-id="${item.tipid}" title="Editar" title="Editar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen-icon lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-icon" tipo-btn="eliminarTipoPrecio" data-id="${item.tipid}" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-principal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>` : `<div class="action-buttons"><span class="tag tag-success" style="padding: 8px;">Predeterminada</span></div>`}                                       
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    const botonesEliminar = document.querySelectorAll('[tipo-btn="eliminarTipoPrecio"]');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;                
            confirmDelete({
                texto: `¿Está seguro de que desea eliminar el registro?`,
                onEliminar: () => eliminarTipoPrecio(id)
            });
        });
    });
    
    const botonesModificar = document.querySelectorAll('[tipo-btn="editarTipoPrecio"]');
    botonesModificar.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;
            modoTipoPrecio = 'UPD';
            btnAgregarTipoPrecio.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modificar`;
            fgetByIdTipoPrecio(id);
        });
    });     
}

function StringDataTipoPrecio() {
    const formData = {
        tipid: tipoPrecioId,
        tipnom: $("tipnom").value.trim(),
    }
    return formData;
}

function limpiarTipoPrecio() {
    tipoPrecioId = 0;
    modoTipoPrecio = "INS";
    $("TipoPrecioForm").reset();
    btnAgregarTipoPrecio.innerHTML = `<i class="fa-solid fa-plus"></i> Agregar`;
    dataRequiredClear();
    setTimeout(() => {
        $("tipnom").focus();
    }, 100);    
}

btnAgregarTipoPrecio.addEventListener("click", function() {
    const miFormulario = $("TipoPrecioForm");
    if(!validarCampos(miFormulario)) {
        return;
    }
    if(modoTipoPrecio === "INS"){
        insertTipoPrecio();  
    } else {
        updateTipoPrecio();
    }     
});

// Agregar evento para Enter
btnAgregarTipoPrecio.addEventListener("keydown", function(event) {
    if(event.key === "Enter") {
        btnAgregarTipoPrecio.click();
    }
});

async function insertTipoPrecio() {
    try {        
        const response = await postData(InsertTipoPrecio, StringDataTipoPrecio(), "TipoPrecio");
        if (response.success) {
            listTipoPrecioT();
            limpiarTipoPrecio();
            showSuccessToast("Registrado","TipoPrecio registrado con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en insertTipoPrecio:", error);
    }
}

async function updateTipoPrecio() {
    try {        
        const response = await putData(UpdateTipoPrecio, StringDataTipoPrecio(), "TipoPrecio");
        if (response.success) {
            listTipoPrecioT();  
            limpiarTipoPrecio();
            showSuccessToast("Modificado","TipoPrecio modificada con éxito", 2000);
        }
    } catch (error) {
        console.error("Error en updateTipoPrecio:", error);
    }    
}

async function fgetByIdTipoPrecio(id) {
    try {        
        const response = await getData(`${getByIdTipoPrecio}?id=${id}`);
        if (response.success) {
            const tipoPrecio = response.data;
            setVal("tipnom", tipoPrecio.tipnom);            
            tipoPrecioId = tipoPrecio.tipid;            
        }
    } catch (error) {
        console.error("Error en getByidTipoPrecio:", error);
    }    
}

async function eliminarTipoPrecio(id) {
    try {
        const response = await deleteData(`${DeleteTipoPrecio}?id=${id}`, "TipoPrecio");
        if (response.success) {
            listTipoPrecioT();    
            showSuccessToast("Eliminado","TipoPrecio eliminado con éxito", 2000);        
        }
    } catch (error) {
        console.error("Error en eliminarTipoPrecio:", error); 
    }
}
