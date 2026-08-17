package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Producto {
    private long proid;

    // Identificación
    private String gtin;                  // dGtin
    private String gtin_paquete;          // dGtinPq
    private String prodesc;               // dDesProSer

    // Tipo y clasificación
    private int tipo_producto;            // 1=Producto, 2=Servicio
    private String unidad;                // FK a unidad_medida(codigo) — cUniMed
    private Integer categoria;            // FK a categoria(cat_id)
    private Integer marca;                // FK a marca(mar_id)
    private Integer ubicacion;            // FK a ubicacion(ubi_id)

    // Tributario IVA
    private int afectacion_iva;           // iAfecIVA: 1=Gravado, 2=Exonerado, 3=Exento, 4=Gravado parcial
    private double tasa_iva;              // dTasaIVA: 0, 5 o 10
    private double proporcion_iva;        // dPropIVA: 0-100

    // Tributario ISC
    private boolean aplica_isc;
    private double tasa_isc;              // nullable
    private double proporcion_isc;        // nullable

    // Importados / Mercosur
    private String ncm;                   // dNCM
    private String partida_arancelaria;   // dParAranc
    private String pais_origen;           // cPaisOrig (default 'PRY')

    // B2G (Contrataciones públicas)
    private String dncp_nivel_general;    // dDncpG
    private String dncp_nivel_especifico; // dDncpE

    // Control operacional
    private boolean ctrlstock;
    private boolean moddesc;
    private boolean modprec;
    private boolean stocknegativo;
    private boolean activo;               // soft delete
    private String proobs;
    private LocalDateTime f_registro;     // solo lectura

    // Precios (lista hija)
    private List<Precio_Producto> precioList;
}
