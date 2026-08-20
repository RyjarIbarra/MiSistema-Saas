package com.MiSistema.Services;

import com.MiSistema.Modelos.ChequeTercero;
import com.MiSistema.ModelsDto.Banco.ChequeAccion;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;

public interface ChequeTerceroService {
    ResponseEntity<DefaultResponse<ChequeTercero>> list(ChequeFiltro filtro);
    ResponseEntity<DefaultResponse<ChequeTercero>> getById(long id);

    /** Registra un cheque recibido: entra en CARTERA (no genera movimiento bancario). */
    ResponseEntity<DefaultResponse<ChequeTercero>> recibir(ChequeTercero ch);

    /** CARTERA → DEPOSITADO: genera el movimiento de depósito (tipo DCT) en la cuenta destino. */
    ResponseEntity<DefaultResponse<String>> depositar(ChequeAccion a);

    /** DEPOSITADO → ACREDITADO (confirmación del banco; el saldo ya subió al depositar). */
    ResponseEntity<DefaultResponse<String>> acreditar(ChequeAccion a);

    /** CARTERA → ENDOSADO: se transfiere a un tercero, sin movimiento bancario. */
    ResponseEntity<DefaultResponse<String>> endosar(ChequeAccion a);

    /** DEPOSITADO/ACREDITADO → RECHAZADO: genera la reversión (tipo RCT) que descuenta el importe. */
    ResponseEntity<DefaultResponse<String>> rechazar(ChequeAccion a);

    /** CARTERA → DEVUELTO: se reintegra al cliente sin cobrarse. */
    ResponseEntity<DefaultResponse<String>> devolver(ChequeAccion a);

    /**
     * Endosa un cheque de tercero dentro de la transacción del llamador (orden de pago).
     * Exige que esté en CARTERA. Marca ENDOSADO y guarda la orden. Devuelve el importe del cheque.
     */
    java.math.BigDecimal endosarInterno(Connection conn, long chtid, String endosado, LocalDate fecha, Long opaid) throws SQLException;
}
