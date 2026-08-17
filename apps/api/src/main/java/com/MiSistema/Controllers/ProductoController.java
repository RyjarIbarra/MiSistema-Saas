package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Producto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.ModelsDto.Filter.VStockDetalladoFilter;
import com.MiSistema.ModelsDto.Migracion.MigracionResultadoDto;
import com.MiSistema.ModelsDto.Venta.VentaPrecioProductoDto;
import com.MiSistema.ModelsDto.Venta.VentaPrecioProductoRequestDto;
import com.MiSistema.ModelsDto.View.ModalProducto;
import com.MiSistema.Services.ProductoMigracionService;
import com.MiSistema.Services.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin
@RestController
@RequestMapping("/producto")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;
    private final ProductoMigracionService productoMigracionService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Producto>> lista(@RequestBody DefaultFilter filtro) {
        return productoService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Producto>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return productoService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Producto>> insert(@RequestBody Producto producto) {
        return productoService.insert(producto);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Producto>> update(@RequestBody Producto producto) {
        return productoService.update(producto);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Producto>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return productoService.delete(id);
    }

    // ---------- Migración desde Excel ----------

    @PostMapping(value = "/migrate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DefaultResponse<MigracionResultadoDto>> migrate(@RequestParam("file") MultipartFile file) {
        return productoMigracionService.migrate(file);
    }

    @GetMapping("/migrate/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        return productoMigracionService.downloadTemplate();
    }

    // ---------- Vista v_stock_detallado ----------

    @PostMapping("/stockDetallado/list")
    public ResponseEntity<DefaultResponse<ModalProducto>> listModalProducto(@RequestBody VStockDetalladoFilter filtro) {
        return productoService.listModalProducto(filtro);
    }

    // ---------- Precio de venta ----------

    @PostMapping("/precioVenta")
    public ResponseEntity<DefaultResponse<VentaPrecioProductoDto>> precioVenta(@RequestBody VentaPrecioProductoRequestDto request) {
        System.out.println(request);
        return productoService.precioVenta(request);
    }

}
