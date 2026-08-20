package com.MiSistema.Services;

import com.MiSistema.Modelos.ChequePropio;
import com.MiSistema.ModelsDto.Banco.ChequeAccion;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface ChequePropioService {
    ResponseEntity<DefaultResponse<ChequePropio>> list(ChequeFiltro filtro);
    ResponseEntity<DefaultResponse<ChequePropio>> getById(long id);

    /** Emite un cheque: reserva el número del talonario y genera el movimiento de libro (tipo CHE) a la fecha de pago. */
    ResponseEntity<DefaultResponse<ChequePropio>> emitir(ChequePropio ch);

    /** EMITIDO → ENTREGADO. */
    ResponseEntity<DefaultResponse<String>> entregar(ChequeAccion a);

    /** EMITIDO/ENTREGADO → COBRADO (confirmación de débito; el saldo ya bajó al emitir). */
    ResponseEntity<DefaultResponse<String>> cobrar(ChequeAccion a);

    /** EMITIDO/ENTREGADO → RECHAZADO: genera el movimiento de reversión (tipo CHR) que devuelve el importe. */
    ResponseEntity<DefaultResponse<String>> rechazar(ChequeAccion a);

    /** EMITIDO → ANULADO (antes de entregarse): anula el movimiento de la emisión. */
    ResponseEntity<DefaultResponse<String>> anular(ChequeAccion a);
}
