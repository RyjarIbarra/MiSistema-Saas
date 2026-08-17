import { listClientes } from "../../js/apiEndpoints.js";
import { postData } from "../../js/apiService.js";

function mapCliente(item) {
    return {
        id: item.cliid,
        ruc: item.cliruc || "",
        nombre: item.clinom || "",
        email: item.climail || "",
        telefono: item.clitel || "",
        tipoPrecio: item.tipoprecio ?? null,
        raw: item
    };
}

export class ModalCliente {
    constructor(config = {}) {
        this.pageSize = config.pageSize || 500;
        this.title = config.title || "Buscar Cliente";
        this.onSelect = config.onSelect || null;
        this.modalId = config.modalId || "globalClienteBusquedaModal";
        this.items = [];
        this.totalRecords = 0;
        this.offset = 0;
        this.loading = false;
        this.hasMore = true;
        this.searchTimer = null;
        this.minSearchChars = config.minSearchChars || 3;
        this.requestSequence = 0;
        this.handleDocumentKeydown = this.handleDocumentKeydown.bind(this);
        this.asegurarDom();
        this.vincularEventos();
    }

    asegurarDom() {
        let modal = document.getElementById(this.modalId);
        if (!modal) {
            modal = document.createElement("div");
            modal.id = this.modalId;
            modal.className = "modal modal-producto-global";
            modal.innerHTML = `
                <div class="modal-content-vw modal-content-producto-global">
                    <div class="modal-header">
                        <h2 class="tituloform">${this.title}</h2>
                        <button type="button" class="modal-close" data-modal-cliente-close>×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-producto-toolbar">
                            <label for="${this.modalId}_buscar">Buscar</label>
                            <input type="text" id="${this.modalId}_buscar" class="form-control input-estilizado" placeholder="Buscar por ruc o nombre..." autocomplete="off">
                        </div>
                        <div class="modal-producto-table" data-modal-cliente-scroll>
                            <table>
                                <thead>
                                    <tr class="sm">
                                        <th>ID</th>
                                        <th>RUC/CI</th>
                                        <th>Nombre</th>
                                    </tr>
                                </thead>
                                <tbody data-modal-cliente-body>
                                    <tr class="sm">
                                        <td colspan="3">
                                            <div class="empty-state">
                                                <i class="fa-solid fa-users"></i>
                                                <h3>Sin clientes para mostrar</h3>
                                                <p>Realiza una búsqueda para listar clientes.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="modal-producto-status" data-modal-cliente-status>
                            <span class="modal-producto-status-numero" data-modal-cliente-status-numero>0</span>
                            <span class="modal-producto-status-texto" data-modal-cliente-status-texto>clientes</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.modal = modal;
        this.searchInput = modal.querySelector(`#${this.modalId}_buscar`);
        this.tableBody = modal.querySelector("[data-modal-cliente-body]");
        this.scrollContainer = modal.querySelector("[data-modal-cliente-scroll]");
        this.statusNumero = modal.querySelector("[data-modal-cliente-status-numero]");
        this.statusTexto = modal.querySelector("[data-modal-cliente-status-texto]");
        this.closeButton = modal.querySelector("[data-modal-cliente-close]");
    }

    vincularEventos() {
        this.closeButton.addEventListener("click", () => this.cerrar());
        this.modal.addEventListener("click", (event) => {
            if (event.target === this.modal) {
                this.cerrar();
            }
        });
        this.searchInput.addEventListener("input", () => {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.recargar();
            }, 220);
        });
        this.scrollContainer.addEventListener("scroll", () => {
            this.handleScroll();
        });
        document.addEventListener("keydown", this.handleDocumentKeydown);
    }

    handleDocumentKeydown(event) {
        if (event.key === "Escape" && this.estaAbierto()) {
            event.stopImmediatePropagation();
            this.cerrar();
        }
    }

    estaAbierto() {
        return this.modal.classList.contains("active");
    }

    async abrir(config = {}) {
        this.onSelect = config.onSelect || this.onSelect;
        const query = config.query ?? "";
        this.modal.classList.add("active");
        this.searchInput.value = query;
        await this.recargar();
        setTimeout(() => {
            this.searchInput.focus();
            this.searchInput.select();
        }, 80);
    }

    cerrar() {
        this.modal.classList.remove("active");
    }

    actualizarEstado(numero, texto = "clientes") {
        this.statusNumero.textContent = String(numero ?? 0);
        this.statusTexto.textContent = texto;
    }

    async recargar() {
        const texto = this.searchInput.value.trim();
        if (texto.length > 0 && texto.length < this.minSearchChars) {
            return;
        }

        this.offset = 0;
        this.hasMore = true;
        await this.cargarMas(true);
    }

    async cargarMas(reset = false) {
        if (this.loading || !this.hasMore) {
            return;
        }

        const texto = this.searchInput.value.trim();
        const requestId = ++this.requestSequence;
        this.loading = true;
        this.scrollContainer.classList.add("is-loading");

        try {
            const response = await postData(listClientes, {
                texto,
                limit: this.pageSize,
                offset: this.offset
            }, "Cliente");

            if (requestId !== this.requestSequence) {
                return;
            }

            const nuevos = (response.objectsList || []).map(mapCliente);
            const nextTotalRecords = Number(response.totalRecords || 0);
            const nextOffset = this.offset + nuevos.length;
            const nextHasMore = nuevos.length === this.pageSize && (nextTotalRecords === 0 || nextOffset < nextTotalRecords);
            const nextItems = reset ? nuevos : [...this.items, ...nuevos];

            this.totalRecords = nextTotalRecords;
            this.offset = nextOffset;
            this.hasMore = nextHasMore;
            this.items = nextItems;
            this.renderizarFilas();
            this.actualizarEstado(this.totalRecords || this.items.length, "clientes");
        } catch (error) {
            console.error("Error cargando clientes para modal:", error);
            if (!this.items.length) {
                this.tableBody.innerHTML = `
                    <tr class="sm">
                        <td colspan="3">
                            <div class="empty-state">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <h3>No se pudo cargar la lista</h3>
                                <p>Verifica la conexión con el backend.</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
            this.actualizarEstado(0, "error al cargar");
        } finally {
            this.loading = false;
            this.scrollContainer.classList.remove("is-loading");
        }
    }

    handleScroll() {
        if (this.loading || !this.hasMore) {
            return;
        }

        const threshold = 180;
        const remaining = this.scrollContainer.scrollHeight - this.scrollContainer.scrollTop - this.scrollContainer.clientHeight;
        if (remaining <= threshold) {
            this.cargarMas();
        }
    }

    renderizarFilas() {
        if (!this.items.length) {
            this.tableBody.innerHTML = `
                <tr class="sm">
                    <td colspan="3">
                        <div class="empty-state">
                            <i class="fa-solid fa-users"></i>
                            <h3>Sin clientes para mostrar</h3>
                            <p>No se encontraron coincidencias.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = this.items.map((item) => `
            <tr class="sm modal-producto-row" data-cliente-id="${item.id ?? ""}">
                <td data-label="ID">${item.id ?? ""}</td>
                <td data-label="RUC/CI">${item.ruc === "0" ? "-" : item.ruc}</td>
                <td data-label="Nombre">${item.nombre || ""}</td>
            </tr>
        `).join("");

        this.tableBody.querySelectorAll(".modal-producto-row").forEach((row, index) => {
            row.addEventListener("click", () => {
                const item = this.items[index];
                if (this.onSelect) {
                    this.onSelect(item);
                }
                this.cerrar();
            });
        });
    }
}

export default ModalCliente;
