package com.MiSistema.Services;

import com.MiSistema.Modelos.OrdenPago;
import com.MiSistema.Modelos.OrdenPagoMedio;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface OrdenPagoService {
    ResponseEntity<DefaultResponse<OrdenPago>> list(ChequeFiltro filtro);
    ResponseEntity<DefaultResponse<OrdenPago>> getById(long id);

    /** Crea la orden en BORRADOR con sus imputaciones y retenciones. Los totales los calcula la BD. */
    ResponseEntity<DefaultResponse<OrdenPago>> crear(OrdenPago orden);
    /** Reemplaza imputaciones y retenciones de una orden en BORRADOR. */
    ResponseEntity<DefaultResponse<OrdenPago>> actualizar(OrdenPago orden);
    /** BORRADOR → APROBADA. */
    ResponseEntity<DefaultResponse<String>> aprobar(long id, Integer usu);
    /** Cualquier estado (salvo PAGADA) → ANULADA. */
    ResponseEntity<DefaultResponse<String>> anular(long id, String motivo, Integer usu);
    /** Elimina una orden en BORRADOR (cascada a sus hijas). */
    ResponseEntity<DefaultResponse<String>> eliminar(long id);

    // ---- medios (sobre orden APROBADA) ----
    /** Agrega un medio de pago referenciando un instrumento existente (cheque, transferencia, etc.). */
    ResponseEntity<DefaultResponse<OrdenPagoMedio>> agregarMedio(OrdenPagoMedio medio);
    ResponseEntity<DefaultResponse<String>> quitarMedio(long opmid);
    /** APROBADA → PAGADA (el cuadre exige que los medios sumen el neto). */
    ResponseEntity<DefaultResponse<String>> pagar(long id, java.time.LocalDate fecha, Integer usu);
}
