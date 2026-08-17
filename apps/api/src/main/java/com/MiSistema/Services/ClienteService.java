package com.MiSistema.Services;

import com.MiSistema.Modelos.Cliente;

import java.sql.Connection;
import java.sql.SQLException;

public interface ClienteService extends DefaultService<Cliente>{

    /**
     * Resuelve el id de un cliente a partir de su RUC. Si el cliente ya existe devuelve su cliid;
     * si no existe lo crea con los datos mínimos y devuelve el cliid recién generado.
     *
     * Recibe la {@link Connection} del llamador a propósito: así la operación participa de la
     * transacción de quien la invoca (p. ej. la emisión de un documento) y no abre una propia.
     * Es el único punto autorizado para dar de alta un cliente desde otro dominio.
     */
    long resolverClienteId(Connection conn, String cliruc, String clinom) throws SQLException;
}
