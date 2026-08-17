package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EmpresaConfiguracion {
    private long id;

    // Datos fiscales
    private String ruc;
    private String dv_ruc;
    private String razon_social;
    private String nombre_fantasia;
    private int tipo_contribuyente;   // 1=Física, 2=Jurídica
    private Integer tipo_regimen;     // nullable

    // Domicilio
    private String direccion;
    private String numero_casa;
    private int departamento_codigo;
    private String departamento_descripcion;
    private int distrito_codigo;
    private String distrito_descripcion;
    private int ciudad_codigo;
    private String ciudad_descripcion;

    // Contacto
    private String telefono;
    private String email;
    private String sitio_web;

    // Logo
    private String logo_ruta;

    // Facturación electrónica
    private boolean es_facturador_electronico;
    private String ambiente_sifen;   // TEST | PROD | null
    private String codigo_seguridad_contribuyente;

    // Configuración tributaria básica
    private String moneda_default;
    private boolean iva_incluido_default;
    private Integer tipo_transaccion;
    private Integer tipo_impuesto;

    // Control
    private String estado;
    private LocalDate fecha_inicio_actividades;

    // Auditoría
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    // Actividades económicas (hijas de la empresa)
    private List<EmpresaActividadEconomica> actividades;

    // Obligaciones (hijas de la empresa)
    private List<EmpresaObligacion> obligaciones;
}
