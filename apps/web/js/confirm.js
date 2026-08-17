
export function confirmDelete(config = {}) {

    const DefaultFilter = {
        texto: "",
        onEliminar: null
    }

    const mConfig = {...DefaultFilter, ...config};

    const overlay = document.createElement("div");
    overlay.classList.add("overlay-eliminar");
    overlay.id = "overlayEliminar";
    
    const modal = document.createElement("div");
    modal.classList.add("modal-eliminar");
    modal.innerHTML = `
        <button id="closeBtnEliminar" class="close-btn-elim"><i class="fa-solid fa-xmark"></i></button>

        <h2 class="elim-h2">Eliminar Registro</h2>
        <p class="elim-p">¿Está seguro de que desea eliminar el siguiente registro?</p>

        <div class="warning d-none">
            <strong>Advertencia:</strong> Esta acción <b>no se puede deshacer</b>. Eliminando un registro eliminará todos sus datos asociados definitivamente.
        </div>

        <div class="actions-elim">
            <button id="btnCancelarEliminar" class="btn-cancel-elim">Cancelar</button>
            <button id="btnEliminarRegistro" class="btn-delete-elim">Sí, Eliminar Registro</button>
        </div>        
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById("btnCancelarEliminar").addEventListener("click", (e) => {
        overlay.remove();
    });

    document.getElementById("closeBtnEliminar").addEventListener("click", (e) => {
        overlay.remove();
    }); 
    
    document.getElementById("btnEliminarRegistro").addEventListener("click", (e) => {
        mConfig.onEliminar();
        overlay.remove();
    });    

    document.getElementById("overlayEliminar").addEventListener("click", function(e) {       
        if (!e.target.closest(".modal-eliminar")) {        
            overlay.remove();
        }
    });    
}