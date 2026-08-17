package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.TipoPrecio;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.TipoPrecioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoPrecioImpl implements TipoPrecioService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<TipoPrecio>> list(DefaultFilter defaultFilter) {
        List<TipoPrecio> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.tipoprecio where tipnom ilike ? order by tipid");
             PreparedStatement stmt_count = conn.prepareStatement("SELECT count(*) as totalRecords FROM public.tipoprecio where tipnom ilike ?")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(new TipoPrecio(rs.getLong("tipid"), rs.getString("tipnom")));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<TipoPrecio>> getById(long id) {
        TipoPrecio tipoPrecio = new TipoPrecio();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("select * from public.tipoprecio where tipid = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if(rs.next()) {
                    tipoPrecio.setTipid(rs.getLong("tipid"));
                    tipoPrecio.setTipnom(rs.getString("tipnom"));
                    return ResponseBuilder.ok(tipoPrecio);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Tipo Precio no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<TipoPrecio>> insert(TipoPrecio tipoPrecio) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.tipoprecio(tipnom) VALUES (?);", PreparedStatement.RETURN_GENERATED_KEYS);
        ) {
            stmt.setString(1, tipoPrecio.getTipnom());
            stmt.execute();

            try(ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                tipoPrecio.setTipid(rs.getLong("tipid"));
            }

            return ResponseBuilder.ok(tipoPrecio);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<TipoPrecio>> update(TipoPrecio tipoPrecio) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.tipoprecio \n" +
                     "SET tipnom=? \n" +
                     "WHERE tipid=?;")
        ) {

            stmt.setString(1, tipoPrecio.getTipnom());
            stmt.setLong(2, tipoPrecio.getTipid());
            stmt.execute();

            return ResponseBuilder.ok(tipoPrecio);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<TipoPrecio>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.tipoprecio \n" +
                     "WHERE tipid=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();

            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
