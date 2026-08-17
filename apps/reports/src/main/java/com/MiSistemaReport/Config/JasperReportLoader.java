package com.MiSistemaReport.Config;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JasperReportLoader {

    private static final String REPORTS_BASE = "reports/";

    private final ConcurrentHashMap<String, JasperReport> cache = new ConcurrentHashMap<>();

    public JasperReport load(String name) {
        return cache.computeIfAbsent(name, this::compile);
    }

    private JasperReport compile(String name) {
        String jrxmlPath = REPORTS_BASE + name + ".jrxml";
        ClassPathResource jrxml = new ClassPathResource(jrxmlPath);
        if (!jrxml.exists()) {
            throw new IllegalArgumentException("No se encontro el .jrxml del reporte '" + name
                    + "' en " + REPORTS_BASE);
        }
        try (InputStream in = jrxml.getInputStream()) {
            return JasperCompileManager.compileReport(in);
        } catch (Exception e) {
            throw new RuntimeException("Error compilando el .jrxml del reporte '" + name + "': "
                    + e.getMessage(), e);
        }
    }
}
