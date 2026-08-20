package com.MiSistema.ModelsDto.Banco;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Filtro para listar cheques (propios o de terceros) y chequeras. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChequeFiltro {
    private long cbaid;      // 0 = todas las cuentas
    private String estado;   // null/"" = todos los estados
    private String texto;
    private long limit;
    private long offset;
}
