package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Documento;
import com.MiSistema.Modelos.DocumentoDetalle;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Documento.DocumentoListDto;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.DocumentoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentoImpl implements DocumentoService {

    private static final String ESTADO_EMITIDO = "EMITIDO";
    private static final String ESTADO_ANULADO = "ANULADO";

    private final DataSourceManager dsManager;

    // ---------- LIST ----------

    @Override
    public ResponseEntity<DefaultResponse<DocumentoListDto>> list(DefaultFilter filtro) {
        List<DocumentoListDto> arrayList = new ArrayList<>();
        long totalRecords;
        String texto = filtro.getTexto() != null ? filtro.getTexto() : "";

        String sql = "SELECT d.docid, d.docfecemi, d.docnrocompleto, t.timnumero, " +
                "       d.docliruc AS ruc, " +
                "       d.doclirazon, d.doccondvta, d.docmoneda, d.doctotal, d.docestado " +
                "FROM public.documento d " +
                "INNER JOIN public.timbrado t ON t.timid = d.doctimbrado " +
                "WHERE (d.docnrocompleto ILIKE ? OR d.doclirazon ILIKE ? OR d.docliruc ILIKE ?) " +
                "ORDER BY d.docfecemi DESC, d.docid DESC " +
                "LIMIT ? OFFSET ?";

        String countSql = "SELECT count(*) AS totalRecords FROM public.documento d " +
                "WHERE (d.docnrocompleto ILIKE ? OR d.doclirazon ILIKE ? OR d.docliruc ILIKE ?)";

        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)
        ) {
            stmt.setString(1, "%" + texto + "%");
            stmt.setString(2, "%" + texto + "%");
            stmt.setString(3, "%" + texto + "%");
            stmt.setLong(4, filtro.getLimit());
            stmt.setLong(5, filtro.getOffset());

            stmtCount.setString(1, "%" + texto + "%");
            stmtCount.setString(2, "%" + texto + "%");
            stmtCount.setString(3, "%" + texto + "%");
            try (ResultSet rsC = stmtCount.executeQuery()) {
                rsC.next();
                totalRecords = rsC.getLong("totalRecords");
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    DocumentoListDto dto = new DocumentoListDto();
                    dto.setDocid(rs.getLong("docid"));
                    Timestamp fecEmi = rs.getTimestamp("docfecemi");
                    dto.setFecha(fecEmi != null ? fecEmi.toLocalDateTime() : null);
                    dto.setComprobante(rs.getString("docnrocompleto"));
                    dto.setTimbrado(rs.getString("timnumero"));
                    dto.setRuc(rs.getString("ruc"));
                    dto.setCliente(rs.getString("doclirazon"));
                    dto.setCondicion(rs.getString("doccondvta"));
                    dto.setMoneda(rs.getString("docmoneda"));
                    dto.setTotal(rs.getDouble("doctotal"));
                    dto.setEstado(rs.getString("docestado"));
                    arrayList.add(dto);
                }
            }
            return ResponseBuilder.ok(arrayList, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // ---------- GET BY ID ----------

    @Override
    public ResponseEntity<DefaultResponse<Documento>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.documento WHERE docid = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Documento doc = mapDocumento(rs);
                    doc.setDetalle(loadDetalle(conn, id));
                    return ResponseBuilder.ok(doc);
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Documento no encontrado.");
    }

    // ---------- INSERT ----------

    @Override
    public ResponseEntity<DefaultResponse<Documento>> insert(Documento documento) {
        if (documento.getDetalle() == null || documento.getDetalle().isEmpty()) {
            return ResponseBuilder.error("El documento debe tener al menos una línea de detalle.", HttpStatus.BAD_REQUEST);
        }
        if (documento.getDoctipdoc() == null || documento.getDoctimbrado() <= 0) {
            return ResponseBuilder.error("doctipdoc y doctimbrado son obligatorios.", HttpStatus.BAD_REQUEST);
        }
        if (documento.getDocliruc() == null || documento.getDocliruc().isBlank()) {
            return ResponseBuilder.error("docliruc es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        if (documento.getDoclirazon() == null || documento.getDoclirazon().isBlank()) {
            return ResponseBuilder.error("doclirazon es obligatorio.", HttpStatus.BAD_REQUEST);
        }

        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            // 1. Reservar número correlativo llamando a la función del BD
            int docnumero;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT public.fn_timbrado_siguiente_numero(?::integer)")) {
                stmt.setLong(1, documento.getDoctimbrado());
                try (ResultSet rs = stmt.executeQuery()) {
                    rs.next();
                    docnumero = rs.getInt(1);
                }
            }
            documento.setDocnumero(docnumero);

            // 2. Snapshot del timbrado: establecimiento, punto de expedición y modalidad
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT timestab, timpunexp, timmodalid FROM public.timbrado WHERE timid = ?")) {
                stmt.setLong(1, documento.getDoctimbrado());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) throw new IllegalArgumentException("Timbrado inexistente.");
                    documento.setDocestab(rs.getString("timestab"));
                    documento.setDocpunexp(rs.getString("timpunexp"));
                    documento.setDocmodalid(rs.getString("timmodalid"));
                }
            }

            // 2.5. Resolver id del cliente por RUC (crear si no existe)
            long cliid = resolveClienteId(conn, documento.getDocliruc(), documento.getDoclirazon());
            documento.setDoccliid(cliid);

            // 3. Insertar cabecera
            long docid;
            try (PreparedStatement stmt = conn.prepareStatement(INSERT_DOCUMENTO_SQL,
                    PreparedStatement.RETURN_GENERATED_KEYS)
            ) {
                bindDocumento(stmt, documento);
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    rs.next();
                    docid = rs.getLong("docid");
                }
            }
            documento.setDocid(docid);

            // 4. Insertar detalle en batch
            insertDetalle(conn, docid, documento.getDetalle());

            conn.commit();

            // 5. Recargar completo (incluye docnrocompleto GENERATED, doccreated, docupdated)
            return getById(docid);

        } catch (IllegalArgumentException e) {
            rollback(conn);
            return ResponseBuilder.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException: ", e);
            // Los errores de constraint del BD (rango de timbrado, IVA coherente, etc.) llegan acá
            return ResponseBuilder.error("Error al emitir documento: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    // ---------- ANULAR ----------

    @Override
    public ResponseEntity<DefaultResponse<String>> anular(long id, String motivo) {
        if (motivo == null || motivo.isBlank()) {
            return ResponseBuilder.error("El motivo de anulación es obligatorio.", HttpStatus.BAD_REQUEST);
        }

        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmtSel = conn.prepareStatement(
                     "SELECT docestado FROM public.documento WHERE docid = ?");
             PreparedStatement stmtUpd = conn.prepareStatement("UPDATE public.documento SET " +
                     "docestado = ?, docmotanul = ?, docfecanul = NOW() WHERE docid = ?")
        ) {
            stmtSel.setLong(1, id);
            try (ResultSet rs = stmtSel.executeQuery()) {
                if (!rs.next()) {
                    return ResponseBuilder.error("Documento no encontrado.", HttpStatus.NOT_FOUND);
                }
                if (ESTADO_ANULADO.equals(rs.getString("docestado"))) {
                    return ResponseBuilder.error("El documento ya está anulado.", HttpStatus.BAD_REQUEST);
                }
            }

            stmtUpd.setString(1, ESTADO_ANULADO);
            stmtUpd.setString(2, motivo);
            stmtUpd.setLong(3, id);
            stmtUpd.execute();

            return ResponseBuilder.ok("Documento anulado correctamente.");
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // ---------- Detalle (hijos) ----------

    private void insertDetalle(Connection conn, long docid, List<DocumentoDetalle> detalle) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement(INSERT_DETALLE_SQL)) {
            for (DocumentoDetalle d : detalle) {
                d.setDoddocid(docid);
                bindDetalle(stmt, d);
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    /**
     * Busca el cliente por RUC. Si existe, devuelve su cliid. Si no existe,
     * lo crea con el RUC y nombre recibidos (tipo_documento por defecto = 1 = RUC)
     * dentro de la misma transacción del documento.
     */
    private long resolveClienteId(Connection conn, String cliruc, String clinom) throws SQLException {
        // 1. ¿Ya existe?
        try (PreparedStatement stmt = conn.prepareStatement("SELECT cliid FROM public.cliente WHERE cliruc = ?")) {
            stmt.setString(1, cliruc);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getLong("cliid");
            }
        }
        // 2. No existe: crearlo con lo mínimo (defaults del DDL cubren el resto)
        try (PreparedStatement stmt = conn.prepareStatement(
                "INSERT INTO public.cliente(cliruc, clinom, tipo_documento) VALUES (?, ?, ?);",
                PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setString(1, cliruc);
            stmt.setString(2, clinom);
            stmt.setInt(3, 9);  // 9 = RUC
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                return rs.getLong("cliid");
            }
        }
    }

    private List<DocumentoDetalle> loadDetalle(Connection conn, long docid) throws SQLException {
        List<DocumentoDetalle> lista = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(
                "SELECT * FROM public.documento_detalle WHERE doddocid = ? ORDER BY dodorden")
        ) {
            stmt.setLong(1, docid);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapDetalle(rs));
                }
            }
        }
        return lista;
    }

    // ---------- SQL constantes ----------

    private static final String INSERT_DOCUMENTO_SQL = "INSERT INTO public.documento(" +
            "doctipdoc, doctimbrado, docestab, docpunexp, docnumero, docmodalid, doccontingen, " +
            "docfecemi, docfecvto, doccliid, doccajaap, " +
            "doclirazon, docliruc, doclidirec, " +
            "doccondvta, doccuotas, docmoneda, doctipcambio, " +
            "docexentas, docexoneradas, docgravada5, docgravada10, dociva5, dociva10, doctotiva, doctotdesc, doctotal, " +
            "docestado, docobserva, docusucrea) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    private static final String INSERT_DETALLE_SQL = "INSERT INTO public.documento_detalle(" +
            "doddocid, dodorden, dodproid, dodcodigo, doddescri, dodunimed, " +
            "dodcantidad, dodpreuni, doddescuni, " +
            "dodafectiva, dodtasaiva, dodpropiva, " +
            "dodbaseimp, dodmontoiva, dodsubtotal, dodlote, dodfecvto) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // ---------- Bindings ----------

    private void bindDocumento(PreparedStatement stmt, Documento d) throws SQLException {
        int i = 1;
        stmt.setString(i++, d.getDoctipdoc());
        stmt.setLong(i++, d.getDoctimbrado());
        stmt.setString(i++, d.getDocestab());
        stmt.setString(i++, d.getDocpunexp());
        stmt.setInt(i++, d.getDocnumero());
        stmt.setString(i++, d.getDocmodalid());
        stmt.setBoolean(i++, d.isDoccontingen());

        stmt.setTimestamp(i++, d.getDocfecemi() != null ? Timestamp.valueOf(d.getDocfecemi()) : Timestamp.valueOf(java.time.LocalDateTime.now()));
        stmt.setDate(i++, d.getDocfecvto() != null ? Date.valueOf(d.getDocfecvto()) : null);
        stmt.setLong(i++, d.getDoccliid());
        stmt.setObject(i++, d.getDoccajaap());

        stmt.setString(i++, d.getDoclirazon());
        stmt.setString(i++, d.getDocliruc());
        stmt.setString(i++, d.getDoclidirec());

        stmt.setString(i++, d.getDoccondvta());
        stmt.setInt(i++, d.getDoccuotas());
        stmt.setString(i++, d.getDocmoneda());
        stmt.setDouble(i++, d.getDoctipcambio() > 0 ? d.getDoctipcambio() : 1.0);

        stmt.setDouble(i++, d.getDocexentas());
        stmt.setDouble(i++, d.getDocexoneradas());
        stmt.setDouble(i++, d.getDocgravada5());
        stmt.setDouble(i++, d.getDocgravada10());
        stmt.setDouble(i++, d.getDociva5());
        stmt.setDouble(i++, d.getDociva10());
        stmt.setDouble(i++, d.getDoctotiva());
        stmt.setDouble(i++, d.getDoctotdesc());
        stmt.setDouble(i++, d.getDoctotal());

        stmt.setString(i++, d.getDocestado() != null ? d.getDocestado() : ESTADO_EMITIDO);
        stmt.setString(i++, d.getDocobserva());
        stmt.setObject(i++, d.getDocusucrea());
    }

    private void bindDetalle(PreparedStatement stmt, DocumentoDetalle d) throws SQLException {
        int i = 1;
        stmt.setLong(i++, d.getDoddocid());
        stmt.setInt(i++, d.getDodorden());
        stmt.setObject(i++, d.getDodproid());
        stmt.setString(i++, d.getDodcodigo());
        stmt.setString(i++, d.getDoddescri());
        stmt.setObject(i++, d.getDodunimed());
        stmt.setDouble(i++, d.getDodcantidad());
        stmt.setDouble(i++, d.getDodpreuni());
        stmt.setDouble(i++, d.getDoddescuni());
        stmt.setInt(i++, d.getDodafectiva());
        stmt.setInt(i++, d.getDodtasaiva());
        stmt.setDouble(i++, d.getDodpropiva() > 0 ? d.getDodpropiva() : 100.0);
        stmt.setDouble(i++, d.getDodbaseimp());
        stmt.setDouble(i++, d.getDodmontoiva());
        stmt.setDouble(i++, d.getDodsubtotal());
        stmt.setString(i++, d.getDodlote());
        stmt.setDate(i++, d.getDodfecvto() != null ? Date.valueOf(d.getDodfecvto()) : null);
    }

    // ---------- Mappings ----------

    private Documento mapDocumento(ResultSet rs) throws SQLException {
        Documento d = new Documento();
        d.setDocid(rs.getLong("docid"));
        d.setDoctipdoc(rs.getString("doctipdoc"));
        d.setDoctimbrado(rs.getLong("doctimbrado"));
        d.setDocestab(rs.getString("docestab"));
        d.setDocpunexp(rs.getString("docpunexp"));
        d.setDocnumero(rs.getInt("docnumero"));
        d.setDocnrocompleto(rs.getString("docnrocompleto"));
        d.setDocmodalid(rs.getString("docmodalid"));
        d.setDoccontingen(rs.getBoolean("doccontingen"));

        Timestamp fecemi = rs.getTimestamp("docfecemi");
        d.setDocfecemi(fecemi != null ? fecemi.toLocalDateTime() : null);
        Date fecvto = rs.getDate("docfecvto");
        d.setDocfecvto(fecvto != null ? fecvto.toLocalDate() : null);

        d.setDoccliid(rs.getLong("doccliid"));
        long doccajaap = rs.getLong("doccajaap");
        d.setDoccajaap(rs.wasNull() ? null : doccajaap);

        d.setDoclirazon(rs.getString("doclirazon"));
        d.setDocliruc(rs.getString("docliruc"));
        d.setDoclidirec(rs.getString("doclidirec"));

        d.setDoccondvta(rs.getString("doccondvta"));
        d.setDoccuotas(rs.getInt("doccuotas"));
        d.setDocmoneda(rs.getString("docmoneda"));
        d.setDoctipcambio(rs.getDouble("doctipcambio"));

        d.setDocexentas(rs.getDouble("docexentas"));
        d.setDocexoneradas(rs.getDouble("docexoneradas"));
        d.setDocgravada5(rs.getDouble("docgravada5"));
        d.setDocgravada10(rs.getDouble("docgravada10"));
        d.setDociva5(rs.getDouble("dociva5"));
        d.setDociva10(rs.getDouble("dociva10"));
        d.setDoctotiva(rs.getDouble("doctotiva"));
        d.setDoctotdesc(rs.getDouble("doctotdesc"));
        d.setDoctotal(rs.getDouble("doctotal"));

        d.setDocestado(rs.getString("docestado"));
        d.setDocmotanul(rs.getString("docmotanul"));
        Timestamp fecanul = rs.getTimestamp("docfecanul");
        d.setDocfecanul(fecanul != null ? fecanul.toLocalDateTime() : null);
        d.setDocusuanul((Integer) rs.getObject("docusuanul"));

        d.setDocobserva(rs.getString("docobserva"));
        Timestamp created = rs.getTimestamp("doccreated");
        d.setDoccreated(created != null ? created.toLocalDateTime() : null);
        Timestamp updated = rs.getTimestamp("docupdated");
        d.setDocupdated(updated != null ? updated.toLocalDateTime() : null);
        d.setDocusucrea((Integer) rs.getObject("docusucrea"));

        return d;
    }

    private DocumentoDetalle mapDetalle(ResultSet rs) throws SQLException {
        DocumentoDetalle d = new DocumentoDetalle();
        d.setDodid(rs.getLong("dodid"));
        d.setDoddocid(rs.getLong("doddocid"));
        d.setDodorden(rs.getInt("dodorden"));
        long dodproid = rs.getLong("dodproid");
        d.setDodproid(rs.wasNull() ? null : dodproid);
        d.setDodcodigo(rs.getString("dodcodigo"));
        d.setDoddescri(rs.getString("doddescri"));
        d.setDodunimed((Integer) rs.getObject("dodunimed"));
        d.setDodcantidad(rs.getDouble("dodcantidad"));
        d.setDodpreuni(rs.getDouble("dodpreuni"));
        d.setDoddescuni(rs.getDouble("doddescuni"));
        d.setDodafectiva(rs.getInt("dodafectiva"));
        d.setDodtasaiva(rs.getInt("dodtasaiva"));
        d.setDodpropiva(rs.getDouble("dodpropiva"));
        d.setDodbaseimp(rs.getDouble("dodbaseimp"));
        d.setDodmontoiva(rs.getDouble("dodmontoiva"));
        d.setDodsubtotal(rs.getDouble("dodsubtotal"));
        d.setDodlote(rs.getString("dodlote"));
        Date fecvto = rs.getDate("dodfecvto");
        d.setDodfecvto(fecvto != null ? fecvto.toLocalDate() : null);
        return d;
    }

    // ---------- helpers ----------

    private void rollback(Connection conn) {
        if (conn != null) {
            try { conn.rollback(); } catch (SQLException ex) { log.error("Error en rollback: ", ex); }
        }
    }

    private void close(Connection conn) {
        if (conn != null) {
            try { conn.close(); } catch (SQLException ex) { log.error("Error al cerrar conexión: ", ex); }
        }
    }
}
