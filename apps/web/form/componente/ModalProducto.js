import { listStockDetalladoProducto } from "../../js/apiEndpoints.js";
import { postData } from "../../js/apiService.js";

function mapProducto(item) {
    return {
        id: item.proid,
        descripcion: item.producto || "",
        gtin: item.gtin || "",
        stock: Number(item.cantidad || 0),
        stockFormat: item.stock_format || ""
    };
}

export class ModalProducto {
    constructor(config = {}) {
        this.pageSize = config.pageSize || 500;
        this.title = config.title || "Buscar Producto";
        this.onSelect = config.onSelect || null;
        this.modalId = config.modalId || "globalProductoBusquedaModal";
        this.items = [];
        this.totalRecords = 0;
        this.offset = 0;
        this.loading = false;
        this.hasMore = true;
        this.searchTimer = null;
        this.lastQuery = "";
        this.minSearchChars = config.minSearchChars || 3;
        this.idDeposito = config.idDeposito || null;
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
                        <button type="button" class="modal-close" data-modal-producto-close>×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-producto-toolbar">
                            <label for="${this.modalId}_buscar">Buscar</label>
                            <input type="text" id="${this.modalId}_buscar" class="form-control input-estilizado" placeholder="Buscar por código o descripción..." autocomplete="off">
                        </div>
                        <div class="modal-producto-table" data-modal-producto-scroll>
                            <table>
                                <thead>
                                    <tr class="sm">
                                        <th>ID</th>
                                        <th>Descripción</th>
                                        <th>GTIN</th>
                                        <th class="text-right">Stock actual</th>
                                    </tr>
                                </thead>
                                <tbody data-modal-producto-body>
                                    <tr class="sm">
                                        <td colspan="4">
                                            <div class="empty-state">
                                                <i class="fa-solid fa-box-open"></i>
                                                <h3>Sin productos para mostrar</h3>
                                                <p>Realiza una búsqueda para listar productos.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="modal-producto-status" data-modal-producto-status>
                            <span class="modal-producto-status-numero" data-modal-producto-status-numero>0</span>
                            <span class="modal-producto-status-texto" data-modal-producto-status-texto>productos</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.modal = modal;
        this.searchInput = modal.querySelector(`#${this.modalId}_buscar`);
        this.tableBody = modal.querySelector("[data-modal-producto-body]");
        this.scrollContainer = modal.querySelector("[data-modal-producto-scroll]");
        this.status = modal.querySelector("[data-modal-producto-status]");
        this.statusNumero = modal.querySelector("[data-modal-producto-status-numero]");
        this.statusTexto = modal.querySelector("[data-modal-producto-status-texto]");
        this.closeButton = modal.querySelector("[data-modal-producto-close]");
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
        this.idDeposito = config.idDeposito ?? this.idDeposito ?? null;
        const query = config.query ?? "";
        this.modal.classList.add("active");
        this.searchInput.value = query;
        this.lastQuery = query;
        await this.recargar();
        setTimeout(() => {
            this.searchInput.focus();
            this.searchInput.select();
        }, 80);
    }

    cerrar() {
        this.modal.classList.remove("active");
    }

    actualizarEstado(numero, texto = "productos") {
        this.statusNumero.textContent = String(numero ?? 0);
        this.statusTexto.textContent = texto;
    }

    async recargar() {
        const texto = this.searchInput.value.trim();
        if (texto.length > 0 && texto.length < this.minSearchChars) {
            return;
        }

        // Reinicia el listado para volver a pedir desde el primer bloque.
        this.offset = 0;
        this.hasMore = true;
        await this.cargarMas(true);
    }

    async cargarMas(reset = false) {
        if (this.loading || !this.hasMore) {
            return;
        }

        const texto = this.searchInput.value.trim();

        if (!this.idDeposito) {
            this.items = [];
            this.totalRecords = 0;
            this.offset = 0;
            this.hasMore = false;
            this.tableBody.innerHTML = `
                <tr class="sm">
                    <td colspan="4">
                        <div class="empty-state">
                            <i class="fa-solid fa-warehouse"></i>
                            <h3>Selecciona un depósito</h3>
                            <p>Primero debes indicar el depósito para listar productos.</p>
                        </div>
                    </td>
                </tr>
            `;
            this.actualizarEstado(0, "depósito requerido");
            return;
        }

        // Cada búsqueda genera un id secuencial para ignorar respuestas viejas.
        const requestId = ++this.requestSequence;
        this.loading = true;
        this.scrollContainer.classList.add("is-loading");

        try {
            const filtro = {
                texto,
                limit: this.pageSize,
                offset: this.offset,
                idDeposito: this.idDeposito
            };

            const response = await postData(listStockDetalladoProducto, filtro, "Producto");
            if (requestId !== this.requestSequence) {
                return;
            }

            // Reemplaza o concatena filas según si es una búsqueda nueva o scroll incremental.
            const nuevos = (response.objectsList || []).map(mapProducto);
            const nextTotalRecords = Number(response.totalRecords || 0);
            const nextOffset = this.offset + nuevos.length;
            const nextHasMore = nuevos.length === this.pageSize && (nextTotalRecords === 0 || nextOffset < nextTotalRecords);
            const nextItems = reset ? nuevos : [...this.items, ...nuevos];

            this.totalRecords = nextTotalRecords;
            this.offset = nextOffset;
            this.hasMore = nextHasMore;
            this.items = nextItems;
            this.renderizarFilas();
            this.actualizarEstado(this.totalRecords || this.items.length, "productos");
        } catch (error) {
            console.error("Error cargando productos para modal:", error);
            if (!this.items.length) {
                this.tableBody.innerHTML = `
                    <tr class="sm">
                        <td colspan="4">
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
                    <td colspan="4">
                        <div class="empty-state">
                            <i class="fa-solid fa-box-open"></i>
                            <h3>Sin productos para mostrar</h3>
                            <p>No se encontraron coincidencias.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = this.items.map((item) => `
            <tr class="sm modal-producto-row" data-producto-id="${item.id ?? ""}">
                <td data-label="ID">${item.id ?? ""}</td>
                <td data-label="Descripción">${item.descripcion || ""}</td>
                <td data-label="GTIN">${item.gtin || ""}</td>
                <td data-label="Stock actual" class="text-right">${item.stockFormat || this.formatCantidad(item.stock)}</td>
            </tr>
        `).join("");

        // La selección se resuelve por índice para reutilizar el objeto ya mapeado.
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

    formatCantidad(value) {
        const number = Number(value || 0);
        if (Number.isInteger(number)) {
            return String(number);
        }
        return number.toFixed(2).replace(/\.?0+$/, "");
    }
}

export default ModalProducto;
