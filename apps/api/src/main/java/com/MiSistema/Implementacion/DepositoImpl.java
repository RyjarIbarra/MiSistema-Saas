package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Deposito;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.DepositoService;
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
public class DepositoImpl implements DepositoService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Deposito>> list(DefaultFilter defaultFilter) {
        List<Deposito> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.deposito where depnom ilike ? order by depid");
             PreparedStatement stmt_count = conn.prepareStatement("SELECT count(*) as totalRecords FROM public.deposito where depnom ilike ?")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(new Deposito(rs.getLong("depid"), rs.getString("depnom"), rs.getString("depdir"), rs.getString("deptel")));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Deposito>> getById(long depid) {
        Deposito deposito = new Deposito();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("select * from public.deposito where depid = ?")
        ) {
            stmt.setLong(1, depid);
            try (ResultSet rs = stmt.executeQuery()) {
                if(rs.next()) {
                    deposito.setDepid(rs.getLong("depid"));
                    deposito.setDepnom(rs.getString("depnom"));
                    deposito.setDepdir(rs.getString("depdir"));
                    deposito.setDeptel(rs.getString("deptel"));
                    return ResponseBuilder.ok(deposito);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Deposito no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Deposito>> insert(Deposito deposito) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.deposito(depnom, depdir, deptel) VALUES (?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS);
        ) {
            stmt.setString(1, deposito.getDepnom());
            stmt.setString(2, deposito.getDepdir());
            stmt.setString(3, deposito.getDeptel());
            stmt.execute();

            try(ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                deposito.setDepid(rs.getLong("depid"));
            }

            return ResponseBuilder.ok(deposito);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Deposito>> update(Deposito deposito) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.deposito \n" +
                     "SET depnom=?, depdir=?, deptel=? \n" +
                     "WHERE depid=?;")
        ) {

            stmt.setString(1, deposito.getDepnom());
            stmt.setString(2, deposito.getDepdir());
            stmt.setString(3, deposito.getDeptel());
            stmt.setLong(4, deposito.getDepid());
            stmt.execute();

            return ResponseBuilder.ok(deposito);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Deposito>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.deposito \n" +
                     "WHERE depid=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();

            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
