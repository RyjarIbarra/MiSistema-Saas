package com.MiSistemaReport.ModelsDto.Login;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BDetails {
    private String host;
    private long port;
    private String user;
    private String password;
}
