package com.MiSistema.Implementacion;

import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Precio_Producto;
import com.MiSistema.Modelos.Producto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Migracion.MigracionFilaError;
import com.MiSistema.ModelsDto.Migracion.MigracionResultadoDto;
import com.MiSistema.Services.ProductoMigracionService;
import com.MiSistema.Services.ProductoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductoMigracionImpl implements ProductoMigracionService {

    private final ProductoService productoService;

    // Orden de columnas del Excel (0-indexed)
    private static final int COL_GTIN                = 0;
    private static final int COL_GTIN_PAQUETE        = 1;
    private static final int COL_PRODESC             = 2;
    private static final int COL_TIPO_PRODUCTO       = 3;
    private static final int COL_UNIDAD              = 4;
    private static final int COL_CATEGORIA           = 5;
    private static final int COL_MARCA               = 6;
    private static final int COL_UBICACION           = 7;
    private static final int COL_AFECTACION_IVA      = 8;
    private static final int COL_TASA_IVA            = 9;
    private static final int COL_PROPORCION_IVA      = 10;
    private static final int COL_APLICA_ISC          = 11;
    private static final int COL_TASA_ISC            = 12;
    private static final int COL_PROPORCION_ISC      = 13;
    private static final int COL_NCM                 = 14;
    private static final int COL_PARTIDA_ARANCELARIA = 15;
    private static final int COL_PAIS_ORIGEN         = 16;
    private static final int COL_DNCP_GENERAL        = 17;
    private static final int COL_DNCP_ESPECIFICO     = 18;
    private static final int COL_CTRLSTOCK           = 19;
    private static final int COL_MODDESC             = 20;
    private static final int COL_MODPREC             = 21;
    private static final int COL_STOCKNEGATIVO       = 22;
    private static final int COL_ACTIVO              = 23;
    private static final int COL_PROOBS              = 24;
    private static final int COL_PRECIO_CASUAL       = 25;  // tipoprecio.tipid = 1
    private static final int COL_PRECIO_CLIENTE      = 26;  // tipoprecio.tipid = 2
    private static final int COL_PRECIO_MAYORISTA    = 27;  // tipoprecio.tipid = 3

    private static final String TEMPLATE_PATH = "templates/producto-migracion-demo.xlsx";

    @Override
    public ResponseEntity<DefaultResponse<MigracionResultadoDto>> migrate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseBuilder.error("Archivo vacío o no enviado.");
        }
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!filename.endsWith(".xls") && !filename.endsWith(".xlsx")) {
            return ResponseBuilder.error("Formato no soportado. Solo .xls o .xlsx.");
        }

        MigracionResultadoDto resultado = new MigracionResultadoDto(0, 0, 0, new ArrayList<>(), new ArrayList<>());

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)
        ) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();

            // fila 0 = headers, datos desde fila 1
            for (int rowIdx = 1; rowIdx <= lastRow; rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null || isRowEmpty(row)) continue;

                resultado.setTotalRegistros(resultado.getTotalRegistros() + 1);
                String prodescPreview = getString(row, COL_PRODESC);

                try {
                    Producto producto = parseRow(row);
                    ResponseEntity<DefaultResponse<Producto>> insertResp = productoService.insert(producto);
                    DefaultResponse<Producto> body = insertResp.getBody();

                    if (body != null && body.isSuccess() && body.getData() != null) {
                        resultado.setExitosos(resultado.getExitosos() + 1);
                        resultado.getIdsCreados().add(body.getData().getProid());
                    } else {
                        resultado.setFallidos(resultado.getFallidos() + 1);
                        String err = body != null && body.getError() != null ? body.getError() : "Insert falló sin detalle.";
                        resultado.getErrores().add(new MigracionFilaError(rowIdx + 1, prodescPreview, err));
                    }
                } catch (Exception e) {
                    resultado.setFallidos(resultado.getFallidos() + 1);
                    String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
                    resultado.getErrores().add(new MigracionFilaError(rowIdx + 1, prodescPreview, msg));
                    log.warn("Error en fila {}: {}", rowIdx + 1, msg);
                }
            }
            return ResponseBuilder.ok(resultado);
        } catch (IOException e) {
            log.error("Error leyendo archivo Excel: ", e);
            return ResponseBuilder.error("Error leyendo el archivo: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadTemplate() {
        try (InputStream is = new ClassPathResource(TEMPLATE_PATH).getInputStream()) {
            byte[] bytes = is.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(org.springframework.http.ContentDisposition
                    .attachment().filename("producto-migracion-demo.xlsx").build());

            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error leyendo template de migración: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ---------- Parseo de una fila a Producto ----------

    private Producto parseRow(Row row) {
        Producto p = new Producto();

        p.setGtin(getString(row, COL_GTIN));
        p.setGtin_paquete(getString(row, COL_GTIN_PAQUETE));

        String prodesc = getString(row, COL_PRODESC);
        if (prodesc == null || prodesc.isBlank()) {
            throw new IllegalArgumentException("prodesc es obligatorio.");
        }
        p.setProdesc(prodesc);

        Integer tipoProducto = getInt(row, COL_TIPO_PRODUCTO);
        if (tipoProducto == null) throw new IllegalArgumentException("tipo_producto es obligatorio (1 o 2).");
        p.setTipo_producto(tipoProducto);

        String unidad = getString(row, COL_UNIDAD);
        if (unidad == null || unidad.isBlank()) throw new IllegalArgumentException("unidad es obligatoria (código).");
        p.setUnidad(unidad);

        p.setCategoria(getInt(row, COL_CATEGORIA));
        p.setMarca(getInt(row, COL_MARCA));
        p.setUbicacion(getInt(row, COL_UBICACION));

        Integer afectacion = getInt(row, COL_AFECTACION_IVA);
        if (afectacion == null) throw new IllegalArgumentException("afectacion_iva es obligatoria (1-4).");
        p.setAfectacion_iva(afectacion);

        Double tasaIva = getDouble(row, COL_TASA_IVA);
        if (tasaIva == null) throw new IllegalArgumentException("tasa_iva es obligatoria (0, 5 o 10).");
        p.setTasa_iva(tasaIva);

        Double propIva = getDouble(row, COL_PROPORCION_IVA);
        p.setProporcion_iva(propIva != null ? propIva : 100.0);

        Boolean aplicaIsc = getBoolean(row, COL_APLICA_ISC);
        p.setAplica_isc(aplicaIsc != null && aplicaIsc);
        Double tasaIsc = getDouble(row, COL_TASA_ISC);
        p.setTasa_isc(tasaIsc != null ? tasaIsc : 0.0);
        Double propIsc = getDouble(row, COL_PROPORCION_ISC);
        p.setProporcion_isc(propIsc != null ? propIsc : 0.0);

        p.setNcm(getString(row, COL_NCM));
        p.setPartida_arancelaria(getString(row, COL_PARTIDA_ARANCELARIA));
        String pais = getString(row, COL_PAIS_ORIGEN);
        p.setPais_origen(pais != null ? pais : "PRY");

        p.setDncp_nivel_general(getString(row, COL_DNCP_GENERAL));
        p.setDncp_nivel_especifico(getString(row, COL_DNCP_ESPECIFICO));

        Boolean ctrlstock = getBoolean(row, COL_CTRLSTOCK);
        p.setCtrlstock(ctrlstock == null || ctrlstock);  // default true
        Boolean moddesc = getBoolean(row, COL_MODDESC);
        p.setModdesc(moddesc == null || moddesc);
        Boolean modprec = getBoolean(row, COL_MODPREC);
        p.setModprec(modprec == null || modprec);
        Boolean stockneg = getBoolean(row, COL_STOCKNEGATIVO);
        p.setStocknegativo(stockneg != null && stockneg);
        Boolean activo = getBoolean(row, COL_ACTIVO);
        p.setActivo(activo == null || activo);  // default true

        String obs = getString(row, COL_PROOBS);
        p.setProobs(obs != null ? obs : "");

        // precios (opcionales — siempre PYG, estado=true)
        List<Precio_Producto> precios = new ArrayList<>();
        addPrecio(precios, row, COL_PRECIO_CASUAL,    1);
        addPrecio(precios, row, COL_PRECIO_CLIENTE,   2);
        addPrecio(precios, row, COL_PRECIO_MAYORISTA, 3);
        p.setPrecioList(precios);

        return p;
    }

    private void addPrecio(List<Precio_Producto> precios, Row row, int col, long tipoId) {
        Double precio = getDouble(row, col);
        if (precio == null) return;
        Precio_Producto pp = new Precio_Producto();
        pp.setTipo(tipoId);
        pp.setMoneda("PYG");
        pp.setPrecio(precio);
        pp.setEstado(true);
        precios.add(pp);
    }

    // ---------- Lectores de celda con manejo robusto ----------

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String s = getString(row, c);
                if (s != null && !s.isBlank()) return false;
            }
        }
        return true;
    }

    private String getString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> {
                String v = cell.getStringCellValue();
                yield v != null && !v.isBlank() ? v.trim() : null;
            }
            case NUMERIC -> {
                double d = cell.getNumericCellValue();
                if (d == Math.floor(d)) yield String.valueOf((long) d);
                yield String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield cell.getStringCellValue().trim(); }
                catch (Exception e) { yield String.valueOf(cell.getNumericCellValue()); }
            }
            default -> null;
        };
    }

    private Integer getInt(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
            String s = getString(row, col);
            if (s == null || s.isBlank()) return null;
            return Integer.parseInt(s.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Columna " + (col + 1) + ": valor numérico inválido.");
        }
    }

    private Double getDouble(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
            String s = getString(row, col);
            if (s == null || s.isBlank()) return null;
            return Double.parseDouble(s.trim().replace(",", "."));
        } catch (Exception e) {
            throw new IllegalArgumentException("Columna " + (col + 1) + ": valor decimal inválido.");
        }
    }

    private Boolean getBoolean(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;
        if (cell.getCellType() == CellType.BOOLEAN) return cell.getBooleanCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue() != 0;
        String s = getString(row, col);
        if (s == null || s.isBlank()) return null;
        String v = s.trim().toLowerCase();
        return switch (v) {
            case "true", "verdadero", "si", "sí", "1", "x" -> true;
            case "false", "falso", "no", "0" -> false;
            default -> null;
        };
    }
}
