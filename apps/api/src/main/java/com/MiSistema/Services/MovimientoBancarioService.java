package com.MiSistema.Services;

import com.MiSistema.Modelos.MovimientoBancario;
import com.MiSistema.ModelsDto.Banco.MovimientoFiltro;
import com.MiSistema.ModelsDto.Banco.SaldoCuentaDto;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

import java.sql.Connection;
import java.sql.SQLException;

public interface MovimientoBancarioService {
    ResponseEntity<DefaultResponse<MovimientoBancario>> list(MovimientoFiltro filtro);
    ResponseEntity<DefaultResponse<MovimientoBancario>> registrar(MovimientoBancario mov);
    ResponseEntity<DefaultResponse<String>> anular(long id, String motivo);
    ResponseEntity<DefaultResponse<SaldoCuentaDto>> saldo(long cbaid);

    /**
     * Inserta un movimiento generado por otro dominio (cheques, órdenes de pago) dentro de la
     * transacción del llamador. Reserva el correlativo y devuelve el mbaid generado.
     * No abre ni cierra la conexión: la maneja el llamador.
     */
    long registrarInterno(Connection conn, MovimientoBancario mov, String origen) throws SQLException;

    /** Anula un movimiento dentro de la transacción del llamador (p. ej. al anular un cheque emitido). */
    void anularInterno(Connection conn, long mbaid, String motivo, Integer usuAnul) throws SQLException;
}
