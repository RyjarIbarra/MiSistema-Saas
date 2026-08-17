package com.MiSistema.Services;

import com.MiSistema.Modelos.Producto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.VStockDetalladoFilter;
import com.MiSistema.ModelsDto.Venta.VentaPrecioProductoDto;
import com.MiSistema.ModelsDto.Venta.VentaPrecioProductoRequestDto;
import com.MiSistema.ModelsDto.View.ModalProducto;
import org.springframework.http.ResponseEntity;

public interface ProductoService extends DefaultService<Producto> {
    ResponseEntity<DefaultResponse<ModalProducto>> listModalProducto(VStockDetalladoFilter filtro);
    ResponseEntity<DefaultResponse<VentaPrecioProductoDto>> precioVenta(VentaPrecioProductoRequestDto request);
}
