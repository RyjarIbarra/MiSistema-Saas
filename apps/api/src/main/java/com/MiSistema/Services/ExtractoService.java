package com.MiSistema.Services;

import com.MiSistema.Modelos.Extracto;
import com.MiSistema.Modelos.ExtractoPartida;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Migracion.MigracionResultadoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ExtractoService {
    ResponseEntity<DefaultResponse<Extracto>> list(long cbaid);
    ResponseEntity<DefaultResponse<Extracto>> getById(long id);
    ResponseEntity<DefaultResponse<Extracto>> insert(Extracto e);
    /** Cierra la conciliación: marca CONCILIADO y persiste la diferencia de carga. */
    ResponseEntity<DefaultResponse<Extracto>> cerrar(long id, Integer usuCierre);
    /** Elimina un extracto ABIERTO (cascada a partidas y vínculos). */
    ResponseEntity<DefaultResponse<String>> delete(long id);

    // ---- partidas ----
    ResponseEntity<DefaultResponse<ExtractoPartida>> listPartidas(long extid);
    ResponseEntity<DefaultResponse<ExtractoPartida>> addPartida(ExtractoPartida p);
    ResponseEntity<DefaultResponse<String>> addPartidasBulk(List<ExtractoPartida> partidas);
    ResponseEntity<DefaultResponse<String>> deletePartida(long expid);
    ResponseEntity<DefaultResponse<String>> setIgnorar(long expid, boolean ignorar);

    /** Genera la plantilla Excel (.xlsx) que el cliente completa con las líneas del extracto. */
    ResponseEntity<byte[]> plantillaPartidas();
    /** Importa las partidas desde un Excel completado. No carga nada si hay filas con error. */
    ResponseEntity<DefaultResponse<MigracionResultadoDto>> importarPartidas(long extid, MultipartFile file);
}
