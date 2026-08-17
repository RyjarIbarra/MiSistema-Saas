package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.OptionsList;
import com.MiSistema.Services.OptionsService;
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
public class OptionsImpl implements OptionsService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<OptionsList>> listUnidad() {
        List<OptionsList> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.unidad_medida ORDER BY codigo")
        ) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(new OptionsList(rs.getString("codigo"), rs.getString("descripcion")));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<OptionsList>> listMoneda() {
        List<OptionsList> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.moneda WHERE activo = true ORDER BY codigo")
        ) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(new OptionsList(rs.getString("codigo"), rs.getString("descripcion")));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<OptionsList>> listTipoPrecio() {
        List<OptionsList> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.tipoprecio")
        ) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(new OptionsList(rs.getString("tipid"), rs.getString("tipnom")));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<OptionsList>> listAccess() {
        List<OptionsList> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT id, name FROM public.access ORDER BY name")
        ) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(new OptionsList(rs.getString("id"), rs.getString("name")));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<OptionsList>> listTipoDocumento() {
        List<OptionsList> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT tdocodigo, tdodescri FROM public.tipo_documento " +
                     "WHERE tdoactivo = true ORDER BY tdoorden, tdodescri")
        ) {
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(new OptionsList(rs.getString("tdocodigo"), rs.getString("tdodescri")));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
