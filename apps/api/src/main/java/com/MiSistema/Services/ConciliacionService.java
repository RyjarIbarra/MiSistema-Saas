package com.MiSistema.Services;

import com.MiSistema.Modelos.ConciliacionVinculo;
import com.MiSistema.ModelsDto.Banco.ConciliacionReporte;
import com.MiSistema.ModelsDto.Banco.MovimientoConciliar;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface ConciliacionService {
    /** Informe del extracto (vista v_conciliacion). */
    ResponseEntity<DefaultResponse<ConciliacionReporte>> reporte(long extid);
    /** Movimientos vigentes de la cuenta hasta el fin del período, con lo ya imputado. */
    ResponseEntity<DefaultResponse<MovimientoConciliar>> movimientosPeriodo(long extid);
    /** Vínculos de una partida. */
    ResponseEntity<DefaultResponse<ConciliacionVinculo>> listVinculos(long expid);
    /** Crea un vínculo manual partida <-> movimiento. */
    ResponseEntity<DefaultResponse<ConciliacionVinculo>> vincular(ConciliacionVinculo v);
    /** Elimina un vínculo (solo si el extracto está abierto). */
    ResponseEntity<DefaultResponse<String>> desvincular(long covid);
    /** Empareja automáticamente las partidas pendientes por cheque, referencia o importe+fecha. */
    ResponseEntity<DefaultResponse<String>> autoMatch(long extid);
}
