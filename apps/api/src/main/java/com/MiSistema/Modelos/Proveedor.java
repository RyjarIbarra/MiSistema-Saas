package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Proveedor {
    private long prvid;

    // Identificación
    private String prvrazon;
    private String prvruc;              // RUC con DV
    private int prv_contrib;            // 1 física, 2 jurídica
    private int prv_naturaleza;         // 1 contribuyente, 2 no contribuyente
    private Integer tipo_documento;     // nullable

    // Contacto
    private String prvtelefono;
    private String prvemail;
    private String prvcontacto;

    // Estado y auditoría
    private String prvobserva;
    private LocalDateTime prvcreated;   // solo lectura (DB default NOW())
}
