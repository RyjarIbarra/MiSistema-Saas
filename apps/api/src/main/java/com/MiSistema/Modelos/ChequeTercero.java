package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Cheque recibido de un tercero. Es cartera: no afecta el banco hasta depositarse. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChequeTercero {
    private long chtid;
    private long chtbanid;         // FK banco girado
    private String chtnumero;
    private String chtcuenta;
    private String chtlibrador;
    private String chtlibruc;
    private boolean chtdiferido;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chtfecemi;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chtfecpago;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chtfecrec;
    private BigDecimal chtimporte;
    private String chtmoneda;      // FK moneda
    private Long chtcliid;         // FK cliente (opcional)
    private String chtestado;      // CARTERA, DEPOSITADO, ACREDITADO, ENDOSADO, RECHAZADO, DEVUELTO
    private Long chtcbaid;         // cuenta de depósito
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chtfecdep;
    private String chtendosado;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chtfecendo;
    private Long chtopaid;         // orden de pago del endoso (Fase 2d)
    private String chtmotivo;
    private Long chtmbadep;        // movimiento de depósito
    private Long chtmbarech;       // movimiento de reversión (rechazo)
    private String chtrefint;
    private String chtobserva;
    private LocalDateTime chtcreated;
    private Integer chtusucrea;

    // Solo lectura (del JOIN)
    private String bannombre;
    private String clinombre;
    private String cbaalias;
}
