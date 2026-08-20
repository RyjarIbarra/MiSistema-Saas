package com.MiSistemaReport;

import com.MiSistemaReport.ModelsDto.Report.Documento.KudeLineaDto;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifica los .jrxml sin necesitar base de datos ni contexto Spring:
 *  - kudeCompila: compila la plantilla (detecta errores de sintaxis JR).
 *  - kudeLlenaConQr: la llena con datos de ejemplo (incluido el QR) y exporta a PDF,
 *    ejercitando la generación real del QR por ZXing.
 */
class JrxmlCompileTest {

    private JasperReport compilar(String path) throws Exception {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(path)) {
            assertNotNull(in, "No se encontró el jrxml: " + path);
            return JasperCompileManager.compileReport(in);
        }
    }

    @Test
    void kudeCompila() throws Exception {
        compilar("reports/Documento/kude.jrxml");
    }

    @Test
    void kudeLlenaConQr() throws Exception {
        System.setProperty("java.awt.headless", "true");
        JasperReport report = compilar("reports/Documento/kude.jrxml");

        Map<String, Object> params = new HashMap<>();
        params.put("emiRazon", "EMPRESA DE PRUEBA S.A.");
        params.put("emiRuc", "80012345-6");
        params.put("docTipo", "FACTURA ELECTRÓNICA");
        params.put("docNro", "001-001-0000001");
        params.put("recRazon", "CLIENTE DE PRUEBA");
        params.put("total", new BigDecimal("150000"));
        params.put("totalLetras", "CIENTO CINCUENTA MIL GUARANÍES");
        params.put("cdc", "01800123456001001000000012024010112345678901");
        params.put("qr", "https://ekuatia.set.gov.py/consultas/qr?nVersion=150&Id=01800123456001001000000012024010112345678901&dFeEmiDE=abc&iTipEmi=1");

        List<KudeLineaDto> lineas = List.of(
                new KudeLineaDto(1, "001", "Producto de prueba",
                        new BigDecimal("1"), new BigDecimal("150000"),
                        BigDecimal.ZERO, 10, new BigDecimal("150000"))
        );

        JasperPrint print = JasperFillManager.fillReport(report, params, new JRBeanCollectionDataSource(lineas));
        byte[] pdf = JasperExportManager.exportReportToPdf(print);
        assertTrue(pdf.length > 1000, "El PDF del KuDE salió vacío o demasiado chico");
        // Deja un PDF de ejemplo en target/ (gitignored) para inspección visual.
        java.nio.file.Files.write(java.nio.file.Path.of("target/kude-sample.pdf"), pdf);
    }
}
