package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Access {
    private long id;
    private String name;
    private String description;
    private boolean active;
    private List<AccessLevel> permissions;   // null en /list, poblado en /getById
}
