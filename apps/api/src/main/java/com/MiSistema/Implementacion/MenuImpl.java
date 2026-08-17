package com.MiSistema.Implementacion;

import com.MiSistema.Connection.ConnectionU;
import com.MiSistema.ModelsDto.Menu.MenuModuleDto;
import com.MiSistema.ModelsDto.Menu.MenuOptionDto;
import com.MiSistema.Services.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Resuelve el menú del usuario a partir de la cadena:
 *   usuario → licencia → plan → opciones del plan → módulo de cada opción.
 *
 * Las tablas (usuarios, licencias, plan_system_option, system_option, modulo) viven
 * en la BD de licencias, por eso se usa ConnectionU.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MenuImpl implements MenuService {

    private final ConnectionU connectionU;

    @Override
    public List<MenuModuleDto> byUser(long idUsuario) {
        String sqlPlan = """
                SELECT l.plan_id
                FROM public.usuarios u
                JOIN public.licencias l ON l.id_licencia = u.id_licencia
                WHERE u.id_usuario = ?
                """;

        try (Connection conn = connectionU.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlPlan)) {

            stmt.setLong(1, idUsuario);

            Long planId = null;
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    long pid = rs.getLong("plan_id");
                    if (!rs.wasNull()) planId = pid;
                } else {
                    throw new RuntimeException("Usuario no encontrado: " + idUsuario);
                }
            }

            // Licencia sin plan → menú vacío sin error.
            if (planId == null) return new ArrayList<>();

            return byPlan(planId);
        } catch (SQLException e) {
            log.error("SQLException resolviendo menú para usuario {}: ", idUsuario, e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<MenuModuleDto> byPlan(long planId) {
        String sql = """
                SELECT
                    so.option_key,
                    m.modulo_nombre   AS module_name,
                    m.sort_order      AS module_sort_order,
                    so.option_name,
                    so.route_path,
                    so.icon_name,
                    so.sort_order     AS option_sort_order
                FROM public.plan_system_option pso
                JOIN public.system_option so ON so.id = pso.system_option_id
                JOIN public.modulo m         ON m.modulo_id = so.module_id
                WHERE pso.plan_id = ?
                  AND pso.enabled = TRUE
                  AND so.active   = TRUE
                ORDER BY m.sort_order, m.modulo_nombre, so.sort_order, so.option_name
                """;

        try (Connection conn = connectionU.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, planId);

            // LinkedHashMap preserva el orden de inserción → respeta el ORDER BY.
            Map<String, MenuModuleDto> grouped = new LinkedHashMap<>();

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String module = rs.getString("module_name");
                    long moduleSortOrder = rs.getLong("module_sort_order");

                    MenuOptionDto opt = new MenuOptionDto(
                            rs.getString("option_key"),
                            module,
                            rs.getString("option_name"),
                            rs.getString("route_path"),
                            rs.getString("icon_name"),
                            rs.getInt("option_sort_order")
                    );

                    grouped.computeIfAbsent(module,
                            k -> new MenuModuleDto(k, moduleSortOrder, new ArrayList<>())
                    ).getChildren().add(opt);
                }
            }

            return new ArrayList<>(grouped.values());
        } catch (SQLException e) {
            log.error("SQLException resolviendo menú para plan {}: ", planId, e);
            throw new RuntimeException(e);
        }
    }
}
